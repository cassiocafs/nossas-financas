import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { buscarEvolucaoSaldo, buscarResumoMensal } from "@/api/transacoes";
import { ResumoMesCard } from "@/components/home/ResumoMesCard";
import { ComparativoMesAnteriorCard } from "@/components/home/ComparativoMesAnteriorCard";
import { SaldoPorContasCard } from "@/components/home/SaldoPorContasCard";
import { OrcamentoResumoCard } from "@/components/home/OrcamentoResumoCard";
import { EvolucaoSaldoChart } from "@/components/home/EvolucaoSaldoChart";
import { PendenciasList } from "@/components/home/PendenciasList";
import { DespesasPorCategoriaChart } from "@/components/home/DespesasPorCategoriaChart";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function HomePage() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = agora.getMonth() + 1;

  const { data, isLoading } = useQuery({
    queryKey: ["transacoes", "resumo", ano, mes],
    queryFn: () => buscarResumoMensal(ano, mes),
  });

  const { data: evolucaoSaldo } = useQuery({
    queryKey: ["transacoes", "evolucao-saldo"],
    queryFn: () => buscarEvolucaoSaldo(6),
  });

  const despesasSemCategoria = data?.despesasPorCategoria.find((d) => d.categoriaId === null);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
          {MESES[mes - 1]} de {ano}
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-paper">Início</h1>
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

          <ResumoMesCard
            saldoAnterior={data.saldoAnterior}
            totalEntradas={data.totalEntradas}
            totalSaidas={data.totalSaidas}
            saldoFinal={data.saldoFinal}
          />

          <ComparativoMesAnteriorCard
            ano={ano}
            mes={mes}
            totalEntradas={data.totalEntradas}
            totalSaidas={data.totalSaidas}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <SaldoPorContasCard />
            <OrcamentoResumoCard ano={ano} mes={mes} />
          </div>

          {evolucaoSaldo && <EvolucaoSaldoChart dados={evolucaoSaldo} />}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <PendenciasList
                titulo="Anteriores não consolidadas"
                itens={data.anterioresNaoConsolidadas}
              />
              <PendenciasList
                titulo="Próximas não consolidadas"
                itens={data.proximasNaoConsolidadas}
              />
            </div>
            <Card className="p-4">
              <h3 className="mb-2 font-display text-sm font-semibold text-ink dark:text-paper">
                Despesas por categoria
              </h3>
              <DespesasPorCategoriaChart dados={data.despesasPorCategoria} />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
