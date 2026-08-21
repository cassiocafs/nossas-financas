# Auditoria de Performance — Nossas Finanças

Contexto: volume de dados médio em produção (centenas de usuários/espaços, dezenas de milhares de transações por espaço), com backend (Hostinger) e banco (Supabase) em redes distintas — toda ida ao banco tem latência real de rede, não é round-trip local.

## 1. Mapeamento & Gargalos

**O que já está bem resolvido** (vale reconhecer, para não retrabalhar): os agregados de saldo usam `groupBy` em vez de N+1 (`backend/src/modules/contas/contas.service.ts:26`), os índices em `Transacao` cobrem os filtros mais comuns (`backend/prisma/schema.prisma`), e a importação de planilha já insere em lotes de 500 via `createMany` (`backend/src/modules/importacao/importacao.service.ts:364`).

Os gargalos reais encontrados:

| # | Local | Tipo | Descrição |
|---|-------|------|-----------|
| A | `backend/src/middlewares/resolveEspaco.ts:28` | I/O bound | Toda requisição autenticada (contas, categorias, transações, orçamento, regras) dispara um `SELECT` extra em `membroEspaco` cruzando a rede Hostinger→Supabase, só para resolver um valor (`espacoId`) que raríssimamente muda. |
| B | `frontend/src/pages/HomePage.tsx` + `TransacoesRecentesCard.tsx` | I/O + CPU bound | Ao abrir a Home, disparam ~7 requisições paralelas. Duas delas — `buscarResumoMensal` e `listarTransacoesMes` (via `TransacoesRecentesCard`) — buscam o mesmo mês de transações do banco duas vezes, só para a segunda exibir os 6 últimos itens no cliente. |
| C | `backend/src/app.ts` | I/O bound | Não há middleware de compressão (gzip/brotli) nas respostas Express. Payloads JSON de listagem de transações (com `include` de conta/categoria) trafegam sem compactação numa conexão que já não é local. |
| D | `backend/src/modules/orcamento/orcamento.service.ts:161-170` | CPU/memória | `montarGrade` carrega todas as despesas do mês inteiro em memória (`select: { data, valor }`) só para somar por dia — aceitável no volume atual, mas cresce linearmente sem paginação/streaming se o volume disparar. |
| E | `backend/src/modules/regras/regras.service.ts:149` | I/O bound | `aprenderComTransacao` roda um `upsert` a cada criação/edição de transação, de forma síncrona antes de responder ao cliente — soma outro round trip de rede na latência percebida do usuário. |

Nada de query N+1 clássica em loop, nada de `SELECT *` sem filtro, e o front usa `react-query` com chaves compartilhadas (não há duplicação acidental de cache) — o que existe é round trips redundantes/serializados, que numa topologia cross-network como essa custam muito mais do que custariam em localhost.

## 2. Plano de Ação Priorizado

| Prioridade | Item | Impacto | Esforço | Quick Win? |
|---|---|---|---|---|
| 1 | **C** — compressão gzip no Express | Alto (payload -70~90% em toda resposta JSON) | Muito baixo (1 dependência + 1 linha) | Sim |
| 2 | **A** — cache do `espacoId` no `resolveEspaco` | Alto (remove 1 round trip de TODA requisição autenticada) | Baixo | Sim |
| 3 | **B** — eliminar fetch duplicado de transações na Home | Médio-Alto (remove 1 query pesada + 1 payload grande por carregamento de Home) | Médio | — |
| 4 | **E** — tornar `aprenderComTransacao` fire-and-forget | Médio (tira 1 round trip da latência da resposta ao usuário) | Baixo | Sim |
| 5 | **D** — mover a soma diária do orçamento para o banco (`groupBy`/raw) | Baixo hoje, cresce com o volume | Médio | — |

Os itens 1, 2 e 4 são quick wins no sentido literal: pouquíssimo código, zero mudança de contrato de API, e efeito imediato em toda a aplicação (não só numa tela).

## 3. Exemplos Práticos

### 3.1 — Compressão de resposta (Alto impacto / esforço mínimo)

