import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { buscarEvolucaoSaldo, buscarResumoMensal, type PeriodoMes } from "@/api/transacoes";
import { ResumoMesCard } from "@/components/home/ResumoMesCard";
import { ComparativoMesAnteriorCard } from "@/components/home/ComparativoMesAnteriorCard";
import { SaldoPorContasCard } from "@/components/home/SaldoPorContasCard";
import { OrcamentoResumoCard } from "@/components/home/OrcamentoResumoCard";
import { EvolucaoSaldoChart } from "@/components/home/EvolucaoSaldoChart";
import { PendenciasList } from "@/components/home/PendenciasList";
import { CategoriaDrilldownChart } from "@/components/home/CategoriaDrilldownChart";
import { MesNavigator } from "@/components/shared/MesNavigator";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

function subtrairMeses(periodo: PeriodoMes, quantidade: number): PeriodoMes {
  const data = new Date(Date.UTC(periodo.ano, periodo.mes - 1 - quantidade, 1));
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1 };
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
            {MESES[mes - 1]} de {ano}
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-paper">Início</h1>
        </div>
        <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="sm:w-72 sm:shrink-0">
          <SaldoPorContasCard />
        </div>
        <div className="flex-1 space-y-6">
          {data && (
            <>
              <ResumoMesCard
                saldoAnterior={data.saldoAnterior}
                totalEntradas={data.totalEntradas}
                totalSaidas={data.totalSaidas}
                saldoFinal={data.saldoFinal}
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="p-4">
                  <CategoriaDrilldownChart
                    dados={data.despesasPorCategoria}
                    tipo="DESPESA"
                    ano={ano}
                    mes={mes}
                  />
                </Card>
                <Card className="p-4">
                  <CategoriaDrilldownChart
                    dados={data.receitasPorCategoria}
                    tipo="RECEITA"
                    ano={ano}
                    mes={mes}
                  />
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      {isLoading || !data ? (
        <p className="font-mono text-sm text-ink/50 dark:text-paper/50">Carregando...</p>
      ) : (
        <>
          {despesasSemCategoria && despesasSemCategoria.total > 0 && (
            <Link
              to={`/transacoes?ano=${ano}&mes=${mes}`}
              className="block rounded-lg border border-line bg-surface p-3 text-sm text-ink/70 hover:underline dark:border-line-night dark:bg-surface-night dark:text-paper/70"
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
  );
}
