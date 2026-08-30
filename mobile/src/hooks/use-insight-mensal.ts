import { useQuery } from '@tanstack/react-query';

import { buscarResumoMensal, type ItemCategoriaResumo } from '@/api/transacoes';
import { subtrairMeses } from '@/lib/date';

export interface InsightMensal {
  texto: string;
  categoriaNome: string;
}

/** Só considera categorias com gasto relevante nos dois meses. */
const BASE_MINIMA = 50;
/** Variação mínima para virar observação. */
const VARIACAO_MINIMA = 0.1;

function maiorVariacao(
  atual: ItemCategoriaResumo[],
  anterior: ItemCategoriaResumo[],
): { nome: string; delta: number } | null {
  const porId = new Map(anterior.filter((i) => i.categoriaId).map((i) => [i.categoriaId, i.total]));
  let melhor: { nome: string; delta: number } | null = null;

  for (const item of atual) {
    if (!item.categoriaId) continue;
    const antes = porId.get(item.categoriaId);
    if (antes == null || antes < BASE_MINIMA || item.total < BASE_MINIMA) continue;

    const delta = (item.total - antes) / antes;
    if (Math.abs(delta) < VARIACAO_MINIMA) continue;
    if (!melhor || Math.abs(delta) > Math.abs(melhor.delta)) {
      melhor = { nome: item.categoriaNome, delta };
    }
  }
  return melhor;
}

/**
 * Observação do mês derivada no cliente: compara os gastos por categoria com o mês
 * anterior e devolve a maior variação, no tom do Poupeu (observação, nunca veredito).
 * Retorna `null` quando não há dado suficiente — nesse caso o InsightCard não aparece.
 */
export function useInsightMensal(ano: number, mes: number): InsightMensal | null {
  const anterior = subtrairMeses({ ano, mes }, 1);

  const { data: resumoAtual } = useQuery({
    queryKey: ['transacoes', 'resumo', ano, mes],
    queryFn: () => buscarResumoMensal(ano, mes),
  });
  const { data: resumoAnterior } = useQuery({
    queryKey: ['transacoes', 'resumo', anterior.ano, anterior.mes],
    queryFn: () => buscarResumoMensal(anterior.ano, anterior.mes),
  });

  if (!resumoAtual || !resumoAnterior) return null;

  const variacao = maiorVariacao(resumoAtual.despesasPorCategoria, resumoAnterior.despesasPorCategoria);
  if (!variacao) return null;

  const pct = Math.round(Math.abs(variacao.delta) * 100);
  const nome = variacao.nome.toLowerCase();
  const texto =
    variacao.delta < 0
      ? `Você gastou ${pct}% menos com ${nome} este mês do que no mês passado.`
      : `Seus gastos com ${nome} subiram ${pct}% em relação ao mês passado.`;

  return { texto, categoriaNome: variacao.nome };
}