**Antes** — `backend/src/app.ts`:
```ts
export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  ...
```

**Depois:**
```ts
import compression from "compression";

export function createApp() {
  const app = express();

  app.use(compression());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  ...
```

`npm install compression @types/compression` no backend. Motivo: JSON comprime muito bem (repetição de chaves como `"categoria"`, `"conta"`, `"tipo"`). Numa conexão Hostinger→cliente que não é loopback, isso reduz o tempo de transferência de listagens grandes (ex.: busca global de até 200 transações) sem tocar em nenhuma lógica de negócio.

### 3.2 — Round trip de banco em toda requisição autenticada (Alto impacto)

**Antes** — `backend/src/middlewares/resolveEspaco.ts:14-37`:
```ts
export const resolveEspaco = asyncHandler(async function resolveEspaco(req, _res, next) {
  if (!req.auth) { next(new HttpError(401, "Não autenticado")); return; }
  const { userId, email } = req.auth;

  // Caminho comum: consulta o banco a cada requisição
  const existente = await prisma.membroEspaco.findFirst({
    where: { usuarioId: userId },
    orderBy: { criadoEm: "desc" },
  });

  if (existente) {
    req.espacoId = existente.espacoId;
    next();
    return;
  }
  // ...caminho raro de criação do espaço permanece igual
```

**Depois** — cache em memória com TTL curto, invalidado nos poucos pontos que criam/alteram vínculo:
```ts
interface EntradaCache { espacoId: string; expiraEm: number; }
const TTL_MS = 60_000;
const cacheEspacoPorUsuario = new Map<string, EntradaCache>();

export function invalidarCacheEspaco(userId: string) {
  cacheEspacoPorUsuario.delete(userId);
}

export const resolveEspaco = asyncHandler(async function resolveEspaco(req, _res, next) {
  if (!req.auth) { next(new HttpError(401, "Não autenticado")); return; }
  const { userId, email } = req.auth;

  const emCache = cacheEspacoPorUsuario.get(userId);
  if (emCache && emCache.expiraEm > Date.now()) {
    req.espacoId = emCache.espacoId;
    next();
    return;
  }

  const existente = await prisma.membroEspaco.findFirst({
    where: { usuarioId: userId },
    orderBy: { criadoEm: "desc" },
  });

  if (existente) {
    cacheEspacoPorUsuario.set(userId, { espacoId: existente.espacoId, expiraEm: Date.now() + TTL_MS });
    req.espacoId = existente.espacoId;
    next();
    return;
  }
  // ...caminho raro de criação do espaço permanece igual, chamando
  // cacheEspacoPorUsuario.set(...) antes do next() também
```

Motivo: esse `SELECT` roda em toda rota protegida (contas, categorias, transações, orçamento, regras, importação) — é o request mais executado do backend inteiro. Com TTL de 60s, o pior caso é o usuário levar até 1 minuto para "ver" uma mudança de membership (evento raríssimo — aceitar convite), enquanto se ganha uma volta de rede a menos em praticamente toda interação do app. Se preferir zero-staleness, dá para invalidar explicitamente no único lugar que cria `MembroEspaco` (aceite de convite), o que é mais seguro que confiar só no TTL.

### 3.3 — Fetch duplicado do mesmo mês na Home (Médio-Alto impacto)

**Antes** — a Home dispara `buscarResumoMensal` (que já varre o mês inteiro de transações no servidor) e, em paralelo, `TransacoesRecentesCard.tsx` dispara outra varredura completa do mesmo mês só para pegar os 6 últimos itens:
```ts
// TransacoesRecentesCard.tsx
const { data } = useQuery({
  queryKey: ["transacoes", { ano, mes, status: "todas" as const }],
  queryFn: () => listarTransacoesMes({ ano, mes, status: "todas" }),
});
const recentes = (data?.dias ?? []).flatMap((dia) => dia.transacoes).slice(0, LIMITE);
```

