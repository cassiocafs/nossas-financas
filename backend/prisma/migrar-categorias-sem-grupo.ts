import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Migra transações de categorias SEM grupo para a categoria homônima COM
 * grupo (mesmo espaço, mesmo nome) e em seguida exclui a categoria sem
 * grupo — mesma estratégia "realocarPara" usada em
 * categorias.service.ts#excluirCategoria, só que em lote.
 *
 * Só mexe em categorias que têm exatamente uma equivalente com grupo.
 * Categorias sem equivalente (ou com equivalência ambígua) são puladas e
 * reportadas, nunca excluídas.
 *
 * Uso: tsx prisma/migrar-categorias-sem-grupo.ts <email-do-usuario>
 */
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: tsx prisma/migrar-categorias-sem-grupo.ts <email-do-usuario>");
    process.exitCode = 1;
    return;
  }

  const membros = await prisma.membroEspaco.findMany({
    where: { usuario: { email } },
    select: { espacoId: true },
  });
  if (membros.length === 0) {
    console.log(`Nenhum espaço encontrado para o usuário "${email}".`);
    return;
  }
  const espacoIds = membros.map((m) => m.espacoId);

  const categoriasSemGrupo = await prisma.categoria.findMany({
    where: { grupoId: null, espacoId: { in: espacoIds } },
    include: { espaco: { select: { nome: true } } },
    orderBy: [{ espacoId: "asc" }, { nome: "asc" }],
  });

  const migradas: {
    espaco: string;
    origemNome: string;
    origemId: string;
    destinoGrupo: string;
    destinoId: string;
    transacoesMigradas: number;
  }[] = [];
  const puladasSemEquivalente: { espaco: string; nome: string; id: string }[] = [];
  const puladasAmbiguas: { espaco: string; nome: string; id: string; qtdCandidatos: number }[] = [];
  const falhas: { espaco: string; nome: string; id: string; erro: string }[] = [];

  for (const categoria of categoriasSemGrupo) {
    const candidatos = await prisma.categoria.findMany({
      where: {
        espacoId: categoria.espacoId,
        nome: categoria.nome,
        id: { not: categoria.id },
        grupoId: { not: null },
      },
      include: { grupo: { select: { nome: true } } },
    });

    if (candidatos.length === 0) {
      puladasSemEquivalente.push({
        espaco: categoria.espaco.nome,
        nome: categoria.nome,
        id: categoria.id,
      });
      continue;
    }
    if (candidatos.length > 1) {
      puladasAmbiguas.push({
        espaco: categoria.espaco.nome,
        nome: categoria.nome,
        id: categoria.id,
        qtdCandidatos: candidatos.length,
      });
      continue;
    }

    const destino = candidatos[0];

    try {
      const transacoesMigradas = await prisma.$transaction(async (tx) => {
        const { count } = await tx.transacao.updateMany({
          where: { espacoId: categoria.espacoId, categoriaId: categoria.id },
          data: { categoriaId: destino.id },
        });
        await tx.orcamentoCategoriaMes.deleteMany({ where: { categoriaId: categoria.id } });
        await tx.regraCategorizacao.deleteMany({ where: { categoriaId: categoria.id } });
        await tx.categoria.delete({ where: { id: categoria.id } });
        return count;
      });

      migradas.push({
        espaco: categoria.espaco.nome,
        origemNome: categoria.nome,
        origemId: categoria.id,
        destinoGrupo: destino.grupo?.nome ?? "",
        destinoId: destino.id,
        transacoesMigradas,
      });
      console.log(
        `OK  [${categoria.espaco.nome}] "${categoria.nome}" -> "${destino.nome}" (${destino.grupo?.nome}): ${transacoesMigradas} transação(ões)`,
      );
    } catch (err) {
      const erro = err instanceof Error ? err.message : String(err);
      falhas.push({ espaco: categoria.espaco.nome, nome: categoria.nome, id: categoria.id, erro });
      console.log(`FALHA [${categoria.espaco.nome}] "${categoria.nome}": ${erro}`);
    }
  }

  console.log("\n=== Resumo ===");
  console.log(`Migradas e excluídas: ${migradas.length}`);
  console.log(`Puladas (sem equivalente): ${puladasSemEquivalente.length}`);
  console.log(`Puladas (equivalência ambígua): ${puladasAmbiguas.length}`);
  console.log(`Falhas: ${falhas.length}`);
  console.log(`Total de transações migradas: ${migradas.reduce((s, m) => s + m.transacoesMigradas, 0)}`);

  console.log("\n=== JSON (para gerar relatório) ===");
  console.log(JSON.stringify({ migradas, puladasSemEquivalente, puladasAmbiguas, falhas }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
