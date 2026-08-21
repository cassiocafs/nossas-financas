import { Prisma } from "@prisma/client";
import type { Transacao } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import {
  formatDataISO,
  hojeUTC,
  primeiroDiaMesUTC,
  ultimoDiaMesUTC,
} from "../../lib/datas.js";
import { toNumber } from "../../lib/decimal.js";
import { aprenderComTransacao } from "../regras/regras.service.js";
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

const NOME_CATEGORIA_TRANSFERENCIA = "Transferência";
const LIMITE_RECENTES = 6;

const CATEGORIA_RESUMO_INCLUDE = {
  conta: { select: { id: true, nome: true } },
  categoria: {
    select: {
      id: true,
      nome: true,
      grupoId: true,
      grupo: { select: { id: true, nome: true } },
      subgrupoId: true,
      subgrupo: { select: { id: true, nome: true } },
    },
  },
} satisfies Prisma.TransacaoInclude;

interface ItemCategoriaResumo {
  categoriaId: string | null;
  categoriaNome: string;
  grupoId: string | null;
  grupoNome: string | null;
  subgrupoId: string | null;
  subgrupoNome: string | null;
  total: number;
}

function acumularPorCategoria(
  mapa: Map<string, ItemCategoriaResumo>,
  t: {
    categoriaId: string | null;
    categoria: {
      nome: string;
      grupoId: string | null;
      grupo: { nome: string } | null;
      subgrupoId: string | null;
      subgrupo: { nome: string } | null;
    } | null;
  },
  valorAbsoluto: number,
): void {
  const chave = t.categoriaId ?? "sem-categoria";
  const atual = mapa.get(chave) ?? {
    categoriaId: t.categoriaId,
    categoriaNome: t.categoria?.nome ?? "Sem Categoria",
    grupoId: t.categoria?.grupoId ?? null,
    grupoNome: t.categoria?.grupo?.nome ?? null,
    subgrupoId: t.categoria?.subgrupoId ?? null,
    subgrupoNome: t.categoria?.subgrupo?.nome ?? null,
    total: 0,
  };
  atual.total += valorAbsoluto;
  mapa.set(chave, atual);
}

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

