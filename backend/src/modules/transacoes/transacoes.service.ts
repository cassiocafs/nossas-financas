import type { Prisma, Transacao } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import {
  formatDataISO,
  hojeUTC,
  primeiroDiaMesUTC,
  ultimoDiaMesUTC,
} from "../../lib/datas.js";
import { toNumber } from "../../lib/decimal.js";
import type {
  CriarTransacaoInput,
  CriarTransferenciaInput,
  EditarTransacaoInput,
  ListarTransacoesQuery,
} from "./transacoes.schemas.js";

const TRANSACAO_INCLUDE = {
  conta: { select: { id: true, nome: true } },
  categoria: { select: { id: true, nome: true } },
} satisfies Prisma.TransacaoInclude;

type TransacaoComRelacoes = Prisma.TransacaoGetPayload<{ include: typeof TRANSACAO_INCLUDE }>;

interface TransacaoDTO {
  id: string;
  tipo: string;
  data: string;
  descricao: string;
  contaId: string;
  conta: { id: string; nome: string };
  categoriaId: string | null;
  categoria: { id: string; nome: string } | null;
  valor: number;
  consolidado: boolean;
  nota: string | null;
  transferenciaGrupoId: string | null;
}

function serializarTransacao(t: TransacaoComRelacoes): TransacaoDTO {
  return {
    id: t.id,
    tipo: t.tipo,
    data: formatDataISO(t.data),
    descricao: t.descricao,
    contaId: t.contaId,
    conta: t.conta,
    categoriaId: t.categoriaId,
    categoria: t.categoria,
    valor: toNumber(t.valor),
    consolidado: t.consolidado,
    nota: t.nota,
    transferenciaGrupoId: t.transferenciaGrupoId,
  };
}

