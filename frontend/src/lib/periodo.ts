import type { PeriodoMes } from "@/api/transacoes";

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function hojePeriodo(): PeriodoMes {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

export function subtrairMeses(periodo: PeriodoMes, quantidade: number): PeriodoMes {
  const data = new Date(Date.UTC(periodo.ano, periodo.mes - 1 - quantidade, 1));
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1 };
}

/** Ordinal do mês/ano, para comparar e diferenciar períodos. */
export function ordinalMes(periodo: PeriodoMes): number {
  return periodo.ano * 12 + (periodo.mes - 1);
}

/** Quantidade de meses no intervalo inclusivo [inicio, fim]. */
export function contarMeses(inicio: PeriodoMes, fim: PeriodoMes): number {
  return Math.max(0, ordinalMes(fim) - ordinalMes(inicio)) + 1;
}

export function mesAbrev(mes: number): string {
  return MESES_ABREV[mes - 1] ?? String(mes);
}

/** "abr–set/2025" ou "dez/2024–mar/2025". */
export function formatarPeriodoLabel(inicio: PeriodoMes, fim: PeriodoMes): string {
  const ini = `${mesAbrev(inicio.mes)}${inicio.ano === fim.ano ? "" : `/${inicio.ano}`}`;
  const f = `${mesAbrev(fim.mes)}/${fim.ano}`;
  return ordinalMes(inicio) === ordinalMes(fim) ? f : `${ini}–${f}`;
}

/** "2025-04" — usado na sincronização com a URL. */
export function periodoParaParam(periodo: PeriodoMes): string {
  return `${periodo.ano}-${String(periodo.mes).padStart(2, "0")}`;
}

export function paramParaPeriodo(valor: string | null): PeriodoMes | null {
  if (!valor) return null;
  const m = /^(\d{4})-(\d{1,2})$/.exec(valor);
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return null;
  return { ano, mes };
}
