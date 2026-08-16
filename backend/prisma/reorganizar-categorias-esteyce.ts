import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = "esteyceecassio@gmail.com";

/**
 * Reorganiza a árvore de categorias do espaço de esteyceecassio@gmail.com
 * para bater com a estrutura de grupos/subgrupos exportada de outro app
 * (Minhas Economias). Três tipos de operação:
 *
 * - moves: categoria sem grupo é reposicionada para o grupo/subgrupo certo
 *   (mesma linha, só muda grupoId/subgrupoId).
 * - merges: categoria duplicada (typo/acento/espaço/abreviação diferente)
 *   tem suas transações reatribuídas para a categoria "certa" já agrupada
 *   e é excluída (mesma estratégia de migrar-categorias-sem-grupo.ts).
 * - deletesVazias: categoria duplicada sem nenhuma transação vinculada,
 *   removida diretamente.
 *
 * Uso: tsx prisma/reorganizar-categorias-esteyce.ts
 */

const moves: { origem: string; grupo: string; subgrupo: string | null }[] = [
  { origem: "AP SV Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras" },
  { origem: "AP SV Denise", grupo: "FIXO", subgrupo: "AP SV Denise" },
  { origem: "AP SV MarAmor", grupo: "FIXO", subgrupo: "AP SV MarAmor" },
  { origem: "Apto Denise", grupo: "RECEITA", subgrupo: "Apto Denise" },
  { origem: "Assinaturas", grupo: "VARIÁVEL", subgrupo: "Assinaturas" },
  { origem: "Cachorras", grupo: "FIXO", subgrupo: "Cachorras" },
  { origem: "Celulares", grupo: "FIXO", subgrupo: "Celulares" },
  { origem: "ECONOMIA", grupo: "ECONOMIA", subgrupo: null },
  { origem: "Ed. Denise (Airbnb)", grupo: "VARIÁVEL", subgrupo: "Ed. Denise (Airbnb)" },
  { origem: "Educação", grupo: "VARIÁVEL", subgrupo: "Educação" },
  { origem: "Estética (Filhos)", grupo: "VARIÁVEL", subgrupo: "Saúde" },
  { origem: "Estorno", grupo: "RECEITA", subgrupo: "Estorno" },
  { origem: "Impostos", grupo: "VARIÁVEL", subgrupo: "Impostos" },
  { origem: "Internet Denise", grupo: "FIXO", subgrupo: "AP SV Denise" },
  { origem: "Manut. SV MarAmor", grupo: "VARIÁVEL", subgrupo: "Casa" },
  { origem: "RECEITA", grupo: "RECEITA", subgrupo: null },
  { origem: "Saúde", grupo: "VARIÁVEL", subgrupo: "Saúde" },
  { origem: "VARIÁVEL", grupo: "VARIÁVEL", subgrupo: null },
  { origem: "Vestuário", grupo: "VARIÁVEL", subgrupo: "Vestuário" },
  { origem: "VIAGEM", grupo: "VIAGEM", subgrupo: null },
];

const merges: {
  origem: string;
  destino: string;
  grupo: string;
  subgrupo: string | null;
  renomearDestinoPara?: string;
}[] = [
  { origem: "Fármacia (Filhos)", destino: "Farmácia (Filhos)", grupo: "VARIÁVEL", subgrupo: "Saúde" },
  { origem: "Gás  Amoaras", destino: "Gás Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras" },
  { origem: "Internet  Amoaras", destino: "Internet Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras" },
  { origem: "Inv. Cassio", destino: "Inv. Cássio", grupo: "ECONOMIA", subgrupo: null },
  { origem: "IPTU  Amoaras", destino: "IPTU Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras" },
  { origem: "LIS", destino: "IUS", grupo: "VARIÁVEL", subgrupo: "Impostos", renomearDestinoPara: "LIS" },
  { origem: "Luz  Amoaras", destino: "Luz Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras" },
  { origem: "Pós Cássio", destino: "Pós (Cássio)", grupo: "VARIÁVEL", subgrupo: "Educação" },
  { origem: "Presente", destino: "Presente", grupo: "VARIÁVEL", subgrupo: "Presente" },
  {
    origem: "Queima diária",
    destino: "Quenha diária",
    grupo: "VARIÁVEL",
    subgrupo: "Assinaturas",
    renomearDestinoPara: "Queima diária",
  },
  { origem: "Salario Baba", destino: "Salário Baba", grupo: "VARIÁVEL", subgrupo: "Filhos" },
  { origem: "Seguro  Amoaras", destino: "Seguro Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras" },
  { origem: "Transp. Público", destino: "Transporte Público", grupo: "VARIÁVEL", subgrupo: "Transporte" },
  { origem: "TV  Amoaras", destino: "TV Amoaras", grupo: "VARIÁVEL", subgrupo: "Casa" },
];

const deletesVazias: { nome: string; grupo?: string; subgrupo?: string | null; orfa?: boolean }[] = [
  { nome: "Aluguel Denise", orfa: true },
  { nome: "Manutenção (Carro)", grupo: "VARIÁVEL", subgrupo: "Transporte" },
  { nome: "Manutenção (Moto)", grupo: "VARIÁVEL", subgrupo: "Transporte" },
  { nome: "IPVA+DPVAT+Licenciamento (Carro)", grupo: "VARIÁVEL", subgrupo: "Transporte" },
  { nome: "IPVA+DPVAT+Licenciamento (Moto)", grupo: "VARIÁVEL", subgrupo: "Transporte" },
];

