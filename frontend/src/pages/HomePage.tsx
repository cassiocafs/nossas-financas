import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { buscarEvolucaoSaldo, buscarResumoMensal, type PeriodoMes } from "@/api/transacoes";
import { listarContas } from "@/api/contas";
import { ComparativoMesAnteriorCard } from "@/components/home/ComparativoMesAnteriorCard";
import { SaldoPorContasCard } from "@/components/home/SaldoPorContasCard";
import { OrcamentoResumoCard } from "@/components/home/OrcamentoResumoCard";
import { EvolucaoSaldoChart } from "@/components/home/EvolucaoSaldoChart";
import { PendenciasList } from "@/components/home/PendenciasList";
import { CategoriaDrilldownChart } from "@/components/home/CategoriaDrilldownChart";
import { FluxoCaixaChart } from "@/components/home/FluxoCaixaChart";
import { TransacoesRecentesCard } from "@/components/home/TransacoesRecentesCard";
import { MesNavigator } from "@/components/shared/MesNavigator";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

function subtrairMeses(periodo: PeriodoMes, quantidade: number): PeriodoMes {
  const data = new Date(Date.UTC(periodo.ano, periodo.mes - 1 - quantidade, 1));
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1 };
}

function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconArrowDownLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 7 7 17" />
      <path d="M17 17H7V7" />
    </svg>
  );
}

function IconArrowUpRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function IconTrend(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5">
        <span
          className={`grid size-8 place-items-center rounded-[10px] ${
            tone === "income" ? "bg-income-soft text-income" : "bg-expense-soft text-expense"
          }`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="num mt-3.5 text-[26px] font-bold tracking-tight text-foreground">
        {formatarMoeda(value)}
      </p>
    </Card>
  );
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const padrao = hoje();
  const ano = Number(searchParams.get("ano")) || padrao.ano;
  const mes = Number(searchParams.get("mes")) || padrao.mes;

  function mudarMes(novoAno: number, novoMes: number) {
    setSearchParams({ ano: String(novoAno), mes: String(novoMes) });
  }

  const { data, isLoading } = useQuery({
    queryKey: ["transacoes", "resumo", ano, mes],
    queryFn: () => buscarResumoMensal(ano, mes),
  });

  const { data: contas } = useQuery({
    queryKey: ["contas", "ativas"],
    queryFn: () => listarContas(false),
  });
  const patrimonio = (contas ?? []).reduce((soma, c) => soma + c.saldoAtual, 0);

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
    ],
    queryFn: () => buscarEvolucaoSaldo(evolucaoInicio, evolucaoFim),
  });

  const despesasSemCategoria = data?.despesasPorCategoria.find((d) => d.categoriaId === null);
  const resultado = data ? data.totalEntradas - data.totalSaidas : 0;

  return (
    <div className="space-y-6 pt-4 sm:pt-6 lg:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Patrimônio nas contas
          </p>
          <h1 className="num mt-2 text-[40px] font-extrabold tracking-tight text-foreground">
            {formatarMoeda(patrimonio)}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
          <Link
            to={`/transacoes?ano=${ano}&mes=${mes}&novo=1`}
            className="inline-flex h-10 items-center gap-2 rounded-[11px] bg-primary px-4 text-sm font-bold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
          >
            <IconPlus className="size-4" />
            Novo lançamento
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="sm:w-72 sm:shrink-0">
          <SaldoPorContasCard />
        </div>

        <div className="flex-1 space-y-6">
          {data && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Receitas do mês"
                  value={data.totalEntradas}
                  tone="income"
                  icon={<IconArrowDownLeft className="size-4" />}
                />
                <StatCard
                  label="Despesas do mês"
                  value={data.totalSaidas}
                  tone="expense"
                  icon={<IconArrowUpRight className="size-4" />}
                />
                <StatCard
                  label="Resultado do mês"
                  value={resultado}
                  tone={resultado >= 0 ? "income" : "expense"}
                  icon={<IconTrend className="size-4" />}
                />
              </div>

              <FluxoCaixaChart ano={ano} mes={mes} />

              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="p-6">
                  <CategoriaDrilldownChart
                    dados={data.despesasPorCategoria}
                    tipo="DESPESA"
                    ano={ano}
                    mes={mes}
                  />
                </Card>
                <Card className="p-6">
                  <CategoriaDrilldownChart
                    dados={data.receitasPorCategoria}
                    tipo="RECEITA"
                    ano={ano}
                    mes={mes}
                  />
                </Card>
              </div>

              <TransacoesRecentesCard ano={ano} mes={mes} recentes={data.recentes} />
            </>
          )}

          {isLoading || !data ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : (
            <>
              {despesasSemCategoria && despesasSemCategoria.total > 0 && (
                <Link
                  to={`/transacoes?ano=${ano}&mes=${mes}`}
                  className="card-surface block p-3 text-sm text-foreground/70 hover:underline"
                >
                  ⚠ {formatarMoeda(despesasSemCategoria.total)} em despesas sem categoria este mês
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
