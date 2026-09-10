import type { ItemCategoriaResumo, ResumoMensal } from "@/api/transacoes";
import type { GradeOrcamento } from "@/api/orcamento";
import type { Conta } from "@/api/contas";
import type { MascotState } from "@/components/ui/Mascot";

/**
 * Lógica pura da "Dica do Poupeu" (insights mensais), derivada no cliente dos dados
 * que a Home já carrega. Regra de ouro herdada do design system: categorias são livres,
 * nunca se hard-coda nome de categoria numa condição — tudo opera sobre a lista genérica
 * `despesasPorCategoria`. "Despesa" nunca é veredito; o tom é observação.
 */

export const MESES_HISTORICO = 3;

export const LIMIARES = {
  /** gasto mínimo (R$) numa categoria para ela virar observação */
  baseMinimaCategoria: 50,
  /** categoria "acima da média": total >= fator * média histórica */
  categoriaVsMedia: 1.4,
  /** gasto mínimo (R$) do mês para o insight 3.1 disparar */
  baseCategoriaVsMedia: 80,
  /** variação relativa mínima vs. mês anterior */
  categoriaVsMesAnterior: 0.15,
  /** folga extra sobre a fração linear do mês para "ritmo acelerado" */
  orcamentoRitmoFolga: 0.15,
  /** teto de realizado/previsto para "orçamento no azul" */
  orcamentoAzul: 0.85,
  /** dias restantes no mês para o insight de folga de orçamento */
  diasParaFimDoMes: 7,
  /** entradas do mês <= fator * média recente */
  entradasAbaixo: 0.7,
  /** sobra do mês >= fator * média recente */
  sobrouAcima: 1.3,
  /** parcela de despesa sem categoria a partir da qual vira alerta */
  semCategoriaAlta: 0.25,
  /** valor mínimo (R$) sem categoria para o alerta */
  semCategoriaValorMinimo: 100,
  /** mês mais caro: >= fator * segundo maior gasto da janela */
  mesMaisCaro: 1.15,
  /** volume mínimo (R$) de saídas para o elogio "tudo categorizado" */
  volumeParaElogioCategorizado: 200,
  /** saídas mínimas (R$) para o insight "mês no vermelho" */
  saidasMinimasMesVermelho: 100,
  /** média mínima (R$) de entradas para comparar receita do mês */
  mediaMinimaEntradas: 100,
  /** dia do mês antes do qual não se cobra receita abaixo da média */
  diaCorteReceita: 25,
} as const;

const MESES_NOMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export type InsightFamilia =
  | "categoria"
  | "orcamento"
  | "caixa"
  | "entradas"
  | "resultado"
  | "historico";

export type InsightId =
  | "categoria_subiu_vs_media"
  | "categoria_subiu_vs_mes_anterior"
  | "categoria_caiu_vs_mes_anterior"
  | "orcamento_ritmo_acelerado"
  | "orcamento_no_azul"
  | "categorias_estouradas"
  | "conta_no_vermelho"
  | "mes_no_vermelho"
  | "entradas_abaixo_da_media"
  | "sobrou_mais_que_o_normal"
  | "tudo_categorizado"
  | "muito_sem_categoria"
  | "mes_mais_caro_do_periodo";

/** Rota/ação para onde um insight leva. */
export interface InsightCta {
  label: string;
  /** rota já montada, ex. "/transacoes?ano=2026&mes=9&categoriaIds=abc" */
  to?: string;
  /** id de âncora na Home para rolar (ex. "grafico-categorias") */
  scrollTo?: string;
  /** categoria alvo (informativo; já embutida em `to`) */
  categoriaId?: string;
}

export interface Insight {
  id: InsightId;
  familia: InsightFamilia;
  texto: string;
  cta?: InsightCta;
  mascotState: MascotState;
  prioridade: 1 | 2 | 3 | 4 | 5;
  /** usado só para desempate dentro da mesma prioridade */
  score: number;
}

/** Tudo que os avaliadores precisam. Quase todos os campos podem faltar (loading). */
export interface EntradaInsights {
  periodo: { ano: number; mes: number };
  /** true quando o período selecionado é o mês corrente */
  mesCorrente: boolean;
  /** dia do mês de hoje e nº de dias no mês — só relevante se `mesCorrente` */
  diaHoje: number;
  diasNoMes: number;
  resumoAtual?: ResumoMensal;
  resumoMesAnterior?: ResumoMensal;
  /** meses fechados anteriores, mais recente primeiro; até MESES_HISTORICO itens */
  historico: ResumoMensal[];
  orcamento?: GradeOrcamento | null;
  contas?: Conta[];
  /** filtro de contas ativo na Home, para escopo do insight de conta */
  contaIdsFiltro?: string[];
  /** formatação monetária que respeita "ocultar valores" (useFormatarValor) */
  fmt: (valor: number) => string;
}

