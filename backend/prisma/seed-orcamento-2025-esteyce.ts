/**
 * Popula o orçamento previsto de 2025 no espaço de esteyceecassio@gmail.com com os valores
 * extraídos dos relatórios mensais do app "Minhas Economias" (Jan a Dez/2025).
 *
 * Cada mês foi conferido individualmente: a soma das categorias-folha bate exatamente com o
 * TOTAL previsto impresso em cada PDF (ver relatório de extração usado para montar este script).
 *
 * Duas categorias não existiam no banco e precisaram ser criadas com valor de previsto próprio,
 * pois nesses relatórios de 2025 (diferente dos de 2026) o valor de "Previsto" fica lançado na
 * linha-pai, não nas categorias-filha (que aparecem sempre com previsto R$ 0,00):
 *   - "Presente" (VARIÁVEL > Presente) — as filhas Presente (CEE)/(Externo)/(Filhos) ficam de fora
 *     deste seed porque nunca têm previsto > 0 em nenhum mês do ano.
 *   - "Visita Empresa" (grupo VISITA EMPRESA, sem subgrupo) — o grupo só tinha as categorias
 *     "Alimentação (Empresa)" e "Transporte (Empresa)", nenhuma delas com o valor do print.
 * "Assinaturas queima diária" e "Fármacia (Filhos)" também ficaram de fora: aparecem em vários
 * meses mas sempre com previsto R$ 0,00.
 *
 * Uso:
 *   npx tsx prisma/seed-orcamento-2025-esteyce.ts            -> dry-run (só mostra o que seria feito)
 *   APPLY=1 npx tsx prisma/seed-orcamento-2025-esteyce.ts    -> grava de verdade no banco
 */
import { PrismaClient, TipoCategoria } from "@prisma/client";

const prisma = new PrismaClient();

const ESPACO_ID = "dc0c26a4-6caa-4658-9a4d-2f5fa33d4025"; // esteyceecassio@gmail.com
const ANO = 2025;
const APPLY = process.env.APPLY === "1";

type Meses = Partial<Record<number, number>>;

interface ItemOrcamento {
  nome: string;
  grupo: string;
  subgrupo: string | null;
  tipo: TipoCategoria;
  meses: Meses;
}

function todosMeses(valor: number): Meses {
  return Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, valor]));
}

