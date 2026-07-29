import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PontoEvolucaoSaldo } from "@/api/transacoes";
import { formatarMoeda } from "@/lib/format";
import { useDarkMode } from "@/lib/useDarkMode";
import { Card } from "@/components/ui/Card";

interface EvolucaoSaldoChartProps {
  dados: PontoEvolucaoSaldo[];
}

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function EvolucaoSaldoChart({ dados }: EvolucaoSaldoChartProps) {
  const escuro = useDarkMode();
  const corLinha = escuro ? "#4d9fff" : "#0066cc";
  const corGrid = escuro ? "#262626" : "#e5e5e5";
  const corEixo = "#8c8c8c";

  const serie = dados.map((p) => ({
    ...p,
    label: `${MESES_ABREV[p.mes - 1]}/${String(p.ano).slice(2)}`,
  }));

  return (
    <Card className="p-4">
      <h3 className="mb-2 font-display text-sm font-semibold text-ink dark:text-paper">
        Evolução do saldo
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={serie} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="evolucaoSaldoGradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={corLinha} stopOpacity={0.25} />
              <stop offset="100%" stopColor={corLinha} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={corGrid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: corEixo }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: corEixo }}
            tickLine={false}
            tickFormatter={(v) => formatarMoeda(v)}
            width={80}
          />
          <Tooltip
            formatter={(valor: number) => formatarMoeda(valor)}
            contentStyle={{ fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="saldoFinal"
            name="Saldo"
            stroke={corLinha}
            strokeWidth={2}
            fill="url(#evolucaoSaldoGradiente)"
            dot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