export type AvaliadorInsight = (e: EntradaInsights) => Insight | null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pct(fracao: number): number {
  return Math.round(fracao * 100);
}

function minusculo(nome: string): string {
  return nome.toLocaleLowerCase("pt-BR");
}

function nomeMes(mes: number): string {
  return MESES_NOMES[mes - 1] ?? "";
}

function despesasComCategoria(resumo: ResumoMensal): ItemCategoriaResumo[] {
  return resumo.despesasPorCategoria.filter((i) => i.categoriaId && i.total > 0);
}

function itemSemCategoria(resumo: ResumoMensal): ItemCategoriaResumo | undefined {
  return resumo.despesasPorCategoria.find((i) => i.categoriaId === null);
}

/** total por categoria em cada mês do histórico onde ela aparece (>0). */
function totaisPorCategoria(historico: ResumoMensal[]): Map<string, number[]> {
  const mapa = new Map<string, number[]>();
  for (const resumo of historico) {
    for (const item of resumo.despesasPorCategoria) {
      if (!item.categoriaId || item.total <= 0) continue;
      const arr = mapa.get(item.categoriaId) ?? [];
      arr.push(item.total);
      mapa.set(item.categoriaId, arr);
    }
  }
  return mapa;
}

function media(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((s, v) => s + v, 0) / valores.length;
}

/** Todas as categorias da grade de orçamento (grupos + subgrupos), achatadas. */
function categoriasDaGrade(orcamento: GradeOrcamento) {
  return orcamento.grupos.flatMap((g) => [
    ...g.categorias,
    ...g.subgrupos.flatMap((s) => s.categorias),
  ]);
}

// ---------------------------------------------------------------------------
// Avaliadores (na ordem do catálogo da spec, seção 3)
// ---------------------------------------------------------------------------

/** 3.1 — categoria de despesa acima da média histórica. */
const categoriaSubiuVsMedia: AvaliadorInsight = (e) => {
  if (!e.resumoAtual || e.historico.length < 2) return null;
  const historicoPorCat = totaisPorCategoria(e.historico);

  let melhor: { item: ItemCategoriaResumo; mediaCat: number; razao: number } | null = null;
  for (const item of despesasComCategoria(e.resumoAtual)) {
    if (item.total < LIMIARES.baseCategoriaVsMedia) continue;
    const totais = historicoPorCat.get(item.categoriaId!) ?? [];
    if (totais.length < 2) continue;
    const mediaCat = media(totais);
    if (mediaCat < LIMIARES.baseMinimaCategoria) continue;
    if (item.total < LIMIARES.categoriaVsMedia * mediaCat) continue;
    const razao = item.total / mediaCat;
    if (!melhor || razao > melhor.razao) melhor = { item, mediaCat, razao };
  }
  if (!melhor) return null;

  const cat = minusculo(melhor.item.categoriaNome);
  const { ano, mes } = e.periodo;
  return {
    id: "categoria_subiu_vs_media",
    familia: "categoria",
    texto: `Seus gastos com ${cat} este mês (${e.fmt(melhor.item.total)}) estão ${pct(melhor.razao - 1)}% acima da sua média dos últimos meses.`,
    cta: {
      label: `Ver ${cat} nas transações`,
      to: `/transacoes?ano=${ano}&mes=${mes}&categoriaIds=${melhor.item.categoriaId}`,
      categoriaId: melhor.item.categoriaId!,
    },
    mascotState: "thinking",
    prioridade: 2,
    score: Math.min(1, melhor.razao - 1),
  };
};

