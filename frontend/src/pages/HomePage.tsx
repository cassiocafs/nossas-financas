import { useEffect, useState } from "react";
import { Plus, ArrowDownLeft, ArrowUpRight, TrendingUp, CircleAlert, Plane, PiggyBank } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { buscarEvolucaoSaldo, buscarResumoMensal, type PeriodoMes } from "@/api/transacoes";
import { listarContas } from "@/api/contas";
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
import { GoalCard } from "@/components/ui/GoalCard";
import { InsightCard } from "@/components/ui/InsightCard";
import { formatarMoeda } from "@/lib/format";

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

function variacaoTexto(atual: number, anterior: number): string {
  if (anterior === 0) return "sem dado do mês anterior";
  const percentual = ((atual - anterior) / Math.abs(anterior)) * 100;
  const sinalPercentual = percentual >= 0 ? "+" : "";
  const delta = atual - anterior;
  const sinalDelta = delta >= 0 ? "+" : "";
  return `${sinalPercentual}${percentual.toFixed(1).replace(".", ",")}% · ${sinalDelta}${formatarMoeda(delta)}`;
}

export function HomePage() {
  const { session } = useAuth();
  const nome = (session?.user.user_metadata as { nome?: string } | undefined)?.nome;
  const saudacao = nome ? nome.split(" ")[0] : (session?.user.email ?? "");

  const [searchParams, setSearchParams] = useSearchParams();
  const padrao = hoje();
  const ano = Number(searchParams.get("ano")) || padrao.ano;
  const mes = Number(searchParams.get("mes")) || padrao.mes;

  const { contasSelecionadasIds } = useAccountFilter();
  const contaIds = contasSelecionadasIds.length > 0 ? contasSelecionadasIds : undefined;

  function mudarMes(novoAno: number, novoMes: number) {
    setSearchParams({ ano: String(novoAno), mes: String(novoMes) });
  }

  const { data, isLoading } = useQuery({
    queryKey: ["transacoes", "resumo", ano, mes, contaIds],
    queryFn: () => buscarResumoMensal(ano, mes, contaIds),
  });

  const anterior = subtrairMeses({ ano, mes }, 1);
  const { data: resumoAnterior } = useQuery({
    queryKey: ["transacoes", "resumo", anterior.ano, anterior.mes, contaIds],
    queryFn: () => buscarResumoMensal(anterior.ano, anterior.mes, contaIds),
  });

  const { data: contas } = useQuery({
    queryKey: ["contas", "ativas"],
    queryFn: () => listarContas(false),
  });
  const patrimonio = (contas ?? [])
    .filter((c) => contasSelecionadasIds.length === 0 || contasSelecionadasIds.includes(c.id))
    .reduce((soma, c) => soma + c.saldoAtual, 0);

  const [evolucaoFim, setEvolucaoFim] = useState<PeriodoMes>({ ano, mes });
  const [evolucaoInicio, setEvolucaoInicio] = useState<PeriodoMes>(() =>
    subtrairMeses({ ano, mes }, 5),
  );

  useEffect(() => {
    setEvolucaoFim({ ano, mes });
    setEvolucaoInicio(subtrairMeses({ ano, mes }, 5));
  }, [ano, mes]);

  const { data: evolucaoSaldo } = useQuery({
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
  });

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
            <FinancialCard
              label="Seu saldo nas contas"
              amount={patrimonio}
              action={{ label: "Ver extrato", onClick: () => {} }}
              footer={{
                label: `Saldo anterior (${MESES[anterior.mes - 1].toLowerCase()} ${anterior.ano}) ·`,
                value: data.saldoAnterior,
              }}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label={`Entrou em ${MESES[mes - 1].toLowerCase()}`}
                amount={data.totalEntradas}
                tone="in"
                icon={<ArrowDownLeft className="size-4" />}
                caption={
                  resumoAnterior
                    ? variacaoTexto(data.totalEntradas, resumoAnterior.totalEntradas)
                    : "…"
                }
              />
              <StatCard
                label={`Saiu em ${MESES[mes - 1].toLowerCase()}`}
                amount={data.totalSaidas}
                tone="out"
                icon={<ArrowUpRight className="size-4" />}
                caption={
                  resumoAnterior
                    ? variacaoTexto(data.totalSaidas, resumoAnterior.totalSaidas)
                    : "…"
                }
              />
              <StatCard
                label="Sobrou"
                amount={resultado}
                tone="saved"
                icon={<TrendingUp className="size-4" />}
                caption={
                  data.totalEntradas > 0
                    ? `${((resultado / data.totalEntradas) * 100).toFixed(1).replace(".", ",")}% do que entrou`
                    : "—"
                }
              />
            </div>

            <FluxoCaixaChart ano={ano} mes={mes} contaIds={contaIds} />

            <TransacoesRecentesCard ano={ano} mes={mes} recentes={data.recentes} />
          </div>

          <div className="flex flex-col gap-6">
            <InsightCard
              cta={{ label: "Ver gastos com transporte", onClick: () => {} }}
            >
              Acompanhe abaixo para onde foi o dinheiro este mês e ajuste o que fizer sentido.
            </InsightCard>

            <Card className="p-5">
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-foreground">Suas metas</h3>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  + Nova
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <GoalCard
                  name="Viagem para o Chile"
                  icon={<Plane className="size-4" />}
                  current={6250}
                  target={8000}
                  note="Faltam R$ 1.750 para realizar."
                />
                <GoalCard
                  name="Reserva de emergência"
                  icon={<PiggyBank className="size-4" />}
                  current={11700}
                  target={18000}
                  note="Você está mais perto da sua meta."
                />
              </div>
            </div>
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
              {formatarMoeda(despesasSemCategoria.total)} em despesas sem categoria este mês
            </Link>
          )}

          <ComparativoMesAnteriorCard
            ano={ano}
            mes={mes}
            totalEntradas={data.totalEntradas}
            totalSaidas={data.totalSaidas}
          />

          <OrcamentoResumoCard ano={ano} mes={mes} />

          {evolucaoSaldo && (
            <EvolucaoSaldoChart
              dados={evolucaoSaldo}
              inicio={evolucaoInicio}
              fim={evolucaoFim}
              onChangeInicio={(novoAno, novoMes) => setEvolucaoInicio({ ano: novoAno, mes: novoMes })}
              onChangeFim={(novoAno, novoMes) => setEvolucaoFim({ ano: novoAno, mes: novoMes })}
            />
          )}

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
        </div>
      )}
    </div>
  );
}
