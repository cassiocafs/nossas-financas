import type { Conta } from '@/api/contas';
import type { ResumoMensal } from '@/api/transacoes';
import type { OperacaoPendente } from '@/lib/syncQueue';

function valorComSinal(tipo: 'DESPESA' | 'RECEITA', valor: number): number {
  return tipo === 'DESPESA' ? -Math.abs(valor) : Math.abs(valor);
}

/**
 * Projeta no saldo das contas as criações que ainda vivem apenas no aparelho.
 * O backend só considera lançamentos até hoje no saldo atual, por isso a
 * projeção segue a mesma regra para não antecipar lançamentos futuros.
 */
export function aplicarPendenciasEmContas(
  contas: Conta[] | undefined,
  fila: OperacaoPendente[],
  hoje: string,
): Conta[] | undefined {
  if (!contas || fila.length === 0) return contas;

  const deltas = new Map<string, number>();
  const acumular = (contaId: string, valor: number) =>
    deltas.set(contaId, (deltas.get(contaId) ?? 0) + valor);

  for (const operacao of fila) {
    if (operacao.tipo === 'criarTransacao' && operacao.payload.data <= hoje) {
      acumular(operacao.payload.contaId, valorComSinal(operacao.payload.tipo, operacao.payload.valor));
    }
    if (operacao.tipo === 'criarTransferencia' && operacao.payload.data <= hoje) {
      acumular(operacao.payload.contaOrigemId, -Math.abs(operacao.payload.valor));
      acumular(operacao.payload.contaDestinoId, Math.abs(operacao.payload.valor));
    }
  }

  return contas.map((conta) => ({ ...conta, saldoAtual: conta.saldoAtual + (deltas.get(conta.id) ?? 0) }));
}

/** Aplica à faixa mensal da Home os lançamentos ainda pendentes de envio. */
export function aplicarPendenciasEmResumo(
  resumo: ResumoMensal | undefined,
  fila: OperacaoPendente[],
  ano: number,
  mes: number,
): ResumoMensal | undefined {
  if (!resumo || fila.length === 0) return resumo;

  const prefixoMes = `${ano}-${String(mes).padStart(2, '0')}`;
  let entradas = 0;
  let saidas = 0;

  for (const operacao of fila) {
    if (operacao.tipo !== 'criarTransacao' || !operacao.payload.data.startsWith(prefixoMes)) continue;
    const valor = Math.abs(operacao.payload.valor);
    if (operacao.payload.tipo === 'RECEITA') entradas += valor;
    else saidas += valor;
  }

  if (entradas === 0 && saidas === 0) return resumo;
  return {
    ...resumo,
    totalEntradas: resumo.totalEntradas + entradas,
    totalSaidas: resumo.totalSaidas + saidas,
    saldoFinal: resumo.saldoFinal + entradas - saidas,
  };
}
