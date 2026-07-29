import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import type {
  CriarCategoriaInput,
  CriarGrupoInput,
  CriarSubgrupoInput,
  EditarCategoriaInput,
  EditarGrupoInput,
  EditarSubgrupoInput,
  ExcluirCategoriaInput,
} from "./categorias.schemas.js";

const CATEGORIA_INCLUDE = {
  regras: { orderBy: { criadoEm: "asc" as const } },
} satisfies Prisma.CategoriaInclude;

async function buscarGrupoOuFalhar(espacoId: string, id: string) {
  const grupo = await prisma.grupoCategoria.findFirst({ where: { id, espacoId } });
  if (!grupo) throw new HttpError(404, "Grupo não encontrado");
  return grupo;
}

async function buscarSubgrupoOuFalhar(espacoId: string, id: string) {
  const subgrupo = await prisma.subgrupoCategoria.findFirst({ where: { id, espacoId } });
  if (!subgrupo) throw new HttpError(404, "Subgrupo não encontrado");
  return subgrupo;
}

async function buscarCategoriaOuFalhar(espacoId: string, id: string) {
  const categoria = await prisma.categoria.findFirst({ where: { id, espacoId } });
  if (!categoria) throw new HttpError(404, "Categoria não encontrada");
  return categoria;
}

async function garantirNomeDisponivel(
  espacoId: string,
  grupoId: string | null,
  subgrupoId: string | null,
  nome: string,
  ignorarId?: string,
) {
  const existente = await prisma.categoria.findFirst({
    where: {
      espacoId,
      grupoId,
      subgrupoId,
      nome,
      ...(ignorarId ? { id: { not: ignorarId } } : {}),
    },
  });
  if (existente) {
    throw new HttpError(409, "Já existe uma categoria com esse nome neste grupo");
  }
}

export async function listarGrupos(espacoId: string) {
  const [grupos, semGrupo] = await Promise.all([
    prisma.grupoCategoria.findMany({
      where: { espacoId },
      orderBy: [{ ordem: "asc" }, { nome: "asc" }],
      include: {
        subgrupos: {
          orderBy: [{ ordem: "asc" }, { nome: "asc" }],
          include: {
            categorias: { include: CATEGORIA_INCLUDE, orderBy: { nome: "asc" } },
          },
        },
        categorias: {
          where: { subgrupoId: null },
          include: CATEGORIA_INCLUDE,
          orderBy: { nome: "asc" },
        },
      },
    }),
    prisma.categoria.findMany({
      where: { espacoId, grupoId: null },
      include: CATEGORIA_INCLUDE,
      orderBy: { nome: "asc" },
    }),
  ]);

  return { grupos, semGrupo };
}

export async function criarGrupo(espacoId: string, input: CriarGrupoInput) {
  const existente = await prisma.grupoCategoria.findFirst({
    where: { espacoId, nome: input.nome },
  });
  if (existente) throw new HttpError(409, "Já existe um grupo com esse nome");

  return prisma.grupoCategoria.create({ data: { espacoId, nome: input.nome } });
}

export async function editarGrupo(espacoId: string, id: string, input: EditarGrupoInput) {
  await buscarGrupoOuFalhar(espacoId, id);

  if (input.nome) {
    const duplicado = await prisma.grupoCategoria.findFirst({
      where: { espacoId, nome: input.nome, id: { not: id } },
    });
    if (duplicado) throw new HttpError(409, "Já existe um grupo com esse nome");
  }

  return prisma.grupoCategoria.update({ where: { id }, data: input });
}

export async function excluirGrupo(espacoId: string, id: string): Promise<void> {
  await buscarGrupoOuFalhar(espacoId, id);

  const [totalCategorias, totalSubgrupos] = await Promise.all([
    prisma.categoria.count({ where: { espacoId, grupoId: id } }),
    prisma.subgrupoCategoria.count({ where: { espacoId, grupoId: id } }),
  ]);
  if (totalCategorias > 0 || totalSubgrupos > 0) {
    throw new HttpError(409, "Grupo possui categorias ou subgrupos vinculados", {
      categoriasVinculadas: totalCategorias,
      subgruposVinculados: totalSubgrupos,
    });
  }

  await prisma.grupoCategoria.delete({ where: { id } });
}

export async function criarSubgrupo(espacoId: string, input: CriarSubgrupoInput) {
  await buscarGrupoOuFalhar(espacoId, input.grupoId);

  const existente = await prisma.subgrupoCategoria.findFirst({
    where: { grupoId: input.grupoId, nome: input.nome },
  });
  if (existente) throw new HttpError(409, "Já existe um subgrupo com esse nome neste grupo");

  return prisma.subgrupoCategoria.create({
    data: { espacoId, grupoId: input.grupoId, nome: input.nome },
  });
}

export async function editarSubgrupo(espacoId: string, id: string, input: EditarSubgrupoInput) {
  const subgrupo = await buscarSubgrupoOuFalhar(espacoId, id);

  if (input.nome) {
    const duplicado = await prisma.subgrupoCategoria.findFirst({
      where: { grupoId: subgrupo.grupoId, nome: input.nome, id: { not: id } },
    });
    if (duplicado) throw new HttpError(409, "Já existe um subgrupo com esse nome neste grupo");
  }

  return prisma.subgrupoCategoria.update({ where: { id }, data: input });
}

export async function excluirSubgrupo(espacoId: string, id: string): Promise<void> {
  await buscarSubgrupoOuFalhar(espacoId, id);

  const totalCategorias = await prisma.categoria.count({ where: { espacoId, subgrupoId: id } });
  if (totalCategorias > 0) {
    throw new HttpError(409, "Subgrupo possui categorias vinculadas", {
      categoriasVinculadas: totalCategorias,
    });
  }

  await prisma.subgrupoCategoria.delete({ where: { id } });
}