const ITENS: ItemOrcamento[] = [
  { nome: "Fundo de Reserva", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },
  { nome: "Res. Carro", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },
  {
    nome: "Res. Casa",
    grupo: "ECONOMIA",
    subgrupo: null,
    tipo: "AMBOS",
    meses: { 1: 500, 2: 500, 4: 500, 6: 500, 7: 500, 9: 500, 10: 500, 11: 500, 12: 500 },
  },
  {
    nome: "Res. Filhos",
    grupo: "ECONOMIA",
    subgrupo: null,
    tipo: "AMBOS",
    meses: { 1: 500, 2: 500, 4: 500, 5: 500, 6: 500, 7: 500, 8: 500, 9: 500, 10: 500, 11: 500, 12: 500 },
  },
  {
    nome: "Res. Viagem",
    grupo: "ECONOMIA",
    subgrupo: null,
    tipo: "AMBOS",
    meses: { 1: 500, 2: 500, 4: 500, 5: 500, 6: 500, 7: 1000, 8: 1000, 9: 1000, 10: 1000, 11: 1000, 12: 1000 },
  },

  { nome: "Açougue", grupo: "FIXO", subgrupo: "Alimentação", tipo: "DESPESA", meses: todosMeses(400) },
  { nome: "Feira", grupo: "FIXO", subgrupo: "Alimentação", tipo: "DESPESA", meses: todosMeses(400) },
  { nome: "Mercado", grupo: "FIXO", subgrupo: "Alimentação", tipo: "DESPESA", meses: todosMeses(2000) },
  { nome: "Padaria", grupo: "FIXO", subgrupo: "Alimentação", tipo: "DESPESA", meses: todosMeses(100) },
  {
    nome: "Suplemento",
    grupo: "FIXO",
    subgrupo: "Alimentação",
    tipo: "DESPESA",
    meses: { 1: 300, 2: 300, 3: 300, 4: 300, 5: 300, 6: 300, 8: 300, 9: 300, 10: 300, 11: 300, 12: 300 },
  },

  {
    nome: "Condomínio Amoaras",
    grupo: "FIXO",
    subgrupo: "AP SV Amoaras",
    tipo: "DESPESA",
    meses: { 1: 1150, 2: 1150, 3: 1150, 4: 1150, 5: 1150, 6: 1150, 7: 1150, 8: 1200, 9: 1200, 10: 1200, 11: 1200, 12: 1200 },
  },
  {
    nome: "Gás Amoaras",
    grupo: "FIXO",
    subgrupo: "AP SV Amoaras",
    tipo: "DESPESA",
    meses: { 1: 70, 2: 70, 3: 70, 4: 70, 5: 70, 6: 70, 7: 70, 8: 100, 9: 100, 10: 100, 11: 100, 12: 100 },
  },
  { nome: "Internet Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras", tipo: "DESPESA", meses: todosMeses(160) },
  { nome: "IPTU Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras", tipo: "DESPESA", meses: todosMeses(552) },
  {
    nome: "Luz Amoaras",
    grupo: "FIXO",
    subgrupo: "AP SV Amoaras",
    tipo: "DESPESA",
    meses: { 1: 300, 2: 400, 3: 500, 4: 500, 5: 300, 6: 300, 7: 300, 8: 300, 9: 300, 10: 300, 11: 300, 12: 300 },
  },
  { nome: "Seguro Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras", tipo: "DESPESA", meses: todosMeses(41) },

  {
    nome: "Ração",
    grupo: "FIXO",
    subgrupo: "Cachorras",
    tipo: "DESPESA",
    meses: { 1: 270, 2: 270, 3: 270, 4: 270, 5: 270, 6: 270, 8: 270, 9: 270, 10: 270, 11: 270, 12: 270 },
  },
  {
    nome: "Saúde Dogs",
    grupo: "FIXO",
    subgrupo: "Cachorras",
    tipo: "DESPESA",
    meses: { 1: 0, 2: 200, 3: 0, 5: 200, 8: 200, 9: 0, 11: 500 },
  },

  { nome: "Cel Cássio", grupo: "FIXO", subgrupo: "Celulares", tipo: "DESPESA", meses: todosMeses(60) },
  { nome: "Cel Esteyce", grupo: "FIXO", subgrupo: "Celulares", tipo: "DESPESA", meses: todosMeses(60) },

  { nome: "Disney Plus (Mercado Livre)", grupo: "VARIÁVEL", subgrupo: "Assinaturas", tipo: "DESPESA", meses: todosMeses(9.9) },
  {
    nome: "Google Drive",
    grupo: "VARIÁVEL",
    subgrupo: "Assinaturas",
    tipo: "DESPESA",
    meses: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 7, 8: 7, 9: 7, 10: 7, 11: 7, 12: 7 },
  },
  { nome: "Livelo", grupo: "VARIÁVEL", subgrupo: "Assinaturas", tipo: "DESPESA", meses: todosMeses(45) },
  { nome: "Pontos Smile", grupo: "VARIÁVEL", subgrupo: "Assinaturas", tipo: "DESPESA", meses: todosMeses(42) },

  {
    nome: "Limp SV Amoaras",
    grupo: "VARIÁVEL",
    subgrupo: "Casa",
    tipo: "DESPESA",
    meses: { 1: 200, 2: 200, 3: 200, 4: 200, 5: 200, 6: 200, 7: 250, 8: 250, 9: 250, 10: 250, 11: 250, 12: 250 },
  },
  { nome: "TV Amoaras", grupo: "VARIÁVEL", subgrupo: "Casa", tipo: "DESPESA", meses: { 3: 90, 6: 90, 7: 90, 10: 90 } },

  { nome: "Babá", grupo: "VARIÁVEL", subgrupo: "Filhos", tipo: "DESPESA", meses: todosMeses(500) },
  { nome: "Festa", grupo: "VARIÁVEL", subgrupo: "Filhos", tipo: "DESPESA", meses: { 1: 0, 2: 0 } },

  { nome: "Lazer", grupo: "VARIÁVEL", subgrupo: null, tipo: "DESPESA", meses: todosMeses(1000) },

  {
    nome: "Presente",
    grupo: "VARIÁVEL",
    subgrupo: "Presente",
    tipo: "DESPESA",
    meses: { 1: 200, 2: 200, 3: 500, 4: 200, 5: 300, 6: 200, 7: 200, 8: 300, 9: 200, 10: 200, 11: 300, 12: 300 },
  },

  { nome: "Academia (Cássio)", grupo: "VARIÁVEL", subgrupo: "Saúde", tipo: "DESPESA", meses: todosMeses(140) },
  {
    nome: "Academia (Esteyce)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 1: 140, 2: 140, 3: 140, 4: 140, 5: 140, 6: 140 },
  },
  {
    nome: "Estética (Cássio)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 1: 50, 2: 50, 3: 50, 4: 50, 5: 50, 6: 50, 7: 55, 8: 55, 9: 55, 10: 55, 11: 55, 12: 55 },
  },
  { nome: "Estética (Esteyce)", grupo: "VARIÁVEL", subgrupo: "Saúde", tipo: "DESPESA", meses: todosMeses(150) },
  { nome: "Farmácia", grupo: "VARIÁVEL", subgrupo: "Saúde", tipo: "DESPESA", meses: todosMeses(140) },
  {
    nome: "Fisioterapia (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 1: 1500, 2: 1500, 3: 1500, 4: 1500, 5: 1500, 6: 1500, 7: 750, 8: 750, 9: 750, 10: 750, 11: 750, 12: 750 },
  },
  { nome: "Fono Terapia (Filhos)", grupo: "VARIÁVEL", subgrupo: "Saúde", tipo: "DESPESA", meses: todosMeses(1100) },
  {
    nome: "Médico (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 1: 500, 2: 500, 3: 500, 4: 500, 5: 1200, 6: 500, 7: 850, 8: 600, 9: 600, 10: 600, 11: 600, 12: 600 },
  },

  {
    nome: "Gasolina Carro",
    grupo: "VARIÁVEL",
    subgrupo: "Transporte",
    tipo: "DESPESA",
    meses: { 1: 500, 2: 500, 3: 500, 4: 500, 5: 500, 6: 500, 7: 700, 8: 700, 9: 700, 10: 700, 11: 700, 12: 700 },
  },
  { nome: "Gasolina Moto", grupo: "VARIÁVEL", subgrupo: "Transporte", tipo: "DESPESA", meses: todosMeses(50) },
  {
    nome: "IPVA+DPVAT+ Licen. (Carro)",
    grupo: "VARIÁVEL",
    subgrupo: "Transporte",
    tipo: "DESPESA",
    meses: { 1: 660, 2: 660, 3: 660, 4: 660, 5: 170 },
  },
  { nome: "IPVA+DPVAT+ Licen. (Moto)", grupo: "VARIÁVEL", subgrupo: "Transporte", tipo: "DESPESA", meses: { 6: 170 } },
  {
    nome: "Manut (Carro)",
    grupo: "VARIÁVEL",
    subgrupo: "Transporte",
    tipo: "DESPESA",
    meses: { 1: 1000, 2: 1000, 3: 1000, 4: 0, 7: 1000, 8: 1000, 9: 1000, 10: 0 },
  },
  {
    nome: "Manut (Moto)",
    grupo: "VARIÁVEL",
    subgrupo: "Transporte",
    tipo: "DESPESA",
    meses: { 1: 150, 2: 150, 7: 150, 8: 150, 10: 0 },
  },
  {
    nome: "Seguro Carro",
    grupo: "VARIÁVEL",
    subgrupo: "Transporte",
    tipo: "DESPESA",
    meses: { 3: 0, 5: 354, 6: 354, 7: 354, 8: 354, 9: 354, 10: 354, 11: 450 },
  },

  {
    nome: "Roupas (Cássio)",
    grupo: "VARIÁVEL",
    subgrupo: "Vestuário",
    tipo: "DESPESA",
    meses: { 2: 100, 3: 100, 4: 0, 5: 100, 6: 100, 7: 100, 8: 100, 9: 100, 10: 100, 11: 100, 12: 100 },
  },
  {
    nome: "Roupas (Esteyce)",
    grupo: "VARIÁVEL",
    subgrupo: "Vestuário",
    tipo: "DESPESA",
    meses: { 2: 100, 3: 100, 4: 0, 5: 100, 6: 100, 7: 100, 8: 100, 9: 100, 10: 100, 11: 100, 12: 100 },
  },
  {
    nome: "Roupas (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Vestuário",
    tipo: "DESPESA",
    meses: { 2: 100, 3: 100, 4: 100, 5: 100, 6: 100, 7: 100, 8: 100, 9: 100, 10: 100, 11: 100, 12: 100 },
  },

  { nome: "Visita Empresa", grupo: "VISITA EMPRESA", subgrupo: null, tipo: "DESPESA", meses: todosMeses(150) },
];

