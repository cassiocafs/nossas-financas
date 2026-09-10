import { useQuery } from "@tanstack/react-query";
import { buscarResumoMensal, type ResumoMensal } from "@/api/transacoes";
import { Card } from "@/components/ui/Card";
import { useFormatarValor } from "@/hooks/use-formatar-valor";

interface ComparativoMesAnteriorCardProps {
  ano: number;
  mes: number;
  totalEntradas: number;
  totalSaidas: number;
  /** Resumo do mês anterior já carregado (payload da Home); evita uma requisição. */
  resumoAnterior?: ResumoMensal;
}

function mesAnterior(ano: number, mes: number): { ano: number; mes: number } {
  return mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 };
}

function Delta({
  atual,
  anterior,
  invertido = false,
}: {
  atual: number;
  anterior: number;
  invertido?: boolean;
}) {
  const formatarValor = useFormatarValor();
  const delta = atual - anterior;
  const positivo = invertido ? delta <= 0 : delta >= 0;
  const sinal = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return (
    <span className={positivo ? "text-foreground" : "text-expense"}>
      {sinal}
      {formatarValor(Math.abs(delta))} vs. mês anterior
    </span>
  );
}

export function ComparativoMesAnteriorCard({
  ano,
  mes,
  totalEntradas,
  totalSaidas,
  resumoAnterior: resumoAnteriorProp,
}: ComparativoMesAnteriorCardProps) {
  const anterior = mesAnterior(ano, mes);

  const { data: resumoAnteriorQuery, isLoading: carregandoQuery } = useQuery({
    queryKey: ["transacoes", "resumo", anterior.ano, anterior.mes],
    queryFn: () => buscarResumoMensal(anterior.ano, anterior.mes),
    enabled: resumoAnteriorProp === undefined,
  });

  const resumoAnterior = resumoAnteriorProp ?? resumoAnteriorQuery;
  const isLoading = resumoAnteriorProp === undefined && carregandoQuery;

  const movimentoAtual = totalEntradas - totalSaidas;
  const movimentoAnterior = resumoAnterior
    ? resumoAnterior.totalEntradas - resumoAnterior.totalSaidas
    : 0;

  return (
    <Card className="grid grid-cols-1 gap-3 p-4 text-xs sm:grid-cols-3">
      {isLoading || !resumoAnterior ? (
        <p className="col-span-3 text-sm text-muted-foreground">
          Carregando comparativo...
        </p>
      ) : (
        <>
          <div>
            <p className="text-muted-foreground">Entradas</p>
            <Delta atual={totalEntradas} anterior={resumoAnterior.totalEntradas} />
          </div>
          <div>
            <p className="text-muted-foreground">Saídas</p>
            <Delta atual={totalSaidas} anterior={resumoAnterior.totalSaidas} invertido />
          </div>
          <div>
            <p className="text-muted-foreground">Saldo do mês</p>
            <Delta atual={movimentoAtual} anterior={movimentoAnterior} />
          </div>
        </>
      )}
    </Card>
  );
}
