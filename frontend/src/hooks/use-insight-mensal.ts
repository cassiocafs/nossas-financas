import { useMemo } from "react";

import type { ResumoMensal } from "@/api/transacoes";
import type { GradeOrcamento } from "@/api/orcamento";
import type { Conta } from "@/api/contas";
import { useFormatarValor } from "@/hooks/use-formatar-valor";
import { escolherInsight, type EntradaInsights, type Insight } from "@/lib/insights";

interface DadosInsightMensal {
  ano: number;
  mes: number;
  contaIds?: string[];
  /** resumo do mês selecionado */
  resumoAtual?: ResumoMensal;
  /** resumo do mês imediatamente anterior */
  resumoMesAnterior?: ResumoMensal;
  /** meses fechados anteriores, do mais recente ao mais antigo (até MESES_HISTORICO) */
  historico: ResumoMensal[];
  orcamento?: GradeOrcamento | null;
  contas?: Conta[];
}

/**
 * "Dica do Poupeu": deriva no cliente um único insight do mês selecionado a partir
 * dos dados que a Home já carregou no payload único (`/api/transacoes/home`).
 * Retorna `null` quando nada dispara ou o mês não é o corrente (P-I8) — nesse caso
 * o `InsightCard` não deve ser renderizado.
 */
export function useInsightMensal(dados: DadosInsightMensal): Insight | null {
  const fmt = useFormatarValor();

  const { ano, mes, contaIds, resumoAtual, resumoMesAnterior, historico, orcamento, contas } =
    dados;

  const agora = new Date();
  const mesCorrente = agora.getFullYear() === ano && agora.getMonth() + 1 === mes;
  const diaHoje = agora.getDate();

  return useMemo(() => {
    if (!mesCorrente || !resumoAtual) return null;

    const entrada: EntradaInsights = {
      periodo: { ano, mes },
      mesCorrente,
      diaHoje,
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
  }, [
    ano,
    mes,
    mesCorrente,
    diaHoje,
    resumoAtual,
    resumoMesAnterior,
    historico,
    orcamento,
    contas,
    contaIds,
    fmt,
  ]);
}