async function resolverCategoriaId(item: ItemOrcamento): Promise<string> {
  const grupo = await prisma.grupoCategoria.findFirst({ where: { espacoId: ESPACO_ID, nome: item.grupo } });
  if (!grupo) throw new Error(`Grupo "${item.grupo}" não existe no espaço de destino`);

  let subgrupoId: string | null = null;
  if (item.subgrupo) {
    const subgrupo = await prisma.subgrupoCategoria.findFirst({
      where: { espacoId: ESPACO_ID, grupoId: grupo.id, nome: item.subgrupo },
    });
    if (!subgrupo) throw new Error(`Subgrupo "${item.subgrupo}" não existe no grupo "${item.grupo}" do espaço de destino`);
    subgrupoId = subgrupo.id;
  }

  const existente = await prisma.categoria.findFirst({
    where: { espacoId: ESPACO_ID, grupoId: grupo.id, subgrupoId, nome: item.nome },
  });
  if (existente) return existente.id;

  if (!APPLY) {
    console.log(`[dry-run] criaria categoria "${item.nome}" (grupo=${item.grupo} subgrupo=${item.subgrupo ?? "—"})`);
    return `dry-run-${item.nome}`;
  }
  const nova = await prisma.categoria.create({
    data: { espacoId: ESPACO_ID, grupoId: grupo.id, subgrupoId, nome: item.nome, tipo: item.tipo },
  });
  console.log(`Criada categoria "${item.nome}" (grupo=${item.grupo} subgrupo=${item.subgrupo ?? "—"})`);
  return nova.id;
}

