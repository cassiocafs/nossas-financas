import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import { normalizarDescricao } from "../../lib/texto.js";
import type { CriarRegraTransacaoInput, EditarRegraTransacaoInput } from "./regras.schemas.js";

const REGRA_INCLUDE = {
  conta: { select: { id: true, nome: true } },
  categoria: { select: { id: true, nome: true } },
} satisfies Prisma.RegraTransacaoInclude;

type RegraTransacaoComRelacoes = Prisma.RegraTransacaoGetPayload<{ include: typeof REGRA_INCLUDE }>;

interface RegraTransacaoDTO {
  id: string;
  descricao: string;
  contaId: string;
  conta: { id: string; nome: string };
  categoriaId: string | null;
  categoria: { id: string; nome: string } | null;
}

function serializarRegra(r: RegraTransacaoComRelacoes): RegraTransacaoDTO {
  return {
    id: r.id,
    descricao: r.descricao,
    contaId: r.contaId,
    conta: r.conta,
    categoriaId: r.categoriaId,
    categoria: r.categoria,
  };
}

async function buscarContaOuFalhar(espacoId: string, id: string) {
  const conta = await prisma.conta.findFirst({ where: { id, espacoId } });
  if (!conta) throw new HttpError(404, "Conta não encontrada");
  return conta;
}

async function buscarCategoriaOuFalhar(espacoId: string, id: string) {
  const categoria = await prisma.categoria.findFirst({ where: { id, espacoId } });
  if (!categoria) throw new HttpError(404, "Categoria não encontrada");
  return categoria;
}

export async function listarRegras(espacoId: string): Promise<RegraTransacaoDTO[]> {
  const regras = await prisma.regraTransacao.findMany({
    where: { espacoId },
    include: REGRA_INCLUDE,
    orderBy: { descricao: "asc" },
  });
  return regras.map(serializarRegra);
}

export async function criarRegra(
  espacoId: string,
  input: CriarRegraTransacaoInput,
): Promise<RegraTransacaoDTO> {
  const descricaoNormalizada = normalizarDescricao(input.descricao);

  const [, , existente] = await Promise.all([
    buscarContaOuFalhar(espacoId, input.contaId),
    input.categoriaId ? buscarCategoriaOuFalhar(espacoId, input.categoriaId) : Promise.resolve(),
    prisma.regraTransacao.findFirst({ where: { espacoId, descricaoNormalizada } }),
  ]);
  if (existente) {
    throw new HttpError(409, "Já existe uma regra cadastrada para esta descrição");
  }

  const regra = await prisma.regraTransacao.create({
    data: {
      espacoId,
      descricao: input.descricao.trim(),
      descricaoNormalizada,
      contaId: input.contaId,
      categoriaId: input.categoriaId ?? null,
    },
    include: REGRA_INCLUDE,
  });
  return serializarRegra(regra);
}

async function buscarRegraOuFalhar(espacoId: string, id: string) {
  const regra = await prisma.regraTransacao.findFirst({ where: { id, espacoId } });
  if (!regra) throw new HttpError(404, "Regra não encontrada");
  return regra;
}

export async function editarRegra(
  espacoId: string,
  id: string,
  input: EditarRegraTransacaoInput,
): Promise<RegraTransacaoDTO> {
  await buscarRegraOuFalhar(espacoId, id);

  await Promise.all([
    input.contaId ? buscarContaOuFalhar(espacoId, input.contaId) : Promise.resolve(),
    input.categoriaId ? buscarCategoriaOuFalhar(espacoId, input.categoriaId) : Promise.resolve(),
  ]);

  let descricaoNormalizada: string | undefined;
  if (input.descricao !== undefined) {
    descricaoNormalizada = normalizarDescricao(input.descricao);
    const conflitante = await prisma.regraTransacao.findFirst({
      where: { espacoId, descricaoNormalizada, id: { not: id } },
    });
    if (conflitante) {
      throw new HttpError(409, "Já existe uma regra cadastrada para esta descrição");
    }
  }

  const regra = await prisma.regraTransacao.update({
    where: { id },
    data: {
      ...(input.descricao !== undefined
        ? { descricao: input.descricao.trim(), descricaoNormalizada }
        : {}),
      ...(input.contaId !== undefined ? { contaId: input.contaId } : {}),
      ...(input.categoriaId !== undefined ? { categoriaId: input.categoriaId } : {}),
    },
    include: REGRA_INCLUDE,
  });
  return serializarRegra(regra);
}

export async function excluirRegra(espacoId: string, id: string): Promise<void> {
  await buscarRegraOuFalhar(espacoId, id);
  await prisma.regraTransacao.delete({ where: { id } });
}

export async function sugerirParaTransacao(espacoId: string, descricao: string) {
  const descricaoNormalizada = normalizarDescricao(descricao);
  const regra = await prisma.regraTransacao.findFirst({
    where: { espacoId, descricaoNormalizada },
  });
  return { contaId: regra?.contaId ?? null, categoriaId: regra?.categoriaId ?? null };
}

export async function aprenderComTransacao(
  espacoId: string,
  descricao: string,
  contaId: string,
  categoriaId: string | null,
): Promise<void> {
  const descricaoTratada = descricao.trim();
  if (!descricaoTratada) return;
  const descricaoNormalizada = normalizarDescricao(descricaoTratada);

  await prisma.regraTransacao.upsert({
    where: { espacoId_descricaoNormalizada: { espacoId, descricaoNormalizada } },
    update: { descricao: descricaoTratada, contaId, categoriaId },
    create: {
      espacoId,
      descricao: descricaoTratada,
      descricaoNormalizada,
      contaId,
      categoriaId,
    },
  });
}
