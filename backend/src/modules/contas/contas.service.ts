import type { Conta } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";
import { hojeUTC } from "../../lib/datas.js";
import { toNumber } from "../../lib/decimal.js";
import type {
  CriarContaInput,
  EditarContaInput,
  ExcluirContaInput,
} from "./contas.schemas.js";

interface ContaComSaldo {
  id: string;
  nome: string;
  saldoInicial: number;
  ativa: boolean;
  saldoAtual: number;
}

async function calcularSaldos(
  espacoId: string,
  contas: Conta[],
): Promise<Map<string, number>> {
  if (contas.length === 0) return new Map();

  const somas = await prisma.transacao.groupBy({
    by: ["contaId"],
    where: {
      espacoId,
      contaId: { in: contas.map((c) => c.id) },
      data: { lte: hojeUTC() },
    },
    _sum: { valor: true },
  });

  const mapaSomas = new Map(somas.map((s) => [s.contaId, toNumber(s._sum.valor)]));

  return new Map(
    contas.map((c) => [c.id, toNumber(c.saldoInicial) + (mapaSomas.get(c.id) ?? 0)]),
  );
}

function serializarConta(conta: Conta, saldoAtual: number): ContaComSaldo {
  return {
    id: conta.id,
    nome: conta.nome,
    saldoInicial: toNumber(conta.saldoInicial),
    ativa: conta.ativa,
    saldoAtual,
  };
}

export async function listarContas(
  espacoId: string,
  incluirInativas: boolean,
): Promise<ContaComSaldo[]> {
  const contas = await prisma.conta.findMany({
    where: { espacoId, ...(incluirInativas ? {} : { ativa: true }) },
    orderBy: { nome: "asc" },
  });

  const saldos = await calcularSaldos(espacoId, contas);
  return contas.map((c) => serializarConta(c, saldos.get(c.id) ?? toNumber(c.saldoInicial)));
}

export async function criarConta(
  espacoId: string,
  input: CriarContaInput,
): Promise<ContaComSaldo> {
  const conta = await prisma.conta.create({
    data: {
      espacoId,
      nome: input.nome,
      saldoInicial: input.saldoInicial,
      ativa: input.ativa,
    },
  });

  return serializarConta(conta, toNumber(conta.saldoInicial));
}

export async function editarConta(
  espacoId: string,
  id: string,
  input: EditarContaInput,
): Promise<ContaComSaldo> {
  const contaExistente = await prisma.conta.findFirst({ where: { id, espacoId } });
  if (!contaExistente) throw new HttpError(404, "Conta não encontrada");

  const conta = await prisma.conta.update({ where: { id }, data: input });
  const saldos = await calcularSaldos(espacoId, [conta]);
  return serializarConta(conta, saldos.get(conta.id) ?? toNumber(conta.saldoInicial));
}

export async function buscarImpactoExclusao(
  espacoId: string,
  id: string,
): Promise<{ transacoesVinculadas: number }> {
  const conta = await prisma.conta.findFirst({ where: { id, espacoId } });
  if (!conta) throw new HttpError(404, "Conta não encontrada");

  const transacoesVinculadas = await prisma.transacao.count({
    where: { espacoId, contaId: id },
  });

  return { transacoesVinculadas };
}

export async function excluirConta(
  espacoId: string,
  id: string,
  opts?: ExcluirContaInput,
): Promise<void> {
  const conta = await prisma.conta.findFirst({ where: { id, espacoId } });
  if (!conta) throw new HttpError(404, "Conta não encontrada");

  const transacoesVinculadas = await prisma.transacao.count({
    where: { espacoId, contaId: id },
  });

  if (transacoesVinculadas > 0 && !opts?.estrategia) {
    throw new HttpError(409, "Conta possui transações vinculadas", {
      transacoesVinculadas,
    });
  }

  await prisma.$transaction(async (tx) => {
    if (transacoesVinculadas > 0 && opts?.estrategia === "excluirTransacoes") {
      const transacoes = await tx.transacao.findMany({
        where: { espacoId, contaId: id },
        select: { transferenciaGrupoId: true },
      });
      const grupos = transacoes
        .map((t) => t.transferenciaGrupoId)
        .filter((g): g is string => !!g);

      await tx.transacao.deleteMany({
        where: {
          espacoId,
          OR: [{ contaId: id }, { transferenciaGrupoId: { in: grupos } }],
        },
      });
    } else if (transacoesVinculadas > 0 && opts?.estrategia === "realocar") {
      const contaDestino = await tx.conta.findFirst({
        where: { id: opts.contaDestinoId, espacoId },
      });
      if (!contaDestino) throw new HttpError(404, "Conta de destino não encontrada");

      await tx.transacao.updateMany({
        where: { espacoId, contaId: id },
        data: { contaId: opts.contaDestinoId! },
      });
    }

    await tx.conta.delete({ where: { id } });
  });
}