// Fire-and-forget: aprender a regra não deve atrasar a resposta ao usuário
// nem falhar a operação principal caso o upsert dê erro.
function dispararAprendizado(
  espacoId: string,
  descricao: string,
  contaId: string,
  categoriaId: string | null,
): void {
  aprenderComTransacao(espacoId, descricao, contaId, categoriaId).catch((err) => {
    console.error("Falha ao aprender regra a partir da transação", err);
  });
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

export interface TransferenciaDTO {
  transferenciaGrupoId: string;
  contaOrigem: { id: string; nome: string } | null;
  contaDestino: { id: string; nome: string } | null;
  transacoes: TransacaoDTO[];
}

export async function buscarTransferencia(
  espacoId: string,
  grupoId: string,
): Promise<TransferenciaDTO> {
  const transacoes = await prisma.transacao.findMany({
    where: { espacoId, transferenciaGrupoId: grupoId },
    include: TRANSACAO_INCLUDE,
  });
  if (transacoes.length === 0) throw new HttpError(404, "Transferência não encontrada");

  const origem = transacoes.find((t) => toNumber(t.valor) < 0) ?? null;
  const destino = transacoes.find((t) => toNumber(t.valor) > 0) ?? null;

  return {
    transferenciaGrupoId: grupoId,
    contaOrigem: origem?.conta ?? null,
    contaDestino: destino?.conta ?? null,
    transacoes: transacoes.map(serializarTransacao),
  };
}

export async function criarTransacao(
  espacoId: string,
  input: CriarTransacaoInput,
): Promise<TransacaoDTO> {
  if (input.id) {
    const existente = await prisma.transacao.findUnique({
      where: { id: input.id },
      include: TRANSACAO_INCLUDE,
    });
    if (existente) {
      if (existente.espacoId !== espacoId) {
        throw new HttpError(409, "Identificador já utilizado por outra transação");
      }
      return serializarTransacao(existente);
    }
  }

  await Promise.all([
    buscarContaOuFalhar(espacoId, input.contaId),
    input.categoriaId ? buscarCategoriaOuFalhar(espacoId, input.categoriaId) : Promise.resolve(),
  ]);

  let transacao;
  try {
    transacao = await prisma.transacao.create({
      data: {
        ...(input.id ? { id: input.id } : {}),
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
  } catch (err) {
    // Corrida entre duas tentativas do mesmo id (ex.: retry de sincronização
    // offline concorrente): a segunda chamada perde a checagem de replay
    // acima, mas ainda pode devolver o registro que a primeira acabou de criar.
    if (input.id && err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existente = await prisma.transacao.findUnique({
        where: { id: input.id },
        include: TRANSACAO_INCLUDE,
      });
      if (existente && existente.espacoId === espacoId) {
        return serializarTransacao(existente);
      }
    }
    throw err;
  }

  dispararAprendizado(espacoId, input.descricao, input.contaId, input.categoriaId ?? null);

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

  await Promise.all([
    input.contaId ? buscarContaOuFalhar(espacoId, input.contaId) : Promise.resolve(),
    input.categoriaId ? buscarCategoriaOuFalhar(espacoId, input.categoriaId) : Promise.resolve(),
  ]);

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

  dispararAprendizado(espacoId, atualizada.descricao, atualizada.contaId, atualizada.categoriaId);

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
  if (input.transferenciaGrupoId) {
    const existentes = await prisma.transacao.findMany({
      where: { espacoId, transferenciaGrupoId: input.transferenciaGrupoId },
      include: TRANSACAO_INCLUDE,
    });
    if (existentes.length > 0) {
      return montarResultadoTransferencia(input.transferenciaGrupoId, existentes);
    }
  }

  await Promise.all([
    buscarContaOuFalhar(espacoId, input.contaOrigemId),
    buscarContaOuFalhar(espacoId, input.contaDestinoId),
  ]);

  const grupoId = input.transferenciaGrupoId ?? crypto.randomUUID();
  const descricao = input.descricao?.trim() || "Transferência entre contas";

  try {
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

    return montarResultadoTransferencia(grupoId, [saida, entrada]);
  } catch (err) {
    // Corrida entre duas tentativas do mesmo transferenciaGrupoId (retry de
    // sincronização offline concorrente).
    if (
      input.transferenciaGrupoId &&
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const existentes = await prisma.transacao.findMany({
        where: { espacoId, transferenciaGrupoId: input.transferenciaGrupoId },
        include: TRANSACAO_INCLUDE,
      });
      if (existentes.length > 0) {
        return montarResultadoTransferencia(input.transferenciaGrupoId, existentes);
      }
    }
    throw err;
  }
}

function montarResultadoTransferencia(grupoId: string, transacoes: TransacaoComRelacoes[]) {
  return {
    transferenciaGrupoId: grupoId,
    transacoes: transacoes.map(serializarTransacao),
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

  const primeiroDiaMes = primeiroDiaMesUTC(filtros.ano, filtros.mes);
  const ultimoDiaMes = ultimoDiaMesUTC(filtros.ano, filtros.mes);
  const primeiroDia =
    filtros.dataInicio && filtros.dataInicio > primeiroDiaMes ? filtros.dataInicio : primeiroDiaMes;
  const ultimoDia = filtros.dataFim && filtros.dataFim < ultimoDiaMes ? filtros.dataFim : ultimoDiaMes;
  const buscaGlobal = Boolean(filtros.texto);

  const [saldoAnterior, transacoes] = await Promise.all([
    buscaGlobal
      ? Promise.resolve(saldoInicialTotal)
      : calcularSaldoAnterior(espacoId, contaIdsEmEscopo, saldoInicialTotal, primeiroDia),
    prisma.transacao.findMany({
      where: {
        espacoId,
        contaId: { in: contaIdsEmEscopo },
        ...(buscaGlobal ? {} : { data: { gte: primeiroDia, lte: ultimoDia } }),
        ...(filtros.categoriaIds ? { categoriaId: { in: filtros.categoriaIds } } : {}),
        ...(filtros.status === "consolidadas" ? { consolidado: true } : {}),
        ...(filtros.status === "pendentes" ? { consolidado: false } : {}),
        ...(filtros.texto ? { descricao: { contains: filtros.texto, mode: "insensitive" } } : {}),
      },
      include: TRANSACAO_INCLUDE,
      orderBy: [{ data: "asc" }, { criadoEm: "asc" }],
      ...(buscaGlobal ? { take: 200 } : {}),
    }),
  ]);

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

export async function buscarResumoMensal(
  espacoId: string,
  ano: number,
  mes: number,
  contaIds?: string[],
) {
  const contas = await resolverContasEmEscopo(espacoId, contaIds);
  const contaIdsEmEscopo = contas.map((c) => c.id);
  const saldoInicialTotal = contas.reduce((soma, c) => soma + toNumber(c.saldoInicial), 0);

  const primeiroDia = primeiroDiaMesUTC(ano, mes);
  const ultimoDia = ultimoDiaMesUTC(ano, mes);
  const hoje = hojeUTC();

  const [saldoAnterior, transacoesDoMes, anterioresNaoConsolidadas, proximasNaoConsolidadas] =
    await Promise.all([
      calcularSaldoAnterior(espacoId, contaIdsEmEscopo, saldoInicialTotal, primeiroDia),
      prisma.transacao.findMany({
        where: {
          espacoId,
          contaId: { in: contaIdsEmEscopo },
          data: { gte: primeiroDia, lte: ultimoDia },
        },
        include: CATEGORIA_RESUMO_INCLUDE,
      }),
      prisma.transacao.findMany({
        where: {
          espacoId,
          contaId: { in: contaIdsEmEscopo },
          consolidado: false,
          data: { lt: hoje },
        },
        include: TRANSACAO_INCLUDE,
        orderBy: { data: "asc" },
        take: 10,
      }),
      prisma.transacao.findMany({
        where: {
          espacoId,
          contaId: { in: contaIdsEmEscopo },
          consolidado: false,
          data: { gte: hoje },
        },
        include: TRANSACAO_INCLUDE,
        orderBy: { data: "asc" },
        take: 10,
      }),
    ]);

  let totalEntradas = 0;
  let totalSaidas = 0;
  let movimentoTotal = 0;
  const despesasPorCategoriaMap = new Map<string, ItemCategoriaResumo>();
  const receitasPorCategoriaMap = new Map<string, ItemCategoriaResumo>();

  for (const t of transacoesDoMes) {
    const valor = toNumber(t.valor);
    movimentoTotal += valor;

    if (t.tipo !== "TRANSFERENCIA") {
      if (valor > 0) totalEntradas += valor;
      else totalSaidas += Math.abs(valor);
    }

    if (t.categoria?.nome !== NOME_CATEGORIA_TRANSFERENCIA) {
      if (t.tipo === "DESPESA") {
        acumularPorCategoria(despesasPorCategoriaMap, t, Math.abs(valor));
      } else if (t.tipo === "RECEITA") {
        acumularPorCategoria(receitasPorCategoriaMap, t, Math.abs(valor));
      }
    }
  }

  const recentes = [...transacoesDoMes]
    .sort(
      (a, b) => b.data.getTime() - a.data.getTime() || b.criadoEm.getTime() - a.criadoEm.getTime(),
    )
    .slice(0, LIMITE_RECENTES)
    .map(serializarTransacao);

  return {
    saldoAnterior,
    totalEntradas,
    totalSaidas,
    saldoFinal: saldoAnterior + movimentoTotal,
    recentes,
    anterioresNaoConsolidadas: anterioresNaoConsolidadas.map(serializarTransacao),
    proximasNaoConsolidadas: proximasNaoConsolidadas.map(serializarTransacao),
    despesasPorCategoria: Array.from(despesasPorCategoriaMap.values()),
    receitasPorCategoria: Array.from(receitasPorCategoriaMap.values()),
  };
}

function sequenciaMeses(
  anoInicio: number,
  mesInicio: number,
  anoFim: number,
  mesFim: number,
): { ano: number; mes: number }[] {
  const lista: { ano: number; mes: number }[] = [];
  const totalInicio = anoInicio * 12 + (mesInicio - 1);
  const totalFim = anoFim * 12 + (mesFim - 1);
  for (let t = totalInicio; t <= totalFim; t++) {
    lista.push({ ano: Math.floor(t / 12), mes: (t % 12) + 1 });
  }
  return lista;
}

export async function buscarEvolucaoSaldo(
  espacoId: string,
  inicio: { ano: number; mes: number },
  fim: { ano: number; mes: number },
  contaIds?: string[],
) {
  const contas = await resolverContasEmEscopo(espacoId, contaIds);
  const contaIdsEmEscopo = contas.map((c) => c.id);
  const saldoInicialTotal = contas.reduce((soma, c) => soma + toNumber(c.saldoInicial), 0);

  const sequenciaMesesIntervalo = sequenciaMeses(inicio.ano, inicio.mes, fim.ano, fim.mes);
  const primeiroDia = primeiroDiaMesUTC(sequenciaMesesIntervalo[0].ano, sequenciaMesesIntervalo[0].mes);
  const ultimoMesIntervalo = sequenciaMesesIntervalo[sequenciaMesesIntervalo.length - 1];
  const ultimoDiaIntervalo = ultimoDiaMesUTC(ultimoMesIntervalo.ano, ultimoMesIntervalo.mes);

  const [saldoAnterior, transacoes] = await Promise.all([
    calcularSaldoAnterior(espacoId, contaIdsEmEscopo, saldoInicialTotal, primeiroDia),
    prisma.transacao.findMany({
      where: {
        espacoId,
        contaId: { in: contaIdsEmEscopo },
        data: { gte: primeiroDia, lte: ultimoDiaIntervalo },
      },
      select: { data: true, valor: true },
      orderBy: { data: "asc" },
    }),
  ]);
  let saldo = saldoAnterior;

  let indiceTransacao = 0;
  const evolucao: { ano: number; mes: number; saldoFinal: number }[] = [];

  for (const { ano, mes } of sequenciaMesesIntervalo) {
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