export async function criarCategoria(espacoId: string, input: CriarCategoriaInput) {
  if (input.grupoId) {
    await buscarGrupoOuFalhar(espacoId, input.grupoId);
  }
  if (input.subgrupoId) {
    const subgrupo = await buscarSubgrupoOuFalhar(espacoId, input.subgrupoId);
    if (subgrupo.grupoId !== input.grupoId) {
      throw new HttpError(400, "Subgrupo não pertence ao grupo informado");
    }
  }
  await garantirNomeDisponivel(espacoId, input.grupoId, input.subgrupoId ?? null, input.nome);

  return prisma.categoria.create({
    data: {
      espacoId,
      nome: input.nome,
      grupoId: input.grupoId,
      subgrupoId: input.subgrupoId ?? null,
      tipo: input.tipo,
    },
    include: CATEGORIA_INCLUDE,
  });
}

export async function editarCategoria(
  espacoId: string,
  id: string,
  input: EditarCategoriaInput,
) {
  const categoria = await buscarCategoriaOuFalhar(espacoId, id);

  if (input.grupoId !== undefined && input.grupoId !== null) {
    await buscarGrupoOuFalhar(espacoId, input.grupoId);
  }

  const grupoId = input.grupoId !== undefined ? input.grupoId : categoria.grupoId;
  const subgrupoId = input.subgrupoId !== undefined ? input.subgrupoId : categoria.subgrupoId;

  if (subgrupoId) {
    const subgrupo = await buscarSubgrupoOuFalhar(espacoId, subgrupoId);
    if (subgrupo.grupoId !== grupoId) {
      throw new HttpError(400, "Subgrupo não pertence ao grupo informado");
    }
  }

  const nome = input.nome ?? categoria.nome;
  if (input.nome !== undefined || input.grupoId !== undefined || input.subgrupoId !== undefined) {
    await garantirNomeDisponivel(espacoId, grupoId, subgrupoId, nome, id);
  }

  return prisma.categoria.update({
    where: { id },
    data: input,
    include: CATEGORIA_INCLUDE,
  });
}

export async function buscarImpactoExclusaoCategoria(espacoId: string, id: string) {
  await buscarCategoriaOuFalhar(espacoId, id);

  const [transacoesVinculadas, orcamentoItensVinculados] = await Promise.all([
    prisma.transacao.count({ where: { espacoId, categoriaId: id } }),
    prisma.orcamentoCategoriaMes.count({ where: { categoriaId: id } }),
  ]);

  return { transacoesVinculadas, orcamentoItensVinculados };
}

export async function excluirCategoria(
  espacoId: string,
  id: string,
  opts?: ExcluirCategoriaInput,
): Promise<void> {
  await buscarCategoriaOuFalhar(espacoId, id);

  const transacoesVinculadas = await prisma.transacao.count({
    where: { espacoId, categoriaId: id },
  });

  if (transacoesVinculadas > 0 && !opts?.estrategia) {
    throw new HttpError(409, "Categoria possui transações vinculadas", {
      transacoesVinculadas,
    });
  }

  await prisma.$transaction(async (tx) => {
    if (transacoesVinculadas > 0) {
      if (opts?.estrategia === "realocarPara") {
        const destino = await tx.categoria.findFirst({
          where: { id: opts.categoriaDestinoId, espacoId },
        });
        if (!destino) throw new HttpError(404, "Categoria de destino não encontrada");

        await tx.transacao.updateMany({
          where: { espacoId, categoriaId: id },
          data: { categoriaId: opts.categoriaDestinoId! },
        });
      } else {
        await tx.transacao.updateMany({
          where: { espacoId, categoriaId: id },
          data: { categoriaId: null },
        });
      }
    }

    await tx.orcamentoCategoriaMes.deleteMany({ where: { categoriaId: id } });
    await tx.regraCategorizacao.deleteMany({ where: { categoriaId: id } });
    await tx.categoria.delete({ where: { id } });
  });
}

export async function criarRegra(espacoId: string, categoriaId: string, palavraChave: string) {
  await buscarCategoriaOuFalhar(espacoId, categoriaId);

  const existente = await prisma.regraCategorizacao.findFirst({
    where: { categoriaId, palavraChave },
  });
  if (existente) {
    throw new HttpError(409, "Essa palavra-chave já está cadastrada para esta categoria");
  }

  return prisma.regraCategorizacao.create({ data: { categoriaId, palavraChave } });
}

export async function removerRegra(
  espacoId: string,
  categoriaId: string,
  regraId: string,
): Promise<void> {
  await buscarCategoriaOuFalhar(espacoId, categoriaId);

  const regra = await prisma.regraCategorizacao.findFirst({
    where: { id: regraId, categoriaId },
  });
  if (!regra) throw new HttpError(404, "Regra não encontrada");

  await prisma.regraCategorizacao.delete({ where: { id: regraId } });
}

export async function sugerirCategoria(espacoId: string, descricao: string) {
  const resultado = await prisma.$queryRaw<
    { categoriaId: string; palavraChave: string }[]
  >(Prisma.sql`
    SELECT r."categoriaId", r."palavraChave"
    FROM "RegraCategorizacao" r
    JOIN "Categoria" c ON c.id = r."categoriaId"
    WHERE c."espacoId" = ${espacoId} AND ${descricao} ILIKE '%' || r."palavraChave" || '%'
    ORDER BY length(r."palavraChave") DESC, r."criadoEm" ASC
    LIMIT 1
  `);

  const match = resultado[0];
  return { categoriaId: match?.categoriaId ?? null, palavraChave: match?.palavraChave ?? null };
}