async function getEspacoId(): Promise<string> {
  const membro = await prisma.membroEspaco.findFirst({ where: { usuario: { email: EMAIL } } });
  if (!membro) throw new Error(`Nenhum espaço encontrado para "${EMAIL}"`);
  return membro.espacoId;
}

async function getGrupoId(espacoId: string, nome: string): Promise<string> {
  const g = await prisma.grupoCategoria.findFirst({ where: { espacoId, nome } });
  if (!g) throw new Error(`Grupo "${nome}" não encontrado`);
  return g.id;
}

async function getSubgrupoId(grupoId: string, nome: string): Promise<string> {
  const s = await prisma.subgrupoCategoria.findFirst({ where: { grupoId, nome } });
  if (!s) throw new Error(`Subgrupo "${nome}" não encontrado no grupo ${grupoId}`);
  return s.id;
}

async function getOrfaCategoria(espacoId: string, nome: string) {
  const c = await prisma.categoria.findFirst({ where: { espacoId, nome, grupoId: null } });
  if (!c) throw new Error(`Categoria órfã "${nome}" não encontrada`);
  return c;
}

async function getCategoriaEm(
  espacoId: string,
  nome: string,
  grupoId: string,
  subgrupoId: string | null,
) {
  const c = await prisma.categoria.findFirst({ where: { espacoId, nome, grupoId, subgrupoId } });
  if (!c) throw new Error(`Categoria "${nome}" não encontrada no grupo/subgrupo informado`);
  return c;
}

async function main() {
  const espacoId = await getEspacoId();
  console.log(`Espaço: ${espacoId}\n`);

  console.log("=== MOVIMENTAÇÕES ===");
  for (const m of moves) {
    try {
      const origem = await getOrfaCategoria(espacoId, m.origem);
      const grupoId = await getGrupoId(espacoId, m.grupo);
      const subgrupoId = m.subgrupo ? await getSubgrupoId(grupoId, m.subgrupo) : null;
      await prisma.categoria.update({ where: { id: origem.id }, data: { grupoId, subgrupoId } });
      console.log(`OK   "${m.origem}" -> ${m.grupo}${m.subgrupo ? "/" + m.subgrupo : ""}`);
    } catch (err) {
      console.log(`FALHA "${m.origem}": ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("\n=== MERGES (migra transações + exclui duplicata) ===");
  for (const m of merges) {
    try {
      const origem = await getOrfaCategoria(espacoId, m.origem);
      const grupoId = await getGrupoId(espacoId, m.grupo);
      const subgrupoId = m.subgrupo ? await getSubgrupoId(grupoId, m.subgrupo) : null;
      const destino = await getCategoriaEm(espacoId, m.destino, grupoId, subgrupoId);

      const transacoesMigradas = await prisma.$transaction(async (tx) => {
        const { count } = await tx.transacao.updateMany({
          where: { espacoId, categoriaId: origem.id },
          data: { categoriaId: destino.id },
        });
        await tx.orcamentoCategoriaMes.deleteMany({ where: { categoriaId: origem.id } });
        await tx.regraCategorizacao.deleteMany({ where: { categoriaId: origem.id } });
        await tx.categoria.delete({ where: { id: origem.id } });
        if (m.renomearDestinoPara) {
          await tx.categoria.update({
            where: { id: destino.id },
            data: { nome: m.renomearDestinoPara },
          });
        }
        return count;
      });

      console.log(
        `OK   "${m.origem}" -> "${m.renomearDestinoPara ?? m.destino}" [${m.grupo}${m.subgrupo ? "/" + m.subgrupo : ""}]: ${transacoesMigradas} transação(ões)`,
      );
    } catch (err) {
      console.log(`FALHA "${m.origem}": ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("\n=== EXCLUSÕES (duplicata vazia, 0 transações) ===");
  for (const d of deletesVazias) {
    try {
      const categoria = d.orfa
        ? await getOrfaCategoria(espacoId, d.nome)
        : await (async () => {
            const grupoId = await getGrupoId(espacoId, d.grupo!);
            const subgrupoId = d.subgrupo ? await getSubgrupoId(grupoId, d.subgrupo) : null;
            return getCategoriaEm(espacoId, d.nome, grupoId, subgrupoId);
          })();

      const [txns, itens, regras] = await Promise.all([
        prisma.transacao.count({ where: { categoriaId: categoria.id } }),
        prisma.orcamentoCategoriaMes.count({ where: { categoriaId: categoria.id } }),
        prisma.regraCategorizacao.count({ where: { categoriaId: categoria.id } }),
      ]);

      if (txns > 0 || itens > 0 || regras > 0) {
        console.log(
          `PULADA "${d.nome}": não está vazia (txns:${txns}, itens:${itens}, regras:${regras}) — abortado por segurança`,
        );
        continue;
      }

      await prisma.categoria.delete({ where: { id: categoria.id } });
      console.log(`OK   "${d.nome}" excluída (estava vazia)`);
    } catch (err) {
      console.log(`FALHA "${d.nome}": ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('\n=== SEM AÇÃO ===');
  console.log('"Transferência" permanece sem grupo (assim também está na árvore de referência).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
