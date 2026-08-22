import { useQueries } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buscarResumoMensal } from "@/api/transacoes";
import { formatarMoeda } from "@/lib/format";
import { Card } from "@/components/ui/Card";

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function subtrairMeses(ano: number, mes: number, quantidade: number) {
  const data = new Date(Date.UTC(ano, mes - 1 - quantidade, 1));
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() + 1 };
}

function formatarMoedaCompacta(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

interface FluxoCaixaChartProps {
  ano: number;
  mes: number;
}

export function FluxoCaixaChart({ ano, mes }: FluxoCaixaChartProps) {
  const periodos = Array.from({ length: 6 }, (_, i) => subtrairMeses(ano, mes, 5 - i));

  const resultados = useQueries({
    queries: periodos.map((p) => ({
      queryKey: ["transacoes", "resumo", p.ano, p.mes],
      queryFn: () => buscarResumoMensal(p.ano, p.mes),
    })),
  });

  const carregando = resultados.some((r) => r.isLoading);

  const serie = periodos.map((p, i) => ({
    label: `${MESES_ABREV[p.mes - 1]}/${String(p.ano).slice(2)}`,
    entradas: resultados[i].data?.totalEntradas ?? 0,
    saidas: resultados[i].data?.totalSaidas ?? 0,
  }));

  const mediaEntradas = serie.reduce((soma, m) => soma + m.entradas, 0) / serie.length;
  const mediaSaidas = serie.reduce((soma, m) => soma + m.saidas, 0) / serie.length;
  const taxaPoupanca = mediaEntradas > 0 ? ((mediaEntradas - mediaSaidas) / mediaEntradas) * 100 : 0;

  const corEntradas = "var(--color-income)";
  const corSaidas = "var(--color-expense)";
  const corGrid = "var(--color-border)";
  const corEixo = "var(--color-muted-foreground)";

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Fluxo de caixa</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Últimos 6 meses · entradas × saídas</p>
        </div>
        <div className="flex items-center gap-3.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block size-2 rounded-[3px] bg-income" /> Entradas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block size-2 rounded-[3px] bg-expense" /> Saídas
          </span>
        </div>
      </div>

      {carregando ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={196}>
            <BarChart data={serie} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barGap={6}>
              <CartesianGrid stroke={corGrid} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: corEixo }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: corEixo }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatarMoeda(v)}
                width={72}
              />
              <Tooltip
                formatter={(valor) => (typeof valor === "number" ? formatarMoeda(valor) : String(valor ?? ""))}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="entradas" name="Entradas" fill={corEntradas} radius={[6, 6, 2, 2]}>
                <LabelList
                  dataKey="entradas"
                  position="top"
                  formatter={(valor: number) => formatarMoedaCompacta(valor)}
                  style={{ fontSize: 10, fill: corEixo }}
                />
              </Bar>
              <Bar dataKey="saidas" name="Saídas" fill={corSaidas} radius={[6, 6, 2, 2]}>
                <LabelList
                  dataKey="saidas"
                  position="top"
                  formatter={(valor: number) => formatarMoedaCompacta(valor)}
                  style={{ fontSize: 10, fill: corEixo }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 flex gap-8">
            <div>
              <p className="text-[11px] text-muted-foreground">Média de entradas</p>
              <p className="num mt-1 text-sm font-bold text-income">{formatarMoeda(mediaEntradas)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Média de saídas</p>
              <p className="num mt-1 text-sm font-bold text-expense">{formatarMoeda(mediaSaidas)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Taxa de poupança</p>
              <p className="num mt-1 text-sm font-bold text-foreground">
                {taxaPoupanca.toFixed(1).replace(".", ",")}%
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