/** 3.2 — variação forte de categoria vs. mês anterior (alta ou queda). */
const categoriaVsMesAnterior: AvaliadorInsight = (e) => {
  if (!e.resumoAtual || !e.resumoMesAnterior) return null;

  const anteriorPorId = new Map(
    e.resumoMesAnterior.despesasPorCategoria
      .filter((i) => i.categoriaId)
      .map((i) => [i.categoriaId, i.total]),
  );

  let melhor: { item: ItemCategoriaResumo; delta: number } | null = null;
  for (const item of e.resumoAtual.despesasPorCategoria) {
    if (!item.categoriaId) continue;
    const antes = anteriorPorId.get(item.categoriaId);
    if (antes == null || antes < LIMIARES.baseMinimaCategoria) continue;
    if (item.total < LIMIARES.baseMinimaCategoria) continue;
    const delta = (item.total - antes) / antes;
    if (Math.abs(delta) < LIMIARES.categoriaVsMesAnterior) continue;
    if (!melhor || Math.abs(delta) > Math.abs(melhor.delta)) melhor = { item, delta };
  }
  if (!melhor) return null;

  const cat = minusculo(melhor.item.categoriaNome);
  const { ano, mes } = e.periodo;
  const p = pct(Math.abs(melhor.delta));

  if (melhor.delta < 0) {
    return {
      id: "categoria_caiu_vs_mes_anterior",
      familia: "categoria",
      texto: `Você gastou ${p}% menos com ${cat} este mês do que no mês passado. 👏`,
      mascotState: "happy",
      prioridade: 5,
      score: Math.min(1, Math.abs(melhor.delta)),
    };
  }
  return {
    id: "categoria_subiu_vs_mes_anterior",
    familia: "categoria",
    texto: `Seus gastos com ${cat} subiram ${p}% em relação ao mês passado.`,
    cta: {
      label: `Ver ${cat} nas transações`,
      to: `/transacoes?ano=${ano}&mes=${mes}&categoriaIds=${melhor.item.categoriaId}`,
      categoriaId: melhor.item.categoriaId!,
    },
    mascotState: "thinking",
    prioridade: 3,
    score: Math.min(1, melhor.delta),
  };
};

/** 3.3 — gastando mais rápido que o previsto no orçamento. */
const orcamentoRitmoAcelerado: AvaliadorInsight = (e) => {
  if (!e.mesCorrente || !e.orcamento || e.orcamento.totalPrevisto <= 0) return null;
  const fracaoMes = e.diaHoje / e.diasNoMes;
  const fracaoGasto = e.orcamento.totalRealizado / e.orcamento.totalPrevisto;
  if (fracaoGasto < fracaoMes + LIMIARES.orcamentoRitmoFolga) return null;

  const diasRestantes = Math.max(0, e.diasNoMes - e.diaHoje);
  return {
    id: "orcamento_ritmo_acelerado",
    familia: "orcamento",
    texto: `Você já usou ${pct(fracaoGasto)}% do orçamento do mês e ainda faltam ${diasRestantes} dias. Vale segurar o ritmo.`,
    cta: { label: "Ver orçamento", to: "/orcamento" },
    mascotState: "thinking",
    prioridade: 1,
    score: Math.min(1, fracaoGasto - fracaoMes),
  };
};

/** 3.4 — folga no orçamento perto do fim do mês. */
const orcamentoNoAzul: AvaliadorInsight = (e) => {
  if (!e.mesCorrente || !e.orcamento || e.orcamento.totalPrevisto <= 0) return null;
  const diasRestantes = Math.max(0, e.diasNoMes - e.diaHoje);
  if (diasRestantes > LIMIARES.diasParaFimDoMes) return null;
  const { totalPrevisto, totalRealizado } = e.orcamento;
  if (totalRealizado > LIMIARES.orcamentoAzul * totalPrevisto) return null;

  return {
    id: "orcamento_no_azul",
    familia: "orcamento",
    texto: `Faltando poucos dias para o mês fechar, você gastou ${e.fmt(totalPrevisto - totalRealizado)} a menos que o previsto. Bom controle!`,
    cta: { label: "Ver orçamento", to: "/orcamento" },
    mascotState: "happy",
    prioridade: 5,
    score: Math.min(1, 1 - totalRealizado / totalPrevisto),
  };
};

/** 3.5 — categorias que passaram do previsto. */
const categoriasEstouradas: AvaliadorInsight = (e) => {
  if (!e.orcamento) return null;
  const estouradas = categoriasDaGrade(e.orcamento).filter((c) => c.estourado);
  if (estouradas.length === 0) return null;

  const maior = estouradas.reduce((a, b) =>
    b.realizado - b.previsto > a.realizado - a.previsto ? b : a,
  );
  const cat = minusculo(maior.categoriaNome);
  const texto =
    estouradas.length === 1
      ? `A categoria ${cat} passou do previsto: ${e.fmt(maior.realizado)} de ${e.fmt(maior.previsto)}.`
      : `${estouradas.length} categorias passaram do previsto este mês. A maior diferença é em ${cat}.`;

  return {
    id: "categorias_estouradas",
    familia: "orcamento",
    texto,
    cta: { label: "Ver orçamento", to: "/orcamento" },
    mascotState: "thinking",
    prioridade: 2,
    score: Math.min(1, (maior.realizado - maior.previsto) / Math.max(maior.previsto, 1)),
  };
};

