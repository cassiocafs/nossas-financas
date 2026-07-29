import { PrismaClient, type TipoCategoria } from "@prisma/client";

const prisma = new PrismaClient();

interface SubgrupoDef {
  nome: string;
  categorias: string[];
}

interface GrupoDef {
  nome: string;
  tipo: TipoCategoria;
  subgrupos: SubgrupoDef[];
  categoriasDiretas: string[];
}

const ARVORE: GrupoDef[] = [
  {
    nome: "ECONOMIA",
    tipo: "AMBOS",
    subgrupos: [],
    categoriasDiretas: [
      "Aluguel Denise",
      "Fundo de Reserva",
      "Inv. Cássio",
      "Inv. Esteyce",
      "Res. Baba",
      "Res. Carro",
      "Res. Casa",
      "Res. Festa",
      "Res. Filhos",
      "Res. Viagem",
    ],
  },
  {
    nome: "EXTERNO",
    tipo: "AMBOS",
    subgrupos: [],
    categoriasDiretas: [
      "Estorno Cássio",
      "Estorno Esteyce",
      "Gasto Ext. Cássio",
      "Gasto Ext. Esteyce",
    ],
  },
  {
    nome: "FIXO",
    tipo: "DESPESA",
    subgrupos: [
      {
        nome: "Alimentação",
        categorias: ["Açougue", "Feira", "Mercado", "Padaria", "Refeição (Semanal)", "Suplemento"],
      },
      {
        nome: "AP SV Amoaras",
        categorias: [
          "Compra apto",
          "Condomínio Amoaras",
          "Gás Amoaras",
          "Internet Amoaras",
          "IPTU Amoaras",
          "Luz Amoaras",
          "Seguro Amoaras",
        ],
      },
      {
        nome: "AP SV Denise",
        categorias: ["Condomínio Denise", "Inventário Denise", "IPTU Denise", "Luz Denise"],
      },
      {
        nome: "AP SV MarAmor",
        categorias: ["Aluguel+Cond+IPTU", "Gás", "Internet", "Luz", "Seguro Imóvel", "TV"],
      },
      { nome: "Cachorras", categorias: ["Jornal", "Ração", "Saúde Dogs"] },
      { nome: "Celulares", categorias: ["Cel Cássio", "Cel Esteyce"] },
    ],
    categoriasDiretas: [],
  },
  {
    nome: "RECEITA",
    tipo: "RECEITA",
    subgrupos: [
      { nome: "Apto Denise", categorias: ["Airbnb Hospedagem", "Aluguel Denise"] },
      {
        nome: "Emprego",
        categorias: [
          "(Antigo) Benefício Multi",
          "(Antigo) Benefício VA",
          "(Antigo) Benefício VR",
          "13º Sal Cássio",
          "13º Sal Esteyce",
          "Benefício Cássio",
          "Benefício Esteyce",
          "Linkedin",
          "Salário (Cássio)",
          "Salário (Esteyce)",
        ],
      },
      { nome: "Estorno", categorias: ["Estorno Cartão de Crédito", "Reembolso Saúde"] },
      {
        nome: "Rendimentos",
        categorias: [
          "Rend (Festa)",
          "Rend (Invest Cássio)",
          "Rend (Invest Esteyce)",
          "Rend (Nu Baba)",
          "Rend (Nu Carro)",
          "Rend (Nu Casa)",
          "Rend (Nu Filhos)",
          "Rend (Poup Apto Denise)",
          "Rend (Poup C&E)",
          "Rend (Poup Viagem)",
        ],
      },
    ],
    categoriasDiretas: ["IR", "Nota Fiscal Paulista", "Presente", "Vendas"],
  },
  {
    nome: "VARIÁVEL",
    tipo: "DESPESA",
    subgrupos: [
      {
        nome: "Assinaturas",
        categorias: [
          "Acelerador C6",
          "Amazon",
          "Globoplay",
          "Google Drive",
          "Livelo",
          "Mercado Livre",
          "Netflix",
          "Pontos Smile",
          "Quenha diária",
        ],
      },
      { nome: "Cachorras", categorias: ["Adestramento"] },
      {
        nome: "Casa",
        categorias: [
          "Eletrodoméstico",
          "Limp SV Amoaras",
          "Manut. SV Amoaras",
          "Material SV Amoaras",
          "Material SV MarAmor",
          "Móveis",
          "TV Amoaras",
        ],
      },
      {
        nome: "Ed. Denise (Airbnb)",
        categorias: ["Limp SV Denise", "Manutenção SV Denise", "Material SV Denise", "Mercado SV Denise"],
      },
      {
        nome: "Educação",
        categorias: [
          "(Antigo) Inscrições",
          "Curso",
          "Evento",
          "Inglês (Cássio)",
          "Inglês (Esteyce)",
          "MBA",
          "Papelaria",
          "Pós (Cássio)",
        ],
      },
      { nome: "Empréstimo Família", categorias: ["Fam. Cássio", "Fam. Esteyce"] },
      {
        nome: "Filhos",
        categorias: ["Aux. Gasolina Baba", "Festa", "Fraldas", "Guia DAE Baba", "Salário Baba"],
      },
      { nome: "Impostos", categorias: ["DARF IF", "IOF", "IR", "IUS", "Taxa Documentos"] },
      { nome: "Lazer", categorias: ["Ingressos", "Pontos", "Restaurante"] },
      { nome: "Presente", categorias: ["Presente CEE", "Presente Externo", "Presente (Filhos)"] },
      { nome: "Proteção Animal", categorias: ["Doações Realizadas", "Doações Recebidas"] },
      {
        nome: "Saúde",
        categorias: [
          "Academia (Cássio)",
          "Academia (Esteyce)",
          "Convênio Méd. Esteyce",
          "Estética (Cássio)",
          "Estética (Esteyce)",
          "Exames",
          "Farmácia",
          "Farmácia (Filhos)",
          "Fisioterapia (Filhos)",
          "Fono Terapia (Filhos)",
          "Médico",
          "Médico (Filhos)",
          "Terapia Ocup. (Filhos)",
        ],
      },
      {
        nome: "Transporte",
        categorias: [
          "Bicicletas",
          "Estacionamento",
          "Gasolina Carro",
          "Gasolina Moto",
          "IPVA+DPVAT+Licenciamento (Carro)",
          "IPVA+DPVAT+Licenciamento (Moto)",
          "Manutenção (Carro)",
          "Manutenção (Moto)",
          "Multa (Carro)",
          "Multa (Moto)",
          "Pedágio",
          "Transporte Público",
          "Uber",
        ],
      },
      {
        nome: "Vestuário",
        categorias: [
          "Acessórios (Cássio)",
          "Acessórios (Esteyce)",
          "Acessórios (Filhos)",
          "Calçados (Cássio)",
          "Calçados (Esteyce)",
          "Calçados (Filhos)",
          "Roupas (Cássio)",
          "Roupas (Esteyce)",
          "Roupas (Filhos)",
        ],
      },
    ],
    categoriasDiretas: ["ERROs", "Fatura cartão C6"],
  },
  {
    nome: "VIAGEM",
    tipo: "DESPESA",
    subgrupos: [],
    categoriasDiretas: [
      "Alimentação",
      "Hospedagem",
      "Pet Sitter",
      "Presente viagem (Externo)",
      "Presente viagem (Pessoal)",
      "Transporte",
      "Turismo",
    ],
  },
  {
    nome: "VISITA EMPRESA",
    tipo: "DESPESA",
    subgrupos: [],
    categoriasDiretas: ["Alimentação (Empresa)", "Transporte (Empresa)"],
  },
];