async function main() {
  let orcamento = await prisma.orcamentoAnual.findFirst({ where: { espacoId: ESPACO_ID, ano: ANO } });
  if (!orcamento) {
    if (!APPLY) {
      console.log(`[dry-run] criaria OrcamentoAnual ${ANO} para o espaço de destino`);
      orcamento = { id: "dry-run-orcamento" } as any;
    } else {
      orcamento = await prisma.orcamentoAnual.create({ data: { espacoId: ESPACO_ID, ano: ANO } });
      console.log(`Criado OrcamentoAnual ${ANO} para o espaço de destino (id=${orcamento.id})`);
    }
  }

  let totalUpserts = 0;
  const totalPorMes: Record<number, number> = {};

  for (const item of ITENS) {
    const categoriaId = await resolverCategoriaId(item);
    for (const [mesStr, valor] of Object.entries(item.meses)) {
      const mes = Number(mesStr);
      totalUpserts++;
      totalPorMes[mes] = (totalPorMes[mes] ?? 0) + valor;
      if (APPLY) {
        await prisma.orcamentoCategoriaMes.upsert({
          where: {
            orcamentoAnualId_categoriaId_mes: { orcamentoAnualId: orcamento!.id, categoriaId, mes },
          },
          update: { valorPrevisto: valor },
          create: { orcamentoAnualId: orcamento!.id, categoriaId, mes, valorPrevisto: valor },
        });
      } else {
        console.log(`[dry-run] mes=${mes} categoria="${item.nome}" previsto=${valor}`);
      }
    }
  }

  console.log("\nTotal de previsto por mês (para conferência com os totais dos prints):");
  for (let mes = 1; mes <= 12; mes++) {
    console.log(`  ${String(mes).padStart(2, "0")}: R$ ${(totalPorMes[mes] ?? 0).toFixed(2)}`);
  }

  console.log(`\n${APPLY ? "Gravados" : "Simulados (dry-run)"} ${totalUpserts} itens de orçamento para ${ANO}.`);
  if (!APPLY) {
    console.log("\nNenhuma escrita foi feita. Rode novamente com APPLY=1 para gravar de verdade.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