**Depois** — o backend já serializa as transações do mês dentro de `buscarResumoMensal` (`backend/src/modules/transacoes/transacoes.service.ts:592`); basta expor as últimas N ali mesmo, ordenadas, em vez de fazer o cliente pedir tudo de novo:
```ts
// transacoes.service.ts — dentro de buscarResumoMensal, junto ao loop existente
const recentes = [...transacoesDoMes]
  .sort((a, b) => b.data.getTime() - a.data.getTime() || b.criadoEm.getTime() - a.criadoEm.getTime())
  .slice(0, 6)
  .map(serializarTransacao);

return {
  saldoAnterior, totalEntradas, totalSaidas, saldoFinal: saldoAnterior + movimentoTotal,
  recentes, // novo campo
  anterioresNaoConsolidadas: anterioresNaoConsolidadas.map(serializarTransacao),
  // ...
};
```
```tsx
// TransacoesRecentesCard.tsx — recebe via prop em vez de buscar
export function TransacoesRecentesCard({ recentes }: { recentes: TransacaoDTO[] }) {
  // remove o useQuery inteiro
```

Motivo: elimina uma query pesada (`findMany` com `include` de conta+categoria para o mês todo) e um payload JSON inteiro trafegando pela rede, para no fim só exibir 6 linhas — dado que já existe na resposta do card ao lado. Esse é o request mais caro da Home sendo cortado pela metade.

## Próximos passos sugeridos

Começar por 3.1 (compressão) e 3.2 (cache do espaço) — são os de maior impacto/esforço e não mudam nenhum contrato de API, então o risco de regressão é baixo.

## Status de execução (2026-08-21)

Implementados: **C** (compressão gzip), **A** (cache de `espacoId` com TTL de 60s em `resolveEspaco.ts`), **E** (`aprenderComTransacao` fire-and-forget) e **B** (campo `recentes` embutido em `buscarResumoMensal`, eliminando o fetch duplicado do mês na Home). Testes de backend (51) e frontend passaram sem regressão.

**D** (mover a soma diária do orçamento para `groupBy`/SQL) ficou de fora deliberadamente: exigiria SQL raw para agrupar por dia (cast de enum, funções de data), com risco de regressão numa tela sensível (orçamento), para um ganho que a própria auditoria já classificou como baixo no volume atual. Vale revisitar se o volume de transações por espaço crescer bastante.

## Melhorias adicionais executadas (2026-08-21)

Durante uma segunda rodada, encontrei e corrigi mais três pontos na mesma linha da auditoria original:

- **Mesmo fetch duplicado do item B, só que no app mobile** — `mobile/src/components/home/TransacoesRecentesCard.tsx` também buscava o mês inteiro de novo via `listarTransacoesMes`, em paralelo ao `buscarResumoMensal` da tela inicial. Corrigido do mesmo jeito: recebe `recentes` via prop (o backend já retornava esse campo desde a correção do item B).
- **`queryClient` do frontend web sem `staleTime`/retry** — diferente do mobile (que já tinha essa preocupação), o web usava os defaults do React Query: `staleTime: 0` (refetch de todas as ~7 queries da Home a cada foco de aba) e retry automático em erros 4xx (inclusive validação/401/404, onde tentar de novo nunca ajuda). Adicionado `staleTime: 30_000` e a mesma lógica de `shouldRetry` já usada no mobile.
- **`queryClient` do mobile sem `staleTime`** — tinha o retry certo mas não o `staleTime`, sofrendo do mesmo refetch redundante em remounts de tela. Alinhado com o mesmo valor do web (30s).

Esses três itens têm o efeito colateral de reduzir refetch redundante em outros componentes que buscam categorias/contas/regras em modais e autocompletes (ex.: `CategoriaAutocomplete`, `ContaAutocomplete`), sem precisar tocar neles individualmente.

Validado com type-check + suíte de testes nos três projetos (backend 51/51; frontend e mobile com falhas pré-existentes e não relacionadas, confirmadas via `git stash` antes de mudar qualquer coisa: `frontend/src/App.test.tsx` já falhava no `main`, e a suíte inteira do mobile já não rodava por um problema de tooling — Flow syntax do `react-native` não suportado pelo parser do Rolldown/Vite usado pelo Vitest).