function valorComSinal(tipo: "DESPESA" | "RECEITA", valorPositivo: number): number {
  return tipo === "DESPESA" ? -Math.abs(valorPositivo) : Math.abs(valorPositivo);
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

async function buscarTransacaoOuFalhar(espacoId: string, id: string): Promise<Transacao> {
  const transacao = await prisma.transacao.findFirst({ where: { id, espacoId } });
  if (!transacao) throw new HttpError(404, "Transação não encontrada");
  return transacao;
}

export async function buscarTransacao(espacoId: string, id: string): Promise<TransacaoDTO> {
  const transacao = await prisma.transacao.findFirst({
    where: { id, espacoId },
    include: TRANSACAO_INCLUDE,
  });
  if (!transacao) throw new HttpError(404, "Transação não encontrada");
  return serializarTransacao(transacao);
}

export async function criarTransacao(
  espacoId: string,
  input: CriarTransacaoInput,
): Promise<TransacaoDTO> {
  await buscarContaOuFalhar(espacoId, input.contaId);
  if (input.categoriaId) {
    await buscarCategoriaOuFalhar(espacoId, input.categoriaId);
  }

  const transacao = await prisma.transacao.create({
    data: {
      espacoId,
      tipo: input.tipo,
      data: input.data,
      descricao: input.descricao,
      contaId: input.contaId,
      categoriaId: input.categoriaId ?? null,
      valor: valorComSinal(input.tipo, input.valor),
      consolidado: input.consolidado,
      nota: input.nota,
    },
    include: TRANSACAO_INCLUDE,
  });

  return serializarTransacao(transacao);
}

const CAMPOS_PERMITIDOS_EM_TRANSFERENCIA = new Set(["data", "descricao", "nota", "consolidado"]);

export async function editarTransacao(
  espacoId: string,
  id: string,
  input: EditarTransacaoInput,
): Promise<TransacaoDTO> {
  const transacao = await buscarTransacaoOuFalhar(espacoId, id);

  if (transacao.transferenciaGrupoId) {
    const camposNaoPermitidos = Object.keys(input).filter(
      (campo) => !CAMPOS_PERMITIDOS_EM_TRANSFERENCIA.has(campo),
    );
    if (camposNaoPermitidos.length > 0) {
      throw new HttpError(
        400,
        "Use o endpoint de transferências para alterar valor ou contas de uma transferência",
      );
    }

    const dadosComuns: Prisma.TransacaoUpdateInput = {
      ...(input.data !== undefined ? { data: input.data } : {}),
      ...(input.descricao !== undefined ? { descricao: input.descricao } : {}),
      ...(input.nota !== undefined ? { nota: input.nota } : {}),
      ...(input.consolidado !== undefined ? { consolidado: input.consolidado } : {}),
    };

    const [atualizada] = await prisma.$transaction([
      prisma.transacao.update({
        where: { id },
        data: dadosComuns,
        include: TRANSACAO_INCLUDE,
      }),
      prisma.transacao.updateMany({
        where: { espacoId, transferenciaGrupoId: transacao.transferenciaGrupoId, id: { not: id } },
        data: dadosComuns,
      }),
    ]);

    return serializarTransacao(atualizada);
  }

  if (input.contaId) await buscarContaOuFalhar(espacoId, input.contaId);
  if (input.categoriaId) await buscarCategoriaOuFalhar(espacoId, input.categoriaId);

  const tipoFinal = (input.tipo ?? transacao.tipo) as "DESPESA" | "RECEITA";
  const valorPositivo = input.valor ?? Math.abs(toNumber(transacao.valor));

  const atualizada = await prisma.transacao.update({
    where: { id },
    data: {
      tipo: tipoFinal,
      ...(input.data !== undefined ? { data: input.data } : {}),
      ...(input.descricao !== undefined ? { descricao: input.descricao } : {}),
      ...(input.contaId !== undefined ? { contaId: input.contaId } : {}),
      ...(input.categoriaId !== undefined ? { categoriaId: input.categoriaId } : {}),
      valor: valorComSinal(tipoFinal, valorPositivo),
      ...(input.consolidado !== undefined ? { consolidado: input.consolidado } : {}),
      ...(input.nota !== undefined ? { nota: input.nota } : {}),
    },
    include: TRANSACAO_INCLUDE,
  });

  return serializarTransacao(atualizada);
}

export async function excluirTransacao(espacoId: string, id: string): Promise<void> {
  const transacao = await buscarTransacaoOuFalhar(espacoId, id);

  if (transacao.transferenciaGrupoId) {
    await prisma.transacao.deleteMany({
      where: { espacoId, transferenciaGrupoId: transacao.transferenciaGrupoId },
    });
    return;
  }

  await prisma.transacao.delete({ where: { id } });
}

export async function excluirTransacoesLote(
  espacoId: string,
  ids: string[],
): Promise<{ excluidas: number }> {
  const transacoes = await prisma.transacao.findMany({
    where: { espacoId, id: { in: ids } },
    select: { transferenciaGrupoId: true },
  });
  const grupos = transacoes
    .map((t) => t.transferenciaGrupoId)
    .filter((g): g is string => !!g);

  const resultado = await prisma.transacao.deleteMany({
    where: {
      espacoId,
      OR: [{ id: { in: ids } }, { transferenciaGrupoId: { in: grupos } }],
    },
  });

  return { excluidas: resultado.count };
}

export async function consolidarLote(
  espacoId: string,
  ids: string[],
  consolidado: boolean,
): Promise<{ atualizadas: number }> {
  const resultado = await prisma.transacao.updateMany({
    where: { espacoId, id: { in: ids } },
    data: { consolidado },
  });
  return { atualizadas: resultado.count };
}

export async function categorizarLote(
  espacoId: string,
  ids: string[],
  categoriaId: string | null,
): Promise<{ atualizadas: number }> {
  if (categoriaId) await buscarCategoriaOuFalhar(espacoId, categoriaId);

  const resultado = await prisma.transacao.updateMany({
    where: { espacoId, id: { in: ids }, tipo: { not: "TRANSFERENCIA" } },
    data: { categoriaId },
  });
  return { atualizadas: resultado.count };
}

export async function criarTransferencia(
  espacoId: string,
  input: CriarTransferenciaInput,
) {
  await buscarContaOuFalhar(espacoId, input.contaOrigemId);
  await buscarContaOuFalhar(espacoId, input.contaDestinoId);

  const grupoId = crypto.randomUUID();
  const descricao = input.descricao?.trim() || "Transferência entre contas";

  const [saida, entrada] = await prisma.$transaction([
    prisma.transacao.create({
      data: {
        espacoId,
        tipo: "TRANSFERENCIA",
        data: input.data,
        descricao,
        contaId: input.contaOrigemId,
        categoriaId: null,
        valor: -Math.abs(input.valor),
        consolidado: input.consolidado,
        nota: input.nota,
        transferenciaGrupoId: grupoId,
      },
      include: TRANSACAO_INCLUDE,
    }),
    prisma.transacao.create({
      data: {
        espacoId,
        tipo: "TRANSFERENCIA",
        data: input.data,
        descricao,
        contaId: input.contaDestinoId,
        categoriaId: null,
        valor: Math.abs(input.valor),
        consolidado: input.consolidado,
        nota: input.nota,
        transferenciaGrupoId: grupoId,
      },
      include: TRANSACAO_INCLUDE,
    }),
  ]);

  return {
    transferenciaGrupoId: grupoId,
    transacoes: [serializarTransacao(saida), serializarTransacao(entrada)],
  };
}

async function resolverContasEmEscopo(espacoId: string, contaIds?: string[]) {
  return prisma.conta.findMany({
    where: { espacoId, ...(contaIds ? { id: { in: contaIds } } : {}) },
  });
}

async function calcularSaldoAnterior(
  espacoId: string,
  contaIdsEmEscopo: string[],
  saldoInicialTotal: number,
  primeiroDia: Date,
): Promise<number> {
  const agregado = await prisma.transacao.aggregate({
    where: { espacoId, contaId: { in: contaIdsEmEscopo }, data: { lt: primeiroDia } },
    _sum: { valor: true },
  });
  return saldoInicialTotal + toNumber(agregado._sum.valor);
}

export async function listarTransacoesMes(espacoId: string, filtros: ListarTransacoesQuery) {
  const contas = await resolverContasEmEscopo(espacoId, filtros.contaIds);
  const contaIdsEmEscopo = contas.map((c) => c.id);
  const saldoInicialTotal = contas.reduce((soma, c) => soma + toNumber(c.saldoInicial), 0);

  const primeiroDia = primeiroDiaMesUTC(filtros.ano, filtros.mes);
  const ultimoDia = ultimoDiaMesUTC(filtros.ano, filtros.mes);

  const saldoAnterior = await calcularSaldoAnterior(
    espacoId,
    contaIdsEmEscopo,
    saldoInicialTotal,
    primeiroDia,
  );

  const transacoes = await prisma.transacao.findMany({
    where: {
      espacoId,
      contaId: { in: contaIdsEmEscopo },
      data: { gte: primeiroDia, lte: ultimoDia },
      ...(filtros.categoriaIds ? { categoriaId: { in: filtros.categoriaIds } } : {}),
      ...(filtros.status === "consolidadas" ? { consolidado: true } : {}),
      ...(filtros.status === "pendentes" ? { consolidado: false } : {}),
      ...(filtros.texto ? { descricao: { contains: filtros.texto, mode: "insensitive" } } : {}),
    },
    include: TRANSACAO_INCLUDE,
    orderBy: [{ data: "asc" }, { criadoEm: "asc" }],
  });

  const dias: { data: string; saldoDia: number; transacoes: TransacaoDTO[] }[] = [];
  let running = saldoAnterior;
  let totalEntradas = 0;
  let totalSaidas = 0;

  let diaAtual: { data: string; saldoDia: number; transacoes: TransacaoDTO[] } | null = null;

  for (const t of transacoes) {
    const dataISO = formatDataISO(t.data);
    const valor = toNumber(t.valor);
    running += valor;

    if (t.tipo !== "TRANSFERENCIA") {
      if (valor > 0) totalEntradas += valor;
      else totalSaidas += Math.abs(valor);
    }

    if (!diaAtual || diaAtual.data !== dataISO) {
      diaAtual = { data: dataISO, saldoDia: running, transacoes: [] };
      dias.push(diaAtual);
    } else {
      diaAtual.saldoDia = running;
    }
    diaAtual.transacoes.push(serializarTransacao(t));
  }

  return {
    saldoAnterior,
    dias,
    totalEntradas,
    totalSaidas,
    saldoFinal: running,
  };
}

export async function buscarResumoMensal(espacoId: string, ano: number, mes: number) {
  const contas = await resolverContasEmEscopo(espacoId, undefined);
  const contaIdsEmEscopo = contas.map((c) => c.id);
  const saldoInicialTotal = contas.reduce((soma, c) => soma + toNumber(c.saldoInicial), 0);

  const primeiroDia = primeiroDiaMesUTC(ano, mes);
  const ultimoDia = ultimoDiaMesUTC(ano, mes);
  const hoje = hojeUTC();

  const saldoAnterior = await calcularSaldoAnterior(
    espacoId,
    contaIdsEmEscopo,
    saldoInicialTotal,
    primeiroDia,
  );

  const transacoesDoMes = await prisma.transacao.findMany({
    where: {
      espacoId,
      contaId: { in: contaIdsEmEscopo },
      data: { gte: primeiroDia, lte: ultimoDia },
    },
    include: TRANSACAO_INCLUDE,
  });

  let totalEntradas = 0;
  let totalSaidas = 0;
  let movimentoTotal = 0;
  const despesasPorCategoriaMap = new Map<string, { categoriaNome: string; total: number }>();

  for (const t of transacoesDoMes) {
    const valor = toNumber(t.valor);
    movimentoTotal += valor;

    if (t.tipo !== "TRANSFERENCIA") {
      if (valor > 0) totalEntradas += valor;
      else totalSaidas += Math.abs(valor);
    }

    if (t.tipo === "DESPESA") {
      const chave = t.categoriaId ?? "sem-categoria";
      const nome = t.categoria?.nome ?? "Sem Categoria";
      const atual = despesasPorCategoriaMap.get(chave) ?? { categoriaNome: nome, total: 0 };
      atual.total += Math.abs(valor);
      despesasPorCategoriaMap.set(chave, atual);
    }
  }

  const [anterioresNaoConsolidadas, proximasNaoConsolidadas] = await Promise.all([
    prisma.transacao.findMany({
      where: { espacoId, contaId: { in: contaIdsEmEscopo }, consolidado: false, data: { lt: hoje } },
      include: TRANSACAO_INCLUDE,
      orderBy: { data: "asc" },
      take: 10,
    }),
    prisma.transacao.findMany({
      where: { espacoId, contaId: { in: contaIdsEmEscopo }, consolidado: false, data: { gte: hoje } },
      include: TRANSACAO_INCLUDE,
      orderBy: { data: "asc" },
      take: 10,
    }),
  ]);

  return {
    saldoAnterior,
    totalEntradas,
    totalSaidas,
    saldoFinal: saldoAnterior + movimentoTotal,
    anterioresNaoConsolidadas: anterioresNaoConsolidadas.map(serializarTransacao),
    proximasNaoConsolidadas: proximasNaoConsolidadas.map(serializarTransacao),
    despesasPorCategoria: Array.from(despesasPorCategoriaMap.entries()).map(
      ([categoriaId, v]) => ({
        categoriaId: categoriaId === "sem-categoria" ? null : categoriaId,
        categoriaNome: v.categoriaNome,
        total: v.total,
      }),
    ),
  };
}

function mesesAnteriores(
  ano: number,
  mes: number,
  quantidade: number,
): { ano: number; mes: number }[] {
  const lista: { ano: number; mes: number }[] = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    const data = new Date(Date.UTC(ano, mes - 1 - i, 1));
    lista.push({ ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1 });
  }
  return lista;
}

