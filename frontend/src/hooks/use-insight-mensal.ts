import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";

import { buscarResumoMensal, type PeriodoMes } from "@/api/transacoes";
import { buscarGradeOrcamentoPorAno } from "@/api/orcamento";
import { listarContas } from "@/api/contas";
import { useFormatarValor } from "@/hooks/use-formatar-valor";
import {
  escolherInsight,
  MESES_HISTORICO,
  type EntradaInsights,
  type Insight,
} from "@/lib/insights";

const STALE = 5 * 60_000;

function subtrairMeses(periodo: PeriodoMes, quantidade: number): PeriodoMes {
  const data = new Date(Date.UTC(periodo.ano, periodo.mes - 1 - quantidade, 1));
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1 };
}

/**
 * "Dica do Poupeu": deriva no cliente um único insight do mês selecionado a partir
 * do resumo mensal + orçamento + contas que a Home já carrega (mesmas queryKeys →
 * dedup do react-query). Retorna `null` quando nada dispara ou o mês não é o corrente
 * (P-I8) — nesse caso o `InsightCard` não deve ser renderizado.
 */
export function useInsightMensal(
  ano: number,
  mes: number,
  contaIds?: string[],
): Insight | null {
  const fmt = useFormatarValor();

  const agora = new Date();
  const mesCorrente = agora.getFullYear() === ano && agora.getMonth() + 1 === mes;

  // Offset 0 = mês atual; 1..MESES_HISTORICO = meses fechados anteriores.
  // Offset 1 serve tanto como "mês anterior" quanto como historico[0].
  const periodos = Array.from({ length: MESES_HISTORICO + 1 }, (_, offset) =>
    subtrairMeses({ ano, mes }, offset),
  );

  const resumos = useQueries({
    queries: periodos.map((p) => ({
      queryKey: ["transacoes", "resumo", p.ano, p.mes, contaIds] as const,
      queryFn: () => buscarResumoMensal(p.ano, p.mes, contaIds),
      staleTime: STALE,
    })),
  });

  const { data: orcamento } = useQuery({
    queryKey: ["orcamento", "grade", ano, mes],
    queryFn: () => buscarGradeOrcamentoPorAno(ano, mes),
  });

  const { data: contas } = useQuery({
    queryKey: ["contas", "ativas"],
    queryFn: () => listarContas(false),
  });

  const resumoAtual = resumos[0]?.data;
  const resumoMesAnterior = resumos[1]?.data;
  const historico = resumos
    .slice(1)
    .map((q) => q.data)
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return useMemo(() => {
    if (!mesCorrente || !resumoAtual) return null;

    const entrada: EntradaInsights = {
      periodo: { ano, mes },
      mesCorrente,
      diaHoje: agora.getDate(),
      diasNoMes: new Date(ano, mes, 0).getDate(),
      resumoAtual,
      resumoMesAnterior,
      historico,
      orcamento,
      contas,
      contaIdsFiltro: contaIds,
      fmt,
    };
    return escolherInsight(entrada);
    // `agora` recriado a cada render — usar as partes estáveis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ano,
    mes,
    mesCorrente,
    resumoAtual,
    resumoMesAnterior,
    historico,
    orcamento,
    contas,
    contaIds,
    fmt,
  ]);
}
