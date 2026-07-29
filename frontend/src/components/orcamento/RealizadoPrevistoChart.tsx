import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PontoSerie } from "@/api/orcamento";
import { formatarMoeda } from "@/lib/format";
import { useDarkMode } from "@/lib/useDarkMode";

interface RealizadoPrevistoChartProps {
  serie: PontoSerie[];
}

export function RealizadoPrevistoChart({ serie }: RealizadoPrevistoChartProps) {
  const escuro = useDarkMode();
  const corRealizado = escuro ? "#4d9fff" : "#0066cc";
  const corGrid = escuro ? "#262626" : "#e5e5e5";
  const corEixo = "#8c8c8c";

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={serie} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={corGrid} vertical={false} />
        <XAxis dataKey="dia" tick={{ fontSize: 11, fill: corEixo }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: corEixo }}
          tickLine={false}
          tickFormatter={(v) => formatarMoeda(v)}
          width={80}
        />
        <Tooltip
          formatter={(valor: number) => formatarMoeda(valor)}
          labelFormatter={(dia) => `Dia ${dia}`}
          contentStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="previstoAcumulado"
          name="Previsto"
          stroke={corEixo}
          strokeDasharray="4 4"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="realizadoAcumulado"
          name="Realizado"
          stroke={corRealizado}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