export async function buscarEvolucaoSaldo(espacoId: string, meses: number) {
  const contas = await resolverContasEmEscopo(espacoId, undefined);
  const contaIdsEmEscopo = contas.map((c) => c.id);
  const saldoInicialTotal = contas.reduce((soma, c) => soma + toNumber(c.saldoInicial), 0);

  const hoje = hojeUTC();
  const sequenciaMeses = mesesAnteriores(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1, meses);
  const primeiroDia = primeiroDiaMesUTC(sequenciaMeses[0].ano, sequenciaMeses[0].mes);

  let saldo = await calcularSaldoAnterior(
    espacoId,
    contaIdsEmEscopo,
    saldoInicialTotal,
    primeiroDia,
  );

  const transacoes = await prisma.transacao.findMany({
    where: { espacoId, contaId: { in: contaIdsEmEscopo }, data: { gte: primeiroDia } },
    select: { data: true, valor: true },
    orderBy: { data: "asc" },
  });

  let indiceTransacao = 0;
  const evolucao: { ano: number; mes: number; saldoFinal: number }[] = [];

  for (const { ano, mes } of sequenciaMeses) {
    const ultimoDia = ultimoDiaMesUTC(ano, mes);
    while (
      indiceTransacao < transacoes.length &&
      transacoes[indiceTransacao].data <= ultimoDia
    ) {
      saldo += toNumber(transacoes[indiceTransacao].valor);
      indiceTransacao++;
    }
    evolucao.push({ ano, mes, saldoFinal: saldo });
  }

  return evolucao;
}
