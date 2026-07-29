import { useQuery } from "@tanstack/react-query";
import { buscarResumoMensal } from "@/api/transacoes";
import { Card } from "@/components/ui/Card";

interface ComparativoMesAnteriorCardProps {
  ano: number;
  mes: number;
  totalEntradas: number;
  totalSaidas: number;
}

function mesAnterior(ano: number, mes: number): { ano: number; mes: number } {
  return mes === 1 ? { ano: ano - 1, mes: 12 } : { ano, mes: mes - 1 };
}

function calcularVariacao(atual: number, anterior: number): number | null {
  if (anterior === 0) return null;
  return ((atual - anterior) / Math.abs(anterior)) * 100;
}

function Variacao({ valor, invertido = false }: { valor: number | null; invertido?: boolean }) {
  if (valor === null) {
    return <span className="text-ink/40 dark:text-paper/40">sem dado anterior</span>;
  }
  const positivo = invertido ? valor <= 0 : valor >= 0;
  return (
    <span className={positivo ? "text-ink dark:text-paper" : "text-vermelho dark:text-vermelho-night"}>
      {valor >= 0 ? "+" : ""}
      {valor.toFixed(0)}% vs. mês anterior
    </span>
  );
}

export function ComparativoMesAnteriorCard({
  ano,
  mes,
  totalEntradas,
  totalSaidas,
}: ComparativoMesAnteriorCardProps) {
  const anterior = mesAnterior(ano, mes);

  const { data: resumoAnterior, isLoading } = useQuery({
    queryKey: ["transacoes", "resumo", anterior.ano, anterior.mes],
    queryFn: () => buscarResumoMensal(anterior.ano, anterior.mes),
  });

  const movimentoAtual = totalEntradas - totalSaidas;
  const movimentoAnterior = resumoAnterior
    ? resumoAnterior.totalEntradas - resumoAnterior.totalSaidas
    : 0;

  return (
    <Card className="grid grid-cols-1 gap-3 p-4 text-xs sm:grid-cols-3">
      {isLoading || !resumoAnterior ? (
        <p className="col-span-3 text-sm text-ink/50 dark:text-paper/50">
          Carregando comparativo...
        </p>
      ) : (
        <>
          <div>
            <p className="text-ink/50 dark:text-paper/50">Entradas</p>
            <Variacao valor={calcularVariacao(totalEntradas, resumoAnterior.totalEntradas)} />
          </div>
          <div>
            <p className="text-ink/50 dark:text-paper/50">Saídas</p>
            <Variacao
              valor={calcularVariacao(totalSaidas, resumoAnterior.totalSaidas)}
              invertido
            />
          </div>
          <div>
            <p className="text-ink/50 dark:text-paper/50">Saldo do mês</p>
            <Variacao valor={calcularVariacao(movimentoAtual, movimentoAnterior)} />
          </div>
        </>
      )}
    </Card>
  );
}
