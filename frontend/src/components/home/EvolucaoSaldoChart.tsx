import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PeriodoMes, PontoEvolucaoSaldo } from "@/api/transacoes";
import { formatarMoeda } from "@/lib/format";
import { useDarkMode } from "@/lib/useDarkMode";
import { Card } from "@/components/ui/Card";
import { MesNavigator } from "@/components/shared/MesNavigator";

interface EvolucaoSaldoChartProps {
  dados: PontoEvolucaoSaldo[];
  inicio: PeriodoMes;
  fim: PeriodoMes;
  onChangeInicio: (ano: number, mes: number) => void;
  onChangeFim: (ano: number, mes: number) => void;
}

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

export function EvolucaoSaldoChart({
  dados,
  inicio,
  fim,
  onChangeInicio,
  onChangeFim,
}: EvolucaoSaldoChartProps) {
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
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold text-ink dark:text-paper">
          Evolução do saldo
        </h3>
        <div className="flex items-center gap-2">
          <MesNavigator ano={inicio.ano} mes={inicio.mes} onChange={onChangeInicio} />
          <span className="text-xs text-ink/50 dark:text-paper/50">até</span>
          <MesNavigator ano={fim.ano} mes={fim.mes} onChange={onChangeFim} />
        </div>
      </div>
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
