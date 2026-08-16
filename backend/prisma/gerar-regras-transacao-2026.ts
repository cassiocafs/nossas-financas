import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizarDescricao(descricao: string): string {
  return descricao
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

const ANO = 2026;
const INICIO_ANO = new Date(Date.UTC(ANO, 0, 1));
const FIM_ANO = new Date(Date.UTC(ANO, 11, 31, 23, 59, 59, 999));

interface EstadoRegra {
  espacoId: string;
  espacoNome: string;
  descricao: string;
  descricaoNormalizada: string;
  contaId: string;
  categoriaId: string | null;
  ocorrencias: number;
}

const MIN_OCORRENCIAS_PADRAO = 2;

/**
 * Varredura geral: reconstrói, a partir do histórico de transações de
 * despesa/receita de 2026 (em ordem cronológica), quais seriam as regras de
 * inserção geradas se o aprendizado automático (transacoes.service.ts ->
 * aprenderComTransacao) já estivesse ativo o ano inteiro — para cada
 * descrição normalizada, vence a conta/categoria da transação mais recente.
 *
 * Descrições que aparecem uma única vez no ano são ignoradas por padrão
 * (84% dos casos em uma amostragem real — texto livre de compras pontuais
 * como "Sorvete pos almoco dia dos pais" nunca vai se repetir ao pé da
 * letra), já que criar uma regra pra elas nunca vai disparar de novo e só
 * suja a tabela. Ajustável via --min=N.
 *
 * Uso: tsx prisma/gerar-regras-transacao-2026.ts [email-do-usuario] [--aplicar] [--min=N]
 * Sem --aplicar roda em modo simulação (só imprime o que seria feito).
 * Sem e-mail, varre todos os espaços.
 */
async function main() {
  const args = process.argv.slice(2);
  const aplicar = args.includes("--aplicar");
  const emailFiltro = args.find((a) => !a.startsWith("--"));
  const minArg = args.find((a) => a.startsWith("--min="));
  const minOcorrencias = minArg ? Number(minArg.slice("--min=".length)) : MIN_OCORRENCIAS_PADRAO;

  let espacoIds: string[] | undefined;
  if (emailFiltro) {
    const membros = await prisma.membroEspaco.findMany({
      where: { usuario: { email: emailFiltro } },
      select: { espacoId: true },
    });
    if (membros.length === 0) {
      console.log(`Nenhum espaço encontrado para o usuário "${emailFiltro}".`);
      return;
    }
    espacoIds = membros.map((m) => m.espacoId);
  }

  const transacoes = await prisma.transacao.findMany({
    where: {
      ...(espacoIds ? { espacoId: { in: espacoIds } } : {}),
      tipo: { in: ["DESPESA", "RECEITA"] },
      data: { gte: INICIO_ANO, lte: FIM_ANO },
    },
    include: { espaco: { select: { nome: true } } },
    orderBy: [{ data: "asc" }, { criadoEm: "asc" }],
  });

  if (transacoes.length === 0) {
    console.log(`Nenhuma transação de despesa/receita encontrada em ${ANO}.`);
    return;
  }

  console.log(`Encontradas ${transacoes.length} transação(ões) de despesa/receita em ${ANO}.\n`);

  const estadoFinal = new Map<string, EstadoRegra>();
  for (const t of transacoes) {
    const descricaoTratada = t.descricao.trim();
    if (!descricaoTratada) continue;
    const descricaoNormalizada = normalizarDescricao(descricaoTratada);
    const chave = `${t.espacoId}::${descricaoNormalizada}`;
    const anterior = estadoFinal.get(chave);
    estadoFinal.set(chave, {
      espacoId: t.espacoId,
      espacoNome: t.espaco.nome,
      descricao: descricaoTratada,
      descricaoNormalizada,
      contaId: t.contaId,
      categoriaId: t.categoriaId,
      ocorrencias: (anterior?.ocorrencias ?? 0) + 1,
    });
  }

  const todosGrupos = Array.from(estadoFinal.values());
  const grupos = todosGrupos.filter((g) => g.ocorrencias >= minOcorrencias);
  const descartadasPoucaOcorrencia = todosGrupos.length - grupos.length;

  console.log(`${todosGrupos.length} descrição(ões) distinta(s) encontrada(s).`);
  console.log(
    `${descartadasPoucaOcorrencia} descartada(s) por aparecer(em) menos de ${minOcorrencias} vez(es) no ano.`,
  );
  console.log(`${grupos.length} vira(m) candidata(s) a regra.\n`);

  const existentes = await prisma.regraTransacao.findMany({
    where: { espacoId: { in: Array.from(new Set(grupos.map((g) => g.espacoId))) } },
  });
  const existentesPorChave = new Map(
    existentes.map((r) => [`${r.espacoId}::${r.descricaoNormalizada}`, r]),
  );

  let novas = 0;
  let atualizadas = 0;
  let inalteradas = 0;

  for (const grupo of grupos) {
    const chave = `${grupo.espacoId}::${grupo.descricaoNormalizada}`;
    const existente = existentesPorChave.get(chave);

    if (!existente) {
      novas++;
      console.log(`NOVA     [${grupo.espacoNome}] "${grupo.descricao}"`);
    } else if (existente.contaId !== grupo.contaId || existente.categoriaId !== grupo.categoriaId) {
      atualizadas++;
      console.log(`ATUALIZA [${grupo.espacoNome}] "${grupo.descricao}"`);
    } else {
      inalteradas++;
    }

    if (aplicar) {
      await prisma.regraTransacao.upsert({
        where: {
          espacoId_descricaoNormalizada: {
            espacoId: grupo.espacoId,
            descricaoNormalizada: grupo.descricaoNormalizada,
          },
        },
        update: { descricao: grupo.descricao, contaId: grupo.contaId, categoriaId: grupo.categoriaId },
        create: {
          espacoId: grupo.espacoId,
          descricao: grupo.descricao,
          descricaoNormalizada: grupo.descricaoNormalizada,
          contaId: grupo.contaId,
          categoriaId: grupo.categoriaId,
        },
      });
    }
  }

  console.log("\n=== Resumo ===");
  console.log(`Regras novas: ${novas}`);
  console.log(`Regras atualizadas: ${atualizadas}`);
  console.log(`Regras já corretas (sem mudança): ${inalteradas}`);
  console.log(
    aplicar
      ? "\nAlterações aplicadas no banco."
      : "\nModo de simulação — nada foi salvo. Rode novamente com --aplicar para gravar.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