/** 3.6 — conta com saldo negativo. */
const contaNoVermelho: AvaliadorInsight = (e) => {
  if (!e.contas) return null;
  const filtro = e.contaIdsFiltro;
  const negativas = e.contas
    .filter((c) => c.ativa && c.saldoAtual < 0)
    .filter((c) => !filtro || filtro.length === 0 || filtro.includes(c.id))
    .sort((a, b) => a.saldoAtual - b.saldoAtual);
  if (negativas.length === 0) return null;

  const critica = negativas[0];
  const texto =
    negativas.length === 1
      ? `A conta ${critica.nome} está com saldo negativo (${e.fmt(critica.saldoAtual)}). Vale um aporte ou uma transferência.`
      : `Você tem ${negativas.length} contas com saldo negativo. A mais crítica é ${critica.nome} (${e.fmt(critica.saldoAtual)}).`;

  return {
    id: "conta_no_vermelho",
    familia: "caixa",
    texto,
    cta: { label: "Ver contas", to: "/configuracoes/contas" },
    mascotState: "surprised",
    prioridade: 1,
    score: Math.min(1, Math.abs(critica.saldoAtual) / 1000),
  };
};

/** 3.7 — saíram mais recursos do que entraram no mês. */
const mesNoVermelho: AvaliadorInsight = (e) => {
  if (!e.resumoAtual) return null;
  const { totalEntradas, totalSaidas } = e.resumoAtual;
  if (totalEntradas <= 0) return null;
  if (totalSaidas <= totalEntradas) return null;
  if (totalSaidas < LIMIARES.saidasMinimasMesVermelho) return null;

  return {
    id: "mes_no_vermelho",
    familia: "caixa",
    texto: `Este mês saíram ${e.fmt(totalSaidas - totalEntradas)} a mais do que entraram. Dá pra cobrir com o que sobrou antes, mas fica de olho.`,
    cta: { label: "Ver para onde foi", scrollTo: "grafico-categorias" },
    mascotState: "thinking",
    prioridade: 2,
    score: Math.min(1, (totalSaidas - totalEntradas) / totalEntradas),
  };
};

/** 3.8 — receita do mês abaixo da média recente. */
const entradasAbaixoDaMedia: AvaliadorInsight = (e) => {
  if (!e.resumoAtual) return null;
  if (e.mesCorrente && e.diaHoje < LIMIARES.diaCorteReceita) return null;

  const entradasHist = e.historico
    .map((r) => r.totalEntradas)
    .filter((v) => v > 0);
  if (entradasHist.length < 2) return null;

  const mediaEntradas = media(entradasHist);
  if (mediaEntradas < LIMIARES.mediaMinimaEntradas) return null;
  if (e.resumoAtual.totalEntradas > LIMIARES.entradasAbaixo * mediaEntradas) return null;

  const { ano, mes } = e.periodo;
  return {
    id: "entradas_abaixo_da_media",
    familia: "entradas",
    texto: `As entradas deste mês (${e.fmt(e.resumoAtual.totalEntradas)}) estão abaixo da sua média recente (${e.fmt(mediaEntradas)}). Faltou lançar alguma receita?`,
    cta: { label: "Adicionar receita", to: `/transacoes?ano=${ano}&mes=${mes}&novo=1` },
    mascotState: "thinking",
    prioridade: 3,
    score: Math.min(1, 1 - e.resumoAtual.totalEntradas / mediaEntradas),
  };
};

/** 3.9 — mês fechou com sobra acima da média (elogio). */
const sobrouMaisQueONormal: AvaliadorInsight = (e) => {
  if (!e.resumoAtual || e.historico.length < 2) return null;
  const resultado = e.resumoAtual.totalEntradas - e.resumoAtual.totalSaidas;
  if (resultado <= 0) return null;

  const resultadosHist = e.historico.map((r) => r.totalEntradas - r.totalSaidas);
  const mediaResultado = media(resultadosHist);
  if (mediaResultado <= 0) return null;
  if (resultado < LIMIARES.sobrouAcima * mediaResultado) return null;

  return {
    id: "sobrou_mais_que_o_normal",
    familia: "resultado",
    texto: `Você fechou o mês com ${e.fmt(resultado)} de sobra — mais do que costuma sobrar. Que tal mandar parte para uma meta?`,
    cta: { label: "Ver metas", to: "/metas" },
    mascotState: "celebrating",
    prioridade: 4,
    score: Math.min(1, resultado / mediaResultado - 1),
  };
};

