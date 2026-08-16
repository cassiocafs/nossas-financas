import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script de VALIDAÇÃO apenas — não exclui nada.
 * Lista todas as categorias sem grupo (grupoId = null) e mostra o impacto
 * de uma eventual exclusão: transações vinculadas, itens de orçamento
 * vinculados, regras de categorização e se existe uma categoria homônima
 * com grupo que poderia servir de destino na reclassificação.
 *
 * Uso: tsx prisma/validar-exclusao-categorias-sem-grupo.ts [email-do-usuario]
 * Sem argumento, valida todos os espaços. Com argumento, filtra pelo espaço
 * do qual o usuário com esse email é membro (join MembroEspaco -> Usuario,
 * mais confiável que comparar o texto do campo EspacoFinanceiro.nome).
 */
async function main() {
  const emailFiltro = process.argv[2];

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

  const categoriasSemGrupo = await prisma.categoria.findMany({
    where: { grupoId: null, ...(espacoIds ? { espacoId: { in: espacoIds } } : {}) },
    include: {
      espaco: { select: { nome: true } },
      regras: true,
    },
    orderBy: [{ espacoId: "asc" }, { nome: "asc" }],
  });

  if (categoriasSemGrupo.length === 0) {
    console.log("Nenhuma categoria sem grupo encontrada.");
    return;
  }

  console.log(`Encontradas ${categoriasSemGrupo.length} categoria(s) sem grupo.\n`);

  let totalTransacoes = 0;
  let totalOrcamentoItens = 0;
  let totalRegras = 0;
  let totalComEquivalente = 0;

  for (const categoria of categoriasSemGrupo) {
    const [transacoesVinculadas, orcamentoItensVinculados, equivalenteComGrupo] =
      await Promise.all([
        prisma.transacao.count({
          where: { espacoId: categoria.espacoId, categoriaId: categoria.id },
        }),
        prisma.orcamentoCategoriaMes.count({
          where: { categoriaId: categoria.id },
        }),
        prisma.categoria.findFirst({
          where: {
            espacoId: categoria.espacoId,
            nome: categoria.nome,
            id: { not: categoria.id },
            grupoId: { not: null },
          },
          include: { grupo: { select: { nome: true } } },
        }),
      ]);

    totalTransacoes += transacoesVinculadas;
    totalOrcamentoItens += orcamentoItensVinculados;
    totalRegras += categoria.regras.length;
    if (equivalenteComGrupo) totalComEquivalente += 1;

    const linhas = [
      `- [${categoria.espaco.nome}] "${categoria.nome}" (id: ${categoria.id})`,
      `    transações vinculadas: ${transacoesVinculadas}`,
      `    itens de orçamento vinculados: ${orcamentoItensVinculados}`,
      `    regras de categorização: ${categoria.regras.length}`,
    ];

    if (equivalenteComGrupo) {
      linhas.push(
        `    equivalente com grupo encontrado: "${equivalenteComGrupo.nome}" no grupo "${equivalenteComGrupo.grupo?.nome}" (id: ${equivalenteComGrupo.id}) — pode ser destino de reclassificação`,
      );
    } else {
      linhas.push(`    ATENÇÃO: nenhuma categoria equivalente com grupo encontrada`);
    }

    console.log(linhas.join("\n"));
  }

  console.log("\n=== Resumo ===");
  console.log(`Categorias sem grupo: ${categoriasSemGrupo.length}`);
  console.log(`Total de transações que seriam impactadas: ${totalTransacoes}`);
  console.log(`Total de itens de orçamento que seriam apagados: ${totalOrcamentoItens}`);
  console.log(`Total de regras de categorização que seriam apagadas: ${totalRegras}`);
  console.log(
    `Categorias com equivalente "com grupo" para reclassificar: ${totalComEquivalente}/${categoriasSemGrupo.length}`,
  );

  if (totalComEquivalente < categoriasSemGrupo.length) {
    console.log(
      "\nAviso: existem categorias sem grupo SEM equivalente com grupo. Excluí-las sem reclassificar deixará as transações vinculadas sem categoria.",
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
