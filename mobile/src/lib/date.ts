import type { PeriodoMes } from '@/api/transacoes';

export function subtrairMeses(periodo: PeriodoMes, quantidade: number): PeriodoMes {
  const data = new Date(Date.UTC(periodo.ano, periodo.mes - 1 - quantidade, 1));
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1 };
}