async function criarCategoriaSeNaoExistir(params: {
  espacoId: string;
  grupoId: string;
  subgrupoId: string | null;
  nome: string;
  tipo: TipoCategoria;
}) {
  const { espacoId, grupoId, subgrupoId, nome, tipo } = params;
  const existente = await prisma.categoria.findFirst({
    where: { espacoId, grupoId, subgrupoId, nome },
  });
  if (existente) return existente;
  return prisma.categoria.create({ data: { espacoId, grupoId, subgrupoId, nome, tipo } });
}

async function seedEspaco(espacoId: string) {
  for (const [grupoOrdem, grupoDef] of ARVORE.entries()) {
    const grupo = await prisma.grupoCategoria.upsert({
      where: { espacoId_nome: { espacoId, nome: grupoDef.nome } },
      update: {},
      create: { espacoId, nome: grupoDef.nome, ordem: grupoOrdem },
    });

    for (const nome of grupoDef.categoriasDiretas) {
      await criarCategoriaSeNaoExistir({
        espacoId,
        grupoId: grupo.id,
        subgrupoId: null,
        nome,
        tipo: grupoDef.tipo,
      });
    }

    for (const [subOrdem, subgrupoDef] of grupoDef.subgrupos.entries()) {
      const subgrupo = await prisma.subgrupoCategoria.upsert({
        where: { grupoId_nome: { grupoId: grupo.id, nome: subgrupoDef.nome } },
        update: {},
        create: { espacoId, grupoId: grupo.id, nome: subgrupoDef.nome, ordem: subOrdem },
      });

      for (const nome of subgrupoDef.categorias) {
        await criarCategoriaSeNaoExistir({
          espacoId,
          grupoId: grupo.id,
          subgrupoId: subgrupo.id,
          nome,
          tipo: grupoDef.tipo,
        });
      }
    }
  }
}

async function main() {
  const espacoId = process.env.SEED_ESPACO_ID;
  if (!espacoId) {
    throw new Error("Defina SEED_ESPACO_ID com o id do EspacoFinanceiro a popular");
  }
  await seedEspaco(espacoId);
  console.log(`Categorias semeadas com sucesso para o espaço ${espacoId}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
