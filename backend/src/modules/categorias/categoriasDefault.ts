import { randomUUID } from "node:crypto";
import type { Prisma, TipoCategoria } from "@prisma/client";

type CategoriaDefault = { nome: string; tipo: TipoCategoria };
type SubgrupoDefault = { nome: string; categorias: CategoriaDefault[] };
type GrupoDefault = { nome: string; subgrupos?: SubgrupoDefault[]; categorias?: CategoriaDefault[] };

const GRUPOS_DEFAULT: GrupoDefault[] = [
  {
    nome: "RECEITA",
    subgrupos: [
      {
        nome: "Emprego",
        categorias: [
          { nome: "Salário", tipo: "RECEITA" },
          { nome: "Benefícios", tipo: "RECEITA" },
          { nome: "13º Salário", tipo: "RECEITA" },
        ],
      },
      {
        nome: "Rendimentos",
        categorias: [{ nome: "Rendimentos de Investimentos", tipo: "RECEITA" }],
      },
      {
        nome: "Estorno",
        categorias: [{ nome: "Reembolso / Estorno", tipo: "RECEITA" }],
      },
    ],
    categorias: [{ nome: "Vendas", tipo: "RECEITA" }],
  },
  {
    nome: "FIXO",
    subgrupos: [
      {
        nome: "Alimentação",
        categorias: [
          { nome: "Mercado", tipo: "DESPESA" },
          { nome: "Feira", tipo: "DESPESA" },
          { nome: "Padaria", tipo: "DESPESA" },
          { nome: "Açougue", tipo: "DESPESA" },
        ],
      },
      {
        nome: "Moradia",
        categorias: [
          { nome: "Aluguel/Condomínio", tipo: "DESPESA" },
          { nome: "IPTU", tipo: "DESPESA" },
          { nome: "Água", tipo: "DESPESA" },
          { nome: "Luz", tipo: "DESPESA" },
          { nome: "Gás", tipo: "DESPESA" },
          { nome: "Internet", tipo: "DESPESA" },
          { nome: "Seguro Imóvel", tipo: "DESPESA" },
        ],
      },
      {
        nome: "Celulares",
        categorias: [{ nome: "Celular", tipo: "DESPESA" }],
      },
    ],
  },
  {
    nome: "VARIÁVEL",
    subgrupos: [
      {
        nome: "Transporte",
        categorias: [
          { nome: "Gasolina", tipo: "DESPESA" },
          { nome: "Uber", tipo: "DESPESA" },
          { nome: "Transporte Público", tipo: "DESPESA" },
          { nome: "Estacionamento", tipo: "DESPESA" },
          { nome: "Pedágio", tipo: "DESPESA" },
          { nome: "Manutenção", tipo: "DESPESA" },
          { nome: "Seguro do Veículo", tipo: "DESPESA" },
          { nome: "IPVA", tipo: "DESPESA" },
        ],
      },
      {
        nome: "Saúde",
        categorias: [
          { nome: "Farmácia", tipo: "DESPESA" },
          { nome: "Médico", tipo: "DESPESA" },
          { nome: "Exames", tipo: "DESPESA" },
          { nome: "Plano de Saúde", tipo: "DESPESA" },
          { nome: "Academia", tipo: "DESPESA" },
        ],
      },
      {
        nome: "Educação",
        categorias: [
          { nome: "Curso", tipo: "DESPESA" },
          { nome: "Papelaria", tipo: "DESPESA" },
          { nome: "Mensalidade", tipo: "DESPESA" },
        ],
      },
      {
        nome: "Casa",
        categorias: [
          { nome: "Eletrodoméstico", tipo: "DESPESA" },
          { nome: "Móveis", tipo: "DESPESA" },
          { nome: "Manutenção", tipo: "DESPESA" },
        ],
      },
      {
        nome: "Assinaturas",
        categorias: [{ nome: "Assinaturas", tipo: "DESPESA" }],
      },
      {
        nome: "Vestuário",
        categorias: [{ nome: "Vestuário", tipo: "DESPESA" }],
      },
      {
        nome: "Lazer",
        categorias: [
          { nome: "Restaurante", tipo: "DESPESA" },
          { nome: "Lazer", tipo: "DESPESA" },
          { nome: "Ingressos", tipo: "DESPESA" },
        ],
      },
      {
        nome: "Impostos",
        categorias: [{ nome: "Impostos", tipo: "DESPESA" }],
      },
    ],
    categorias: [{ nome: "Presente", tipo: "DESPESA" }],
  },
  {
    nome: "ECONOMIA",
    categorias: [
      { nome: "Investimentos", tipo: "AMBOS" },
      { nome: "Fundo de Reserva", tipo: "AMBOS" },
    ],
  },
];

const CATEGORIAS_SEM_GRUPO_DEFAULT: CategoriaDefault[] = [{ nome: "Transferência", tipo: "AMBOS" }];

// Os ids são gerados aqui (em vez de deixar o Postgres gerar via default(uuid()))
// para montar tudo em memória e gravar em só 3 round trips (createMany por
// tabela). O banco roda em host remoto, então uma criação em cascata (grupo ->
// subgrupo -> categorias, um create por vez) já chegou a levar ~14s nessa
// transação, arriscando estourar o timeout padrão do Prisma (5s).
export async function criarCategoriasDefault(
  tx: Prisma.TransactionClient,
  espacoId: string,
): Promise<void> {
  const gruposData: Prisma.GrupoCategoriaCreateManyInput[] = [];
  const subgruposData: Prisma.SubgrupoCategoriaCreateManyInput[] = [];
  const categoriasData: Prisma.CategoriaCreateManyInput[] = [];

  GRUPOS_DEFAULT.forEach((grupo, ordemGrupo) => {
    const grupoId = randomUUID();
    gruposData.push({ id: grupoId, espacoId, nome: grupo.nome, ordem: ordemGrupo });

    (grupo.subgrupos ?? []).forEach((subgrupo, ordemSubgrupo) => {
      const subgrupoId = randomUUID();
      subgruposData.push({ id: subgrupoId, espacoId, grupoId, nome: subgrupo.nome, ordem: ordemSubgrupo });

      for (const categoria of subgrupo.categorias) {
        categoriasData.push({
          espacoId,
          grupoId,
          subgrupoId,
          nome: categoria.nome,
          tipo: categoria.tipo,
        });
      }
    });

    for (const categoria of grupo.categorias ?? []) {
      categoriasData.push({
        espacoId,
        grupoId,
        subgrupoId: null,
        nome: categoria.nome,
        tipo: categoria.tipo,
      });
    }
  });

  for (const categoria of CATEGORIAS_SEM_GRUPO_DEFAULT) {
    categoriasData.push({
      espacoId,
      grupoId: null,
      subgrupoId: null,
      nome: categoria.nome,
      tipo: categoria.tipo,
    });
  }

  await tx.grupoCategoria.createMany({ data: gruposData });
  await tx.subgrupoCategoria.createMany({ data: subgruposData });
  await tx.categoria.createMany({ data: categoriasData });
}
