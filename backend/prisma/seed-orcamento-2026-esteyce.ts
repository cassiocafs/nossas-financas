/**
 * Duplica o orçamento previsto de 2026 do espaço de cassiocafs@gmail.com para o
 * espaço de esteyceecassio@gmail.com, usando os mesmos valores extraídos dos
 * relatórios mensais do app "Minhas Economias" (ver prisma/seed-orcamento-2026.ts).
 *
 * Resolve cada categoria por (grupo, subgrupo, nome) dentro do espaço de destino,
 * criando a categoria se ela ainda não existir lá.
 *
 * Uso:
 *   npx tsx prisma/seed-orcamento-2026-esteyce.ts            -> dry-run (só mostra o que seria feito)
 *   APPLY=1 npx tsx prisma/seed-orcamento-2026-esteyce.ts    -> grava de verdade no banco
 */
import { PrismaClient, TipoCategoria } from "@prisma/client";

const prisma = new PrismaClient();

const ESPACO_ID = "dc0c26a4-6caa-4658-9a4d-2f5fa33d4025"; // esteyceecassio@gmail.com
const ANO = 2026;
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
  { nome: "Inv. Cássio", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },
  { nome: "Inv. Esteyce", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },
  { nome: "Res. Carro", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },
  { nome: "Res. Casa", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },
  { nome: "Res. Festa", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },
  { nome: "Res. Filhos", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },
  { nome: "Res. Viagem", grupo: "ECONOMIA", subgrupo: null, tipo: "AMBOS", meses: todosMeses(500) },

  { nome: "Açougue", grupo: "FIXO", subgrupo: "Alimentação", tipo: "DESPESA", meses: todosMeses(700) },
  { nome: "Feira", grupo: "FIXO", subgrupo: "Alimentação", tipo: "DESPESA", meses: todosMeses(400) },
  {
    nome: "Mercado",
    grupo: "FIXO",
    subgrupo: "Alimentação",
    tipo: "DESPESA",
    meses: { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000, 6: 1900, 7: 1900, 8: 1900, 9: 2000, 10: 1900, 11: 1900, 12: 1900 },
  },
  {
    nome: "Padaria",
    grupo: "FIXO",
    subgrupo: "Alimentação",
    tipo: "DESPESA",
    meses: { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 200, 7: 200, 8: 200, 9: 100, 10: 200, 11: 200, 12: 200 },
  },
  {
    nome: "Suplemento",
    grupo: "FIXO",
    subgrupo: "Alimentação",
    tipo: "DESPESA",
    meses: { 1: 350, 2: 350, 3: 350, 4: 350, 5: 350, 6: 300, 7: 300, 8: 300, 9: 300, 10: 300, 11: 300, 12: 300 },
  },

  {
    nome: "Condomínio Amoaras",
    grupo: "FIXO",
    subgrupo: "AP SV Amoaras",
    tipo: "DESPESA",
    meses: { 1: 1200, 2: 1200, 3: 1200, 4: 1200, 5: 1200, 6: 1500, 7: 1500, 8: 1500, 9: 1500, 10: 1500, 11: 1500, 12: 1500 },
  },
  { nome: "Gás Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras", tipo: "DESPESA", meses: todosMeses(100) },
  { nome: "Internet Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras", tipo: "DESPESA", meses: todosMeses(170) },
  { nome: "IPTU Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras", tipo: "DESPESA", meses: todosMeses(581) },
  {
    nome: "Luz Amoaras",
    grupo: "FIXO",
    subgrupo: "AP SV Amoaras",
    tipo: "DESPESA",
    meses: { 1: 400, 2: 400, 3: 400, 4: 400, 5: 300, 6: 400, 7: 400, 8: 400, 9: 400, 10: 400, 11: 400, 12: 400 },
  },
  { nome: "Seguro Amoaras", grupo: "FIXO", subgrupo: "AP SV Amoaras", tipo: "DESPESA", meses: todosMeses(52) },

  { nome: "Ração", grupo: "FIXO", subgrupo: "Cachorras", tipo: "DESPESA", meses: todosMeses(270) },
  {
    nome: "Saúde Dogs",
    grupo: "FIXO",
    subgrupo: "Cachorras",
    tipo: "DESPESA",
    meses: { 1: 200, 4: 0, 5: 200, 6: 0, 7: 0, 9: 200, 12: 300 },
  },

  {
    nome: "Cel Cássio",
    grupo: "FIXO",
    subgrupo: "Celulares",
    tipo: "DESPESA",
    meses: { 1: 65, 2: 65, 3: 65, 4: 65, 5: 65, 6: 70, 7: 70, 8: 70, 9: 70, 10: 70, 11: 70, 12: 70 },
  },
  {
    nome: "Cel Esteyce",
    grupo: "FIXO",
    subgrupo: "Celulares",
    tipo: "DESPESA",
    meses: { 1: 65, 2: 65, 3: 65, 4: 65, 5: 65, 6: 70, 7: 70, 8: 70, 9: 70, 10: 70, 11: 70, 12: 70 },
  },

  { nome: "Google Drive", grupo: "VARIÁVEL", subgrupo: "Assinaturas", tipo: "DESPESA", meses: todosMeses(10) },
  { nome: "Livelo", grupo: "VARIÁVEL", subgrupo: "Assinaturas", tipo: "DESPESA", meses: todosMeses(45) },
  { nome: "Mercado Livre", grupo: "VARIÁVEL", subgrupo: "Assinaturas", tipo: "DESPESA", meses: todosMeses(10) },
  {
    nome: "Quenha diária",
    grupo: "VARIÁVEL",
    subgrupo: "Assinaturas",
    tipo: "DESPESA",
    meses: { 1: 36, 2: 36, 3: 36, 4: 36 },
  },

  { nome: "Limp SV Amoaras", grupo: "VARIÁVEL", subgrupo: "Casa", tipo: "DESPESA", meses: todosMeses(250) },

  { nome: "Festa", grupo: "VARIÁVEL", subgrupo: "Filhos", tipo: "DESPESA", meses: { 1: 0, 2: 0 } },
  { nome: "Fraldas", grupo: "VARIÁVEL", subgrupo: "Filhos", tipo: "DESPESA", meses: { 2: 0, 3: 0, 4: 0, 6: 0, 7: 0 } },
  {
    nome: "Salário Baba",
    grupo: "VARIÁVEL",
    subgrupo: "Filhos",
    tipo: "DESPESA",
    meses: { 1: 800, 2: 800, 3: 800, 4: 800, 5: 800, 6: 1112, 7: 1112, 8: 1112, 9: 1112, 10: 1112, 11: 1112, 12: 1112 },
  },

  {
    nome: "Lazer",
    grupo: "VARIÁVEL",
    subgrupo: null,
    tipo: "DESPESA",
    meses: { 1: 1400, 2: 1400, 3: 1400, 4: 1400, 5: 1400, 6: 1600, 7: 1600, 8: 1600, 9: 1600, 10: 1600, 11: 1600, 12: 1600 },
  },

  {
    nome: "Presente (CEE)",
    grupo: "VARIÁVEL",
    subgrupo: "Presente",
    tipo: "DESPESA",
    meses: { 2: 0, 3: 0, 4: 300, 5: 250, 6: 500, 8: 250, 11: 500, 12: 500 },
  },
  {
    nome: "Presente (Externo)",
    grupo: "VARIÁVEL",
    subgrupo: "Presente",
    tipo: "DESPESA",
    meses: { 1: 100, 2: 0, 3: 300, 4: 300, 5: 100, 7: 300, 8: 200, 9: 100, 10: 200, 11: 400 },
  },
  {
    nome: "Presente (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Presente",
    tipo: "DESPESA",
    meses: { 1: 0, 2: 200, 6: 0, 10: 200, 11: 200 },
  },

  { nome: "Doações Realizadas", grupo: "VARIÁVEL", subgrupo: "Proteção Animal", tipo: "DESPESA", meses: todosMeses(150) },

  {
    nome: "Academia (Cássio)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 1: 140, 2: 140, 3: 140, 4: 140, 5: 140, 6: 150, 7: 150, 8: 150, 9: 150, 10: 150, 11: 150, 12: 150 },
  },
  {
    nome: "Academia (Esteyce)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 1: 140, 2: 140, 3: 140, 4: 140, 5: 140, 6: 150, 7: 150, 8: 150, 9: 150, 10: 150, 11: 150, 12: 150 },
  },
  { nome: "Estética (Cássio)", grupo: "VARIÁVEL", subgrupo: "Saúde", tipo: "DESPESA", meses: todosMeses(60) },
  { nome: "Estética (Esteyce)", grupo: "VARIÁVEL", subgrupo: "Saúde", tipo: "DESPESA", meses: todosMeses(300) },
  { nome: "Farmácia", grupo: "VARIÁVEL", subgrupo: "Saúde", tipo: "DESPESA", meses: todosMeses(150) },
  { nome: "Farmácia (Filhos)", grupo: "VARIÁVEL", subgrupo: "Saúde", tipo: "DESPESA", meses: todosMeses(200) },
  {
    nome: "Fisioterapia (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 1: 900, 2: 1200, 3: 1200, 4: 1200, 5: 1200, 6: 1200, 7: 1200, 8: 1200, 9: 1200, 10: 1200, 11: 1200, 12: 1200 },
  },
  {
    nome: "Fono Terapia (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 1: 520, 2: 1040, 3: 1040, 4: 1040, 5: 1040, 6: 1040, 7: 1040, 8: 1040, 9: 1040, 10: 1040, 11: 1040, 12: 1040 },
  },
  {
    nome: "Médico (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Saúde",
    tipo: "DESPESA",
    meses: { 2: 0, 3: 600, 4: 0, 5: 700, 6: 600, 9: 600, 12: 600 },
  },

  { nome: "Gasolina Carro", grupo: "VARIÁVEL", subgrupo: "Transporte", tipo: "DESPESA", meses: todosMeses(500) },
  {
    nome: "IPVA+DPVAT+Licenciamento (Carro)",
    grupo: "VARIÁVEL",
    subgrupo: "Transporte",
    tipo: "DESPESA",
    meses: { 1: 615, 2: 615, 3: 615, 4: 615, 5: 615, 7: 175 },
  },
  { nome: "IPVA+DPVAT+Licenciamento (Moto)", grupo: "VARIÁVEL", subgrupo: "Transporte", tipo: "DESPESA", meses: { 6: 175 } },
  {
    nome: "Manutenção (Carro)",
    grupo: "VARIÁVEL",
    subgrupo: "Transporte",
    tipo: "DESPESA",
    meses: { 1: 1000, 2: 1000, 3: 1000, 4: 0, 6: 0, 7: 1000, 8: 1000, 9: 1000 },
  },
  {
    nome: "Seguro Carro",
    grupo: "VARIÁVEL",
    subgrupo: "Transporte",
    tipo: "DESPESA",
    meses: { 5: 440, 6: 440, 7: 440, 8: 440, 9: 440, 10: 360 },
  },

  { nome: "Calçados (Esteyce)", grupo: "VARIÁVEL", subgrupo: "Vestuário", tipo: "DESPESA", meses: todosMeses(150) },
  {
    nome: "Calçados (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Vestuário",
    tipo: "DESPESA",
    meses: { 1: 0, 5: 150, 8: 150, 11: 150 },
  },
  {
    nome: "Roupas (Cássio)",
    grupo: "VARIÁVEL",
    subgrupo: "Vestuário",
    tipo: "DESPESA",
    meses: { 1: 300, 5: 0, 10: 150, 11: 150, 12: 150 },
  },
  {
    nome: "Roupas (Esteyce)",
    grupo: "VARIÁVEL",
    subgrupo: "Vestuário",
    tipo: "DESPESA",
    meses: { 1: 300, 2: 0, 3: 0, 4: 0, 5: 0, 10: 150, 11: 150, 12: 150 },
  },
  {
    nome: "Roupas (Filhos)",
    grupo: "VARIÁVEL",
    subgrupo: "Vestuário",
    tipo: "DESPESA",
    meses: { 1: 150, 2: 0, 3: 0, 6: 150, 7: 150, 10: 150, 11: 150 },
  },
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
