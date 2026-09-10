/**
 * Legendas de variação dos cards do topo da Home — mesmas infos da versão web
 * (`frontend/src/pages/HomePage.tsx`).
 */

/** Variação percentual + delta em reais ante o mês anterior, ex.: "+8,2% · +R$ 950". */
export function variacaoTopoCaption(
  atual: number,
  anterior: number,
  formatar: (valor: number) => string,
): string {
  if (anterior === 0) return 'sem base de comparação';
  const pct = Number((((atual - anterior) / Math.abs(anterior)) * 100).toFixed(1));
  const delta = atual - anterior;
  const sinalPct = pct > 0 ? '+' : pct < 0 ? '−' : '';
  const sinalDelta = delta > 0 ? '+' : delta < 0 ? '−' : '';
  return `${sinalPct}${Math.abs(pct).toFixed(1).replace('.', ',')}% · ${sinalDelta}${formatar(Math.abs(delta))}`;
}

/** Legenda do card "Sobrou": quanto do que entrou sobrou no mês, ex.: "12,3% do que entrou". */
export function captionSobrou(resultado: number, totalEntradas: number): string {
  if (totalEntradas <= 0) return '—';
  return `${((resultado / totalEntradas) * 100).toFixed(1).replace('.', ',')}% do que entrou`;
}
