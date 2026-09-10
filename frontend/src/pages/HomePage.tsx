import { useEffect, useMemo, useState } from "react";
import { Plus, CircleAlert, ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { buscarEvolucaoSaldo, buscarHome, type PeriodoMes } from "@/api/transacoes";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountFilter } from "@/contexts/AccountFilterContext";
import { ComparativoMesAnteriorCard } from "@/components/home/ComparativoMesAnteriorCard";
import { OrcamentoResumoCard } from "@/components/home/OrcamentoResumoCard";
import { EvolucaoSaldoChart } from "@/components/home/EvolucaoSaldoChart";
import { PendenciasList } from "@/components/home/PendenciasList";
import { CategoriaDrilldownChart } from "@/components/home/CategoriaDrilldownChart";
import { FluxoCaixaChart } from "@/components/home/FluxoCaixaChart";
import { TransacoesRecentesCard } from "@/components/home/TransacoesRecentesCard";
import { MesNavigator } from "@/components/shared/MesNavigator";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/Card";
import { FinancialCard } from "@/components/ui/FinancialCard";
import { StatCard } from "@/components/ui/StatCard";
import { InsightCard } from "@/components/ui/InsightCard";
import { MetasResumo } from "@/components/home/MetasResumo";
import { useFormatarValor } from "@/hooks/use-formatar-valor";
import { useInsightMensal } from "@/hooks/use-insight-mensal";
import type { InsightCta } from "@/lib/insights";

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

function subtrairMeses(periodo: PeriodoMes, quantidade: number): PeriodoMes {
  const data = new Date(Date.UTC(periodo.ano, periodo.mes - 1 - quantidade, 1));
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1 };
}

/** Descrição da variação para leitores de tela (não depende de ícone). */
function variacaoDescritiva(
  atual: number,
  anterior: number,
  formatar: (valor: number) => string,
): string {
  if (anterior === 0) return "sem dado do mês anterior";
  const delta = atual - anterior;
  if (delta === 0) return "estável ante o mês anterior";
  const direcao = delta > 0 ? "alta" : "queda";
  return `${direcao} de ${formatar(Math.abs(delta))} ante o mês anterior`;
}

