# Nossas Finanças — App Mobile

App mobile (Expo / React Native) do **Nossas Finanças**, um app de controle financeiro pessoal/familiar. Este pacote é o "companion" mobile do projeto: consome a mesma API em `backend/` que já serve o app web em `frontend/`, permitindo lançar e consultar transações direto do celular.

O monorepo tem três pacotes (npm workspaces):

- `backend/` — API Express + Prisma + Zod.
- `frontend/` — app web React + Vite + Tailwind.
- `mobile/` — este app, Expo + Expo Router + React Native.

## Funcionalidades atuais

O app tem autenticação e três telas principais (abas), refletindo o que já está implementado no código:

- **Login** (`src/app/(auth)/login.tsx`): autenticação por e-mail e senha via Supabase Auth (`supabase.auth.signInWithPassword`). Enquanto não há sessão, o usuário é redirecionado para o login (ver `src/app/(tabs)/_layout.tsx`).
- **Lançar** (`src/app/(tabs)/index.tsx`): formulário para lançar uma nova transação (descrição, valor, tipo Despesa/Receita e conta), enviando via `POST /api/transacoes` para a API do backend.
- **Transações** (`src/app/(tabs)/transacoes.tsx`): lista as transações do mês corrente, agrupadas por dia, consultando `GET /api/transacoes`.
- **Perfil** (`src/app/(tabs)/perfil.tsx`): exibe o e-mail da conta autenticada e permite fazer logout (`signOut`).

## Stack técnica

- [Expo](https://expo.dev) `~57.0.9` com [Expo Router](https://docs.expo.dev/router/introduction/) (roteamento por arquivos em `src/app/`).
- React Native `0.86.2` / React `19.2.3`.
- [Supabase Auth](https://supabase.com/docs/guides/auth) para autenticação (`src/lib/supabaseClient.ts`, `src/contexts/AuthContext.tsx`), com sessão persistida via `@react-native-async-storage/async-storage`.
- [TanStack Query](https://tanstack.com/query) para cache e sincronização de dados vindos da API (`src/api/client.ts`).
- TypeScript.

> Nota: a versão do Expo instalada (57) é recente; ao gerar código para este app, vale checar a documentação versionada em https://docs.expo.dev/versions/v57.0.0/ (ver `mobile/AGENTS.md`).

## Pré-requisitos

- Node.js compatível com as dependências do monorepo (não há `.nvmrc` nem campo `engines` definido nos `package.json` do projeto até o momento; use uma versão LTS recente do Node).
- Um projeto no [Supabase](https://supabase.com) (URL e chave anônima) para autenticação.
- O backend (`backend/`) rodando localmente ou uma URL de API acessível.
- Para testar em dispositivo físico: o [Expo Go](https://expo.dev/go) instalado no celular (ou um development build), e o celular na mesma rede local da máquina de desenvolvimento.

## Configuração de ambiente

Copie `mobile/.env.example` para `mobile/.env` e preencha as variáveis:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
```

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`: URL e chave anônima (`anon key`) do projeto Supabase usado para autenticação. Sem essas variáveis o app lança um erro ao iniciar (ver `src/lib/supabaseClient.ts`).
- `EXPO_PUBLIC_API_BASE_URL`: URL base da API do `backend/`. Por padrão aponta para `http://localhost:3001`.

**Atenção:** ao testar em um dispositivo físico, `localhost` não funciona — use o IP da máquina na rede local (ex.: `http://192.168.0.10:3001`), como já indicado em `mobile/.env.example`.

## Como rodar

### A partir da raiz do monorepo

```bash
npm install
npm run dev:mobile
```

O script `dev:mobile` (definido no `package.json` raiz) executa `npm run start --workspace mobile`, que por sua vez roda `expo start`.

Para a API funcionar, é preciso o backend rodando em paralelo, apontado pela variável `EXPO_PUBLIC_API_BASE_URL`:

```bash
npm run dev:backend
```

### Diretamente dentro de `mobile/`

```bash
cd mobile
npm install
npx expo start
```

Ou, para abrir direto em uma plataforma específica:

```bash
npm run android
npm run ios
npm run web
```

Com o Expo CLI aberto, use as opções exibidas no terminal para abrir no Expo Go, em um emulador Android, no simulador iOS ou no navegador.

## Estrutura de pastas

```
mobile/src/
├── app/                    # Rotas do Expo Router (file-based routing)
│   ├── (auth)/             # Grupo de rotas de autenticação (tela de login)
│   ├── (tabs)/              # Grupo de rotas autenticadas, em abas (Lançar, Transações, Perfil)
│   └── _layout.tsx         # Layout raiz (providers, navegação)
├── api/                    # Cliente HTTP para a API do backend (fetch autenticado com o token do Supabase)
├── components/             # Componentes de UI reutilizáveis (ex.: themed-text, themed-view)
├── contexts/                # Contextos React (ex.: AuthContext, sessão do Supabase)
├── hooks/                   # Hooks customizados (ex.: tema/color scheme)
├── constants/               # Constantes de tema (cores, espaçamento)
└── lib/                     # Integrações de baixo nível (ex.: cliente do Supabase)
```

Conforme o app cresce, novas telas e funcionalidades tendem a seguir esse mesmo padrão — por exemplo, componentes específicos de uma feature de transações organizados em `components/transacoes/`, com chamadas de API correspondentes em `api/`.

## Testes

Testes automatizados: ainda não configurados.

## Build e publicação

Builds de produção (APK/IPA) são feitos via [EAS Build](https://docs.expo.dev/build/introduction/). A configuração correspondente vive em `eas.json`, na raiz de `mobile/`.
