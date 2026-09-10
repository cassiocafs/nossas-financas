import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RelatorioMes } from "@/api/relatorios";
import { Card } from "@/components/ui/Card";
import { useFormatarValor } from "@/hooks/use-formatar-valor";
import { usePreferences } from "@/contexts/PreferencesContext";
import { mesAbrev } from "@/lib/periodo";

/** Coral das saídas: exceção de design do handoff, fora dos tokens (igual `FluxoCaixaChart`). */
const COR_SAIDAS = "#E59D98";

interface ReceitaDespesaChartProps {
  meses: RelatorioMes[];
}

function formatarCompacta(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

export function ReceitaDespesaChart({ meses }: ReceitaDespesaChartProps) {
  const formatarValor = useFormatarValor();
  const { hideValues } = usePreferences();

  const serie = meses.map((m) => ({
    label: `${mesAbrev(m.mes)}/${String(m.ano).slice(2)}`,
    receitas: m.receitas,
    despesas: m.despesas,
  }));

  const corEntradas = "var(--color-chart-2)";
  const corGrid = "var(--color-border)";
  const corEixo = "var(--color-muted-foreground)";

  return (
    <Card className="p-5">
      <h3 className="font-display text-sm font-semibold text-foreground">Receita e despesa por mês</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Barras lado a lado — o que entrou e o que saiu em cada mês do período
      </p>

      {serie.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Sem dados no período.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={serie} margin={{ top: 16, right: 8, left: 0, bottom: 0 }} barGap={4}>
              <CartesianGrid stroke={corGrid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: corEixo }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: corEixo }}
                tickLine={false}
                axisLine={false}
                width={hideValues ? 8 : 68}
                tickFormatter={(v) => (hideValues ? "" : formatarCompacta(Number(v)))}
              />
              <Tooltip
                formatter={(valor) =>
                  typeof valor === "number" ? formatarValor(valor) : String(valor ?? "")
                }
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="receitas" name="Entrou" fill={corEntradas} radius={[6, 6, 2, 2]} />
              <Bar dataKey="despesas" name="Saiu" fill={COR_SAIDAS} radius={[6, 6, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <i className="inline-block size-2.5 rounded-[3px]" style={{ background: corEntradas }} />
              Entrou
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <i className="inline-block size-2.5 rounded-[3px]" style={{ background: COR_SAIDAS }} />
              Saiu
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