/** Legenda dos cards do topo: variação percentual e delta em reais (ex.: "+8,2% · +R$ 950"). */
function variacaoTopoCaption(
  atual: number,
  anterior: number,
  formatar: (valor: number) => string,
): string {
  if (anterior === 0) return "sem base de comparação";
  const pct = Number((((atual - anterior) / Math.abs(anterior)) * 100).toFixed(1));
  const delta = atual - anterior;
  const sinalPct = pct > 0 ? "+" : pct < 0 ? "−" : "";
  const sinalDelta = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sinalPct}${Math.abs(pct).toFixed(1).replace(".", ",")}% · ${sinalDelta}${formatar(Math.abs(delta))}`;
}

export function HomePage() {
  const formatarValor = useFormatarValor();
  const { session } = useAuth();
  const nome = (session?.user.user_metadata as { nome?: string } | undefined)?.nome;
  const saudacao = nome ? nome.split(" ")[0] : (session?.user.email ?? "");

  const [searchParams, setSearchParams] = useSearchParams();
  const padrao = hoje();
  const ano = Number(searchParams.get("ano")) || padrao.ano;
  const mes = Number(searchParams.get("mes")) || padrao.mes;

  const { contasSelecionadasIds } = useAccountFilter();
  const contaIds = contasSelecionadasIds.length > 0 ? contasSelecionadasIds : undefined;

  const navigate = useNavigate();

  function aplicarCta(cta: InsightCta) {
    if (cta.scrollTo) {
      document
        .getElementById(cta.scrollTo)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (cta.to) navigate(cta.to);
  }

  function mudarMes(novoAno: number, novoMes: number) {
    setSearchParams({ ano: String(novoAno), mes: String(novoMes) });
  }

  // Payload único da Home: resumo do mês + 3 meses de histórico, contas,
  // evolução de saldo (6m), fluxo de caixa (6m), orçamento e metas — tudo numa
  // requisição. Ver GET /api/transacoes/home.
  const { data: home, isLoading } = useQuery({
    queryKey: ["home", ano, mes, contaIds],
    queryFn: () => buscarHome(ano, mes, contaIds),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });

  const anterior = subtrairMeses({ ano, mes }, 1);
  const data = home?.meses[0];
  const resumoAnterior = home?.meses[1];
  const contas = home?.contas;
  const historicoInsight = useMemo(() => home?.meses.slice(1) ?? [], [home]);

  const patrimonio = (contas ?? [])
    .filter((c) => contasSelecionadasIds.length === 0 || contasSelecionadasIds.includes(c.id))
    .reduce((soma, c) => soma + c.saldoAtual, 0);

  const insight = useInsightMensal({
    ano,
    mes,
    contaIds,
    resumoAtual: data,
    resumoMesAnterior: resumoAnterior,
    historico: historicoInsight,
    orcamento: home?.orcamentoGrade ?? undefined,
    contas,
  });

  const [evolucaoFim, setEvolucaoFim] = useState<PeriodoMes>({ ano, mes });
  const [evolucaoInicio, setEvolucaoInicio] = useState<PeriodoMes>(() =>
    subtrairMeses({ ano, mes }, 5),
  );

  useEffect(() => {
    setEvolucaoFim({ ano, mes });
    setEvolucaoInicio(subtrairMeses({ ano, mes }, 5));
  }, [ano, mes]);

  const evolucaoInicioPadrao = subtrairMeses({ ano, mes }, 5);
  const rangeEvolucaoEhPadrao =
    evolucaoInicio.ano === evolucaoInicioPadrao.ano &&
    evolucaoInicio.mes === evolucaoInicioPadrao.mes &&
    evolucaoFim.ano === ano &&
    evolucaoFim.mes === mes;

  // Só busca separadamente quando o usuário muda o intervalo do gráfico; a visão
  // padrão (últimos 6 meses) já vem no payload da Home.
  const { data: evolucaoCustomizada } = useQuery({
    queryKey: [
      "transacoes",
      "evolucao-saldo",
      evolucaoInicio.ano,
      evolucaoInicio.mes,
      evolucaoFim.ano,
      evolucaoFim.mes,
      contaIds,
    ],
    queryFn: () => buscarEvolucaoSaldo(evolucaoInicio, evolucaoFim, contaIds),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    enabled: !rangeEvolucaoEhPadrao,
  });

  const evolucaoSaldo = rangeEvolucaoEhPadrao ? home?.evolucaoSaldo : evolucaoCustomizada;

  const despesasSemCategoria = data?.despesasPorCategoria.find((d) => d.categoriaId === null);
  const resultado = data ? data.totalEntradas - data.totalSaidas : 0;
  const temDados = !!data && (data.totalEntradas > 0 || data.totalSaidas > 0 || data.recentes.length > 0);

  return (
    <div className="space-y-6 pt-4 pb-2 sm:pt-6 lg:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Oi, {saudacao} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {MESES[mes - 1]} de {ano}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
          <Link
            to={`/transacoes?ano=${ano}&mes=${mes}&novo=1`}
            className="inline-flex h-10 items-center gap-2 rounded-[11px] bg-primary px-4 text-sm font-bold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Novo lançamento
          </Link>
        </div>
      </div>

      {data && !temDados && (
        <EmptyState mood="welcome" title="Vamos começar?">
          Adicione sua primeira transação deste mês e comece a entender seu dinheiro.
        </EmptyState>
      )}

      {temDados && data && (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_372px]">
          <div className="flex min-w-0 flex-col gap-6">
            {(() => {
              const mesNome = MESES[mes - 1].toLowerCase();
              const captionSobrou =
                data.totalEntradas > 0
                  ? `${((resultado / data.totalEntradas) * 100).toFixed(1).replace(".", ",")}% do que entrou`
                  : "—";
              return (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-[1.35fr_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="sm:col-span-3 lg:col-span-1">
                    <FinancialCard
                      label="Seu saldo nas contas"
                      amount={patrimonio}
                      action={{
                        label: "Ver extrato",
                        onClick: () => navigate(`/transacoes?ano=${ano}&mes=${mes}`),
                      }}
                      footer={{
                        label: `Saldo anterior (${MESES[anterior.mes - 1].toLowerCase()} ${anterior.ano}) ·`,
                        value: data.saldoAnterior,
                      }}
                    />
                  </div>
                  <StatCard
                    label={`Entrou em ${mesNome}`}
                    amount={data.totalEntradas}
                    tone="in"
                    icon={<ArrowDownLeft className="size-4" />}
                    href={`/transacoes?ano=${ano}&mes=${mes}`}
                    ariaLabel={`Entrou em ${mesNome}, ${formatarValor(data.totalEntradas)}${resumoAnterior ? `, ${variacaoDescritiva(data.totalEntradas, resumoAnterior.totalEntradas, formatarValor)}` : ""}`}
                    caption={
                      resumoAnterior
                        ? variacaoTopoCaption(data.totalEntradas, resumoAnterior.totalEntradas, formatarValor)
                        : "…"
                    }
                  />
                  <StatCard
                    label={`Saiu em ${mesNome}`}
                    amount={data.totalSaidas}
                    tone="out"
                    icon={<ArrowUpRight className="size-4" />}
                    href={`/transacoes?ano=${ano}&mes=${mes}`}
                    ariaLabel={`Saiu em ${mesNome}, ${formatarValor(data.totalSaidas)}${resumoAnterior ? `, ${variacaoDescritiva(data.totalSaidas, resumoAnterior.totalSaidas, formatarValor)}` : ""}`}
                    caption={
                      resumoAnterior
                        ? variacaoTopoCaption(data.totalSaidas, resumoAnterior.totalSaidas, formatarValor)
                        : "…"
                    }
                  />
                  <StatCard
                    label="Sobrou"
                    amount={resultado}
                    tone="saved"
                    icon={<TrendingUp className="size-4" />}
                    ariaLabel={`Sobrou em ${mesNome}, ${formatarValor(resultado)}, ${captionSobrou}`}
                    caption={captionSobrou}
                  />
                </div>
              );
            })()}

            <FluxoCaixaChart
              ano={ano}
              mes={mes}
              contaIds={contaIds}
              serieInicial={home?.fluxoCaixa.serie}
            />

            <TransacoesRecentesCard ano={ano} mes={mes} recentes={data.recentes} />
          </div>

          <div className="flex flex-col gap-6">
            {insight && (
              <InsightCard
                mascotState={insight.mascotState}
                cta={
                  insight.cta
                    ? { label: insight.cta.label, onClick: () => aplicarCta(insight.cta!) }
                    : undefined
                }
              >
                {insight.texto}
              </InsightCard>
            )}

            <Card className="p-5" id="grafico-categorias">
              <CategoriaDrilldownChart
                dados={data.despesasPorCategoria}
                tipo="DESPESA"
                ano={ano}
                mes={mes}
                contaIds={contaIds}
              />
            </Card>

            <Card className="p-5">
              <CategoriaDrilldownChart
                dados={data.receitasPorCategoria}
                tipo="RECEITA"
                ano={ano}
                mes={mes}
                contaIds={contaIds}
              />
            </Card>

            <MetasResumo metas={home?.metas} />
          </div>
        </div>
      )}

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-6 border-t border-border pt-6">
          {despesasSemCategoria && despesasSemCategoria.total > 0 && (
            <Link
              to={`/transacoes?ano=${ano}&mes=${mes}`}
              className="card-surface flex items-center gap-2 p-3 text-sm text-foreground/70 hover:underline"
            >
              <CircleAlert className="size-4 shrink-0 text-muted-foreground" />
              {formatarValor(despesasSemCategoria.total)} em despesas sem categoria este mês
            </Link>
          )}

          <ComparativoMesAnteriorCard
            ano={ano}
            mes={mes}
            totalEntradas={data.totalEntradas}
            totalSaidas={data.totalSaidas}
            resumoAnterior={resumoAnterior}
          />

          <OrcamentoResumoCard ano={ano} mes={mes} grade={home?.orcamentoGrade} />

          {evolucaoSaldo && (
            <EvolucaoSaldoChart
              dados={evolucaoSaldo}
              inicio={evolucaoInicio}
              fim={evolucaoFim}
              onChangeInicio={(novoAno, novoMes) => setEvolucaoInicio({ ano: novoAno, mes: novoMes })}
              onChangeFim={(novoAno, novoMes) => setEvolucaoFim({ ano: novoAno, mes: novoMes })}
            />
          )}

          {(data.anterioresNaoConsolidadas.length > 0 ||
            data.proximasNaoConsolidadas.length > 0) && (
            <div className="grid gap-6 sm:grid-cols-2">
              <PendenciasList
                titulo="Anteriores não consolidadas"
                itens={data.anterioresNaoConsolidadas}
              />
              <PendenciasList
                titulo="Próximas não consolidadas"
                itens={data.proximasNaoConsolidadas}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
