/**
 * Popula o orçamento previsto de 2026 (espaço de cassiocafs@gmail.com) com os valores
 * extraídos dos relatórios mensais do app "Minhas Economias" (Jan a Dez/2026).
 *
 * Uso:
 *   npx tsx prisma/seed-orcamento-2026.ts            -> dry-run (só mostra o que seria feito)
 *   APPLY=1 npx tsx prisma/seed-orcamento-2026.ts     -> grava de verdade no banco
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ESPACO_ID = "59603998-ec7b-49b7-a699-03948d3d0d36"; // cassiocafs@gmail.com
const ANO = 2026;
const APPLY = process.env.APPLY === "1";

// IDs de categorias já existentes no banco (ver prisma/inspecionar-orcamento.ts)
const CAT = {
  invCassio: "ba08860b-d821-468c-be23-ce9f331bca60",
  invEsteyce: "91fca2a4-0b49-4e59-8b51-837a37c6fbce",
  resCarro: "8616fcc4-78a4-4c92-aaa3-10e3373ca200",
  resCasa: "bbf401fe-b1c2-46c0-a9f8-f1140c36977e",
  resFesta: "cdc80720-a772-4a1e-b7cc-8d7f16e2b6e4",
  resFilhos: "233e3ad3-8341-47c5-b14e-d55e1f6d6347",
  resViagem: "46af07ea-7209-45db-aad1-5aa75dc68caa",

  acougue: "234ea1ec-1a79-47f3-be69-9c91994cc36a",
  feira: "6644cef0-15f3-440a-b708-4200867bde63",
  mercado: "f217ac91-d64d-4b5b-a51a-c320399d86a5",
  padaria: "d8651ee1-df88-437c-b846-d1dce8f2754b",
  suplemento: "3c231885-c436-4d8d-afb0-fa5f0354c49b",

  condominioAmoaras: "33f7d52c-64b2-4172-9dcb-e019d62bf660",
  gasAmoaras: "7af83de9-7a7e-4b8d-be1d-5f4cef8a550c",
  internetAmoaras: "e8e2716c-02a0-4003-9a27-54fc85b85853",
  iptuAmoaras: "efa2361e-83d3-43e8-87f6-22de49189a9d",
  luzAmoaras: "ed716a3e-4942-4ac4-9543-b42c30bdf5a2",
  seguroAmoaras: "ec7a1e43-2ccf-4e37-b386-8f82af765de1",

  racao: "da926ecc-3047-45f5-b181-6976c40d8605",
  saudeDogs: "a0071360-4bc7-403e-9ff4-7deb0d657218",

  celCassio: "e0b0c582-0b8e-40b8-8b40-0833db4dc8ae",
  celEsteyce: "000040b9-5e3e-4e59-9bb1-7c92b8b01896",

  googleDrive: "1820bcdc-dc57-4606-b0e9-e5191b9ffd70",
  livelo: "a4cbcc31-efd7-4212-8848-43254d825041",
  mercadoLivre: "be348349-3a67-4ac1-a68d-35a3dfe1e15b",
  quenhaDiaria: "b23dea6b-9026-4582-838d-d9e88397be7d", // "Queima diária" no print

  limpSvAmoaras: "b6b1c253-0111-4833-a99e-77646410c687",

  festa: "c16deb1c-9d33-469e-b3f8-b3f277497754",
  fraldas: "dde91514-8768-47bb-a22e-c3ffb5b5ece7",
  salarioBaba: "0ae85a11-a4dd-4776-9e3b-425ee7a98018",

  presenteCee: "127442ea-c4c3-40c1-81dd-1df20865d427",
  presenteExterno: "21231c1f-959f-437b-b972-fcd8e8162641",
  presenteFilhos: "977bf2b0-be07-4595-b33c-0412326c2581",

  doacoesRealizadas: "42419034-8b7b-45d2-8d2f-607786aef200",

  academiaCassio: "3afd78de-143c-4e55-a597-bd14e2399589",
  academiaEsteyce: "66494959-9d85-4568-8ad2-81def34221c0",
  esteticaCassio: "bf2ba2fe-6b04-4ee9-b2eb-62c745127740",
  esteticaEsteyce: "eb5922bc-5a98-4d7e-9619-123781e65607",
  farmacia: "96f0128a-052a-47bf-b9f3-60a9b05c8983",
  farmaciaFilhos: "a5771be9-23c5-4b9b-b9b6-58aef361a2a4",
  fisioterapiaFilhos: "94efa7cf-7c2e-4bbd-a7d4-36aa7fcb2372",
  fonoTerapiaFilhos: "02cba95f-6ae6-4980-bccb-ae1c189e5c89",
  medicoFilhos: "65787540-58cd-487b-8b62-4038dd0cc0fd",

  gasolinaCarro: "ed2bc58c-9118-497b-b446-f8e8c2ee7dd5",
  ipvaCarro: "45fcb37e-01f7-44b9-9bc0-7b9d5393ecef",
  ipvaMoto: "49a0c660-8a37-4150-b3f0-85d223e960a6",
  manutencaoCarro: "abae9d6b-570b-40bf-bd3b-17345cc6ac78",

  calcadosEsteyce: "98b50dff-1141-4477-97f9-2d73ed6277ba",
  calcadosFilhos: "1245bc4c-7601-49ec-8d53-2f73cc8b6de4",
  roupasCassio: "a0ed0eef-cf31-498f-bac0-c29dcd7ed517",
  roupasEsteyce: "e03da0e0-0e96-4fe4-bfb2-4cbee7b46083",
  roupasFilhos: "a403b5cd-bffc-48ff-9bb0-20551dcb16a6",
} as const;

// Grupo/subgrupo usados para criar as 2 categorias que não existiam ainda
const GRUPO_VARIAVEL_ID = "c3f2a87f-6bb1-431c-b706-a48510814917";
const SUBGRUPO_TRANSPORTE_ID = "870fd6a7-70e3-4915-9ca7-092a4142a15e";

type Meses = Partial<Record<number, number>>;

interface ItemOrcamento {
  nome: string; // só para log
  categoriaId: string;
  meses: Meses;
  incerto?: boolean; // valor de leitura ambígua no PDF de origem, revisar depois
}

function todosMeses(valor: number): Meses {
  return Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, valor]));
}

async function montarItens(): Promise<ItemOrcamento[]> {
  // Cria (se preciso) as 2 categorias que existem nos prints mas não no banco.
  async function categoriaSeNaoExistir(params: { grupoId: string; subgrupoId: string | null; nome: string }) {
    const existente = await prisma.categoria.findFirst({
      where: { espacoId: ESPACO_ID, grupoId: params.grupoId, subgrupoId: params.subgrupoId, nome: params.nome },
    });
    if (existente) return existente;
    if (!APPLY) {
      console.log(`[dry-run] criaria categoria "${params.nome}" (grupoId=${params.grupoId} subgrupoId=${params.subgrupoId})`);
      return { id: `dry-run-${params.nome}` };
    }
    return prisma.categoria.create({
      data: { espacoId: ESPACO_ID, grupoId: params.grupoId, subgrupoId: params.subgrupoId, nome: params.nome, tipo: "DESPESA" },
    });
  }

  const lazer = await categoriaSeNaoExistir({ grupoId: GRUPO_VARIAVEL_ID, subgrupoId: null, nome: "Lazer" });
  const seguroCarro = await categoriaSeNaoExistir({
    grupoId: GRUPO_VARIAVEL_ID,
    subgrupoId: SUBGRUPO_TRANSPORTE_ID,
    nome: "Seguro Carro",
  });

  return [
    { nome: "Inv. Cássio", categoriaId: CAT.invCassio, meses: todosMeses(500) },
    { nome: "Inv. Esteyce", categoriaId: CAT.invEsteyce, meses: todosMeses(500) },
    { nome: "Res. Carro", categoriaId: CAT.resCarro, meses: todosMeses(500) },
    { nome: "Res. Casa", categoriaId: CAT.resCasa, meses: todosMeses(500) },
    { nome: "Res. Festa", categoriaId: CAT.resFesta, meses: todosMeses(500) },
    { nome: "Res. Filhos", categoriaId: CAT.resFilhos, meses: todosMeses(500) },
    { nome: "Res. Viagem", categoriaId: CAT.resViagem, meses: todosMeses(500) },

    { nome: "Açougue", categoriaId: CAT.acougue, meses: todosMeses(700) },
    { nome: "Feira", categoriaId: CAT.feira, meses: todosMeses(400) },
    {
      nome: "Mercado",
      categoriaId: CAT.mercado,
      meses: { 1: 2000, 2: 2000, 3: 2000, 4: 2000, 5: 2000, 6: 1900, 7: 1900, 8: 1900, 9: 2000, 10: 1900, 11: 1900, 12: 1900 },
    },
    {
      nome: "Padaria",
      categoriaId: CAT.padaria,
      meses: { 1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 200, 7: 200, 8: 200, 9: 100, 10: 200, 11: 200, 12: 200 },
    },
    {
      nome: "Suplemento",
      categoriaId: CAT.suplemento,
      meses: { 1: 350, 2: 350, 3: 350, 4: 350, 5: 350, 6: 300, 7: 300, 8: 300, 9: 300, 10: 300, 11: 300, 12: 300 },
    },

    {
      nome: "Condomínio Amoaras",
      categoriaId: CAT.condominioAmoaras,
      meses: { 1: 1200, 2: 1200, 3: 1200, 4: 1200, 5: 1200, 6: 1500, 7: 1500, 8: 1500, 9: 1500, 10: 1500, 11: 1500, 12: 1500 },
    },
    { nome: "Gás Amoaras", categoriaId: CAT.gasAmoaras, meses: todosMeses(100) },
    { nome: "Internet Amoaras", categoriaId: CAT.internetAmoaras, meses: todosMeses(170) },
    { nome: "IPTU Amoaras", categoriaId: CAT.iptuAmoaras, meses: todosMeses(581) },
    {
      nome: "Luz Amoaras",
      categoriaId: CAT.luzAmoaras,
      meses: { 1: 400, 2: 400, 3: 400, 4: 400, 5: 300, 6: 400, 7: 400, 8: 400, 9: 400, 10: 400, 11: 400, 12: 400 },
    },
    { nome: "Seguro Amoaras", categoriaId: CAT.seguroAmoaras, meses: todosMeses(52) },

    { nome: "Ração", categoriaId: CAT.racao, meses: todosMeses(270) },
    {
      nome: "Saúde Dogs",
      categoriaId: CAT.saudeDogs,
      meses: { 1: 200, 4: 0, 5: 200, 6: 0, 7: 0, 9: 200, 12: 300 },
    },

    {
      nome: "Cel Cássio",
      categoriaId: CAT.celCassio,
      meses: { 1: 65, 2: 65, 3: 65, 4: 65, 5: 65, 6: 70, 7: 70, 8: 70, 9: 70, 10: 70, 11: 70, 12: 70 },
    },
    {
      nome: "Cel Esteyce",
      categoriaId: CAT.celEsteyce,
      meses: { 1: 65, 2: 65, 3: 65, 4: 65, 5: 65, 6: 70, 7: 70, 8: 70, 9: 70, 10: 70, 11: 70, 12: 70 },
    },

    { nome: "Google Drive", categoriaId: CAT.googleDrive, meses: todosMeses(10) },
    { nome: "Livelo", categoriaId: CAT.livelo, meses: todosMeses(45) },
    { nome: "Mercado Livre", categoriaId: CAT.mercadoLivre, meses: todosMeses(10) },
    { nome: "Quenha diária (Queima diária)", categoriaId: CAT.quenhaDiaria, meses: { 1: 36, 2: 36, 3: 36, 4: 36 } },

    { nome: "Limp SV Amoaras", categoriaId: CAT.limpSvAmoaras, meses: todosMeses(250) },

    { nome: "Festa", categoriaId: CAT.festa, meses: { 1: 0, 2: 0 } },
    { nome: "Fraldas", categoriaId: CAT.fraldas, meses: { 2: 0, 3: 0, 4: 0, 6: 0, 7: 0 } },
    {
      nome: "Salário Baba",
      categoriaId: CAT.salarioBaba,
      meses: { 1: 800, 2: 800, 3: 800, 4: 800, 5: 800, 6: 1112, 7: 1112, 8: 1112, 9: 1112, 10: 1112, 11: 1112, 12: 1112 },
    },

    {
      nome: "Lazer",
      categoriaId: lazer.id,
      meses: { 1: 1400, 2: 1400, 3: 1400, 4: 1400, 5: 1400, 6: 1600, 7: 1600, 8: 1600, 9: 1600, 10: 1600, 11: 1600, 12: 1600 },
    },

    {
      nome: "Presente CEE",
      categoriaId: CAT.presenteCee,
      meses: { 2: 0, 3: 0, 4: 300, 5: 250, 6: 500, 8: 250, 11: 500, 12: 500 },
    },
    {
      nome: "Presente Externo",
      categoriaId: CAT.presenteExterno,
      meses: { 1: 100, 2: 0, 3: 300, 4: 300, 5: 100, 7: 300, 8: 200, 9: 100, 10: 200, 11: 400 },
    },
    { nome: "Presente (Filhos)", categoriaId: CAT.presenteFilhos, meses: { 1: 0, 2: 200, 6: 0, 10: 200, 11: 200 } },

    { nome: "Doações Realizadas", categoriaId: CAT.doacoesRealizadas, meses: todosMeses(150) },

    {
      nome: "Academia (Cássio)",
      categoriaId: CAT.academiaCassio,
      meses: { 1: 140, 2: 140, 3: 140, 4: 140, 5: 140, 6: 150, 7: 150, 8: 150, 9: 150, 10: 150, 11: 150, 12: 150 },
    },
    {
      nome: "Academia (Esteyce)",
      categoriaId: CAT.academiaEsteyce,
      meses: { 1: 140, 2: 140, 3: 140, 4: 140, 5: 140, 6: 150, 7: 150, 8: 150, 9: 150, 10: 150, 11: 150, 12: 150 },
    },
    { nome: "Estética (Cássio)", categoriaId: CAT.esteticaCassio, meses: todosMeses(60) },
    { nome: "Estética (Esteyce)", categoriaId: CAT.esteticaEsteyce, meses: todosMeses(300) },
    { nome: "Farmácia", categoriaId: CAT.farmacia, meses: todosMeses(150) },
    { nome: "Farmácia (Filhos)", categoriaId: CAT.farmaciaFilhos, meses: todosMeses(200), incerto: true },
    {
      nome: "Fisioterapia (Filhos)",
      categoriaId: CAT.fisioterapiaFilhos,
      meses: { 1: 900, 2: 1200, 3: 1200, 4: 1200, 5: 1200, 6: 1200, 7: 1200, 8: 1200, 9: 1200, 10: 1200, 11: 1200, 12: 1200 },
    },
    {
      nome: "Fono Terapia (Filhos)",
      categoriaId: CAT.fonoTerapiaFilhos,
      meses: { 1: 520, 2: 1040, 3: 1040, 4: 1040, 5: 1040, 6: 1040, 7: 1040, 8: 1040, 9: 1040, 10: 1040, 11: 1040, 12: 1040 },
    },
    {
      nome: "Médico (Filhos)",
      categoriaId: CAT.medicoFilhos,
      meses: { 2: 0, 3: 600, 4: 0, 5: 700, 6: 600, 9: 600, 12: 600 },
    },

    { nome: "Gasolina Carro", categoriaId: CAT.gasolinaCarro, meses: todosMeses(500) },
    {
      nome: "IPVA+DPVAT+Licenciamento (Carro)",
      categoriaId: CAT.ipvaCarro,
      meses: { 1: 615, 2: 615, 3: 615, 4: 615, 5: 615, 7: 175 },
    },
    { nome: "IPVA+DPVAT+Licenciamento (Moto)", categoriaId: CAT.ipvaMoto, meses: { 6: 175 } },
    {
      nome: "Manutenção (Carro)",
      categoriaId: CAT.manutencaoCarro,
      meses: { 1: 1000, 2: 1000, 3: 1000, 4: 0, 6: 0, 7: 1000, 8: 1000, 9: 1000 },
    },
    { nome: "Seguro Carro", categoriaId: seguroCarro.id, meses: { 5: 440, 6: 440, 7: 440, 8: 440, 9: 440, 10: 360 } },

    { nome: "Calçados (Esteyce)", categoriaId: CAT.calcadosEsteyce, meses: todosMeses(150) },
    { nome: "Calçados (Filhos)", categoriaId: CAT.calcadosFilhos, meses: { 1: 0, 5: 150, 8: 150, 11: 150 } },
    { nome: "Roupas (Cássio)", categoriaId: CAT.roupasCassio, meses: { 1: 300, 5: 0, 10: 150, 11: 150, 12: 150 } },
    {
      nome: "Roupas (Esteyce)",
      categoriaId: CAT.roupasEsteyce,
      meses: { 1: 300, 2: 0, 3: 0, 4: 0, 5: 0, 10: 150, 11: 150, 12: 150 },
    },
    {
      nome: "Roupas (Filhos)",
      categoriaId: CAT.roupasFilhos,
      meses: { 1: 150, 2: 0, 3: 0, 6: 150, 7: 150, 10: 150, 11: 150 },
    },
  ];
}

async function main() {
  const orcamento = await prisma.orcamentoAnual.findFirst({ where: { espacoId: ESPACO_ID, ano: ANO } });
  if (!orcamento) throw new Error(`Não existe OrcamentoAnual para espaco=${ESPACO_ID} ano=${ANO}`);

  const itens = await montarItens();

  let totalUpserts = 0;
  const incertos: string[] = [];
  const totalPorMes: Record<number, number> = {};

  for (const item of itens) {
    if (item.incerto) incertos.push(item.nome);
    for (const [mesStr, valor] of Object.entries(item.meses)) {
      const mes = Number(mesStr);
      totalUpserts++;
      totalPorMes[mes] = (totalPorMes[mes] ?? 0) + valor;
      if (APPLY) {
        await prisma.orcamentoCategoriaMes.upsert({
          where: {
            orcamentoAnualId_categoriaId_mes: { orcamentoAnualId: orcamento.id, categoriaId: item.categoriaId, mes },
          },
          update: { valorPrevisto: valor },
          create: { orcamentoAnualId: orcamento.id, categoriaId: item.categoriaId, mes, valorPrevisto: valor },
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
  if (incertos.length > 0) {
    console.log(`\nATENÇÃO — categorias com valores de leitura incerta no PDF de origem: ${incertos.join(", ")}`);
  }
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