/** 3.10 — nada sem categoria (elogio). */
const tudoCategorizado: AvaliadorInsight = (e) => {
  if (!e.resumoAtual) return null;
  if (e.resumoAtual.totalSaidas < LIMIARES.volumeParaElogioCategorizado) return null;
  const semCat = itemSemCategoria(e.resumoAtual);
  if (semCat && semCat.total > 0) return null;

  return {
    id: "tudo_categorizado",
    familia: "categoria",
    texto: `Todas as suas despesas deste mês estão categorizadas. Isso deixa os relatórios muito mais úteis. 🎯`,
    mascotState: "happy",
    prioridade: 5,
    score: 0.5,
  };
};

/** 3.11 — parcela alta de despesa sem categoria. */
const muitoSemCategoria: AvaliadorInsight = (e) => {
  if (!e.resumoAtual || e.resumoAtual.totalSaidas <= 0) return null;
  const semCat = itemSemCategoria(e.resumoAtual);
  if (!semCat || semCat.total <= 0) return null;
  const fracao = semCat.total / e.resumoAtual.totalSaidas;
  if (fracao < LIMIARES.semCategoriaAlta) return null;
  if (semCat.total < LIMIARES.semCategoriaValorMinimo) return null;

  const { ano, mes } = e.periodo;
  return {
    id: "muito_sem_categoria",
    familia: "categoria",
    texto: `${e.fmt(semCat.total)} em despesas (${pct(fracao)}% do mês) estão sem categoria. Classificar ajuda o Poupeu a te dar dicas melhores.`,
    cta: { label: "Categorizar agora", to: `/transacoes?ano=${ano}&mes=${mes}` },
    mascotState: "thinking",
    prioridade: 3,
    score: Math.min(1, fracao),
  };
};

/** 3.12 — mês com maior gasto da janela conhecida. */
const mesMaisCaroDoPeriodo: AvaliadorInsight = (e) => {
  if (!e.resumoAtual || e.historico.length < 2) return null;
  const saidasAtual = e.resumoAtual.totalSaidas;
  if (saidasAtual <= 0) return null;

  const saidasHist = e.historico.map((r) => r.totalSaidas);
  const maiorHist = Math.max(...saidasHist);
  if (saidasAtual <= maiorHist) return null;
  if (saidasAtual < LIMIARES.mesMaisCaro * maiorHist) return null;

  const k = e.historico.length + 1;
  return {
    id: "mes_mais_caro_do_periodo",
    familia: "historico",
    texto: `${nomeMes(e.periodo.mes)} foi o mês em que você mais gastou nos últimos ${k} meses: ${e.fmt(saidasAtual)}.`,
    cta: { label: "Comparar meses", to: "/relatorios" },
    mascotState: "surprised",
    prioridade: 4,
    score: Math.min(1, saidasAtual / Math.max(maiorHist, 1) - 1),
  };
};

export const AVALIADORES: AvaliadorInsight[] = [
  categoriaSubiuVsMedia,
  categoriaVsMesAnterior,
  orcamentoRitmoAcelerado,
  orcamentoNoAzul,
  categoriasEstouradas,
  contaNoVermelho,
  mesNoVermelho,
  entradasAbaixoDaMedia,
  sobrouMaisQueONormal,
  tudoCategorizado,
  muitoSemCategoria,
  mesMaisCaroDoPeriodo,
];

// ---------------------------------------------------------------------------
// Seleção / ranking
// ---------------------------------------------------------------------------

interface Candidato {
  insight: Insight;
  ordem: number;
}

/** Chave de ordenação: prioridade asc, score desc, ordem de catálogo asc. */
function chave(c: Candidato): [number, number, number] {
  return [c.insight.prioridade, -c.insight.score, c.ordem];
}

function comparar(a: Candidato, b: Candidato): number {
  const ka = chave(a);
  const kb = chave(b);
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return ka[i] - kb[i];
  }
  return 0;
}

/**
 * Roda todos os avaliadores, aplica anti-redundância (no máximo 1 insight por família)
 * e devolve o de maior prioridade. Determinístico (P-I2): sempre o topo do ranking.
 */
export function escolherInsight(entrada: EntradaInsights): Insight | null {
  if (!entrada.resumoAtual) return null;

  const candidatos: Candidato[] = [];
  AVALIADORES.forEach((avaliar, ordem) => {
    const insight = avaliar(entrada);
    if (insight) candidatos.push({ insight, ordem });
  });
  if (candidatos.length === 0) return null;

  const porFamilia = new Map<InsightFamilia, Candidato>();
  for (const candidato of candidatos) {
    const atual = porFamilia.get(candidato.insight.familia);
    if (!atual || comparar(candidato, atual) < 0) {
      porFamilia.set(candidato.insight.familia, candidato);
    }
  }

  const finais = [...porFamilia.values()].sort(comparar);
  return finais[0].insight;
}
