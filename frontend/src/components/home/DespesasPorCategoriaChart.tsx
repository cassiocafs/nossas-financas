import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatarMoeda } from "@/lib/format";
import {
  CATEGORICAL_PALETTE_DARK,
  CATEGORICAL_PALETTE_LIGHT,
  OUTROS_COR_DARK,
  OUTROS_COR_LIGHT,
} from "@/lib/chartPalette";
import { useDarkMode } from "@/lib/useDarkMode";

interface DespesaPorCategoria {
  categoriaId: string | null;
  categoriaNome: string;
  total: number;
}

interface DespesasPorCategoriaChartProps {
  dados: DespesaPorCategoria[];
}

const LIMITE_FATIAS = 8;

export function DespesasPorCategoriaChart({ dados }: DespesasPorCategoriaChartProps) {
  const escuro = useDarkMode();
  const paleta = escuro ? CATEGORICAL_PALETTE_DARK : CATEGORICAL_PALETTE_LIGHT;
  const corOutros = escuro ? OUTROS_COR_DARK : OUTROS_COR_LIGHT;

  if (dados.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink/50 dark:text-paper/50">
        Nenhuma despesa registrada neste mês.
      </p>
    );
  }

  const ordenado = [...dados].sort((a, b) => b.total - a.total);
  const principais = ordenado.slice(0, LIMITE_FATIAS);
  const resto = ordenado.slice(LIMITE_FATIAS);
  const outros = resto.reduce((soma, d) => soma + d.total, 0);

  const fatias = [
    ...principais.map((d, i) => ({ nome: d.categoriaNome, valor: d.total, cor: paleta[i] })),
    ...(outros > 0 ? [{ nome: "Outros", valor: outros, cor: corOutros }] : []),
  ];

  const total = fatias.reduce((soma, f) => soma + f.valor, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={fatias}
            dataKey="valor"
            nameKey="nome"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
          >
            {fatias.map((f) => (
              <Cell key={f.nome} fill={f.cor} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(valor: number) => formatarMoeda(valor)}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1 text-xs text-ink/70 dark:text-paper/70">
        {fatias.map((f) => (
          <li key={f.nome} className="flex justify-between">
            <span>{f.nome}</span>
            <span className="font-mono tabular-nums">
              {formatarMoeda(f.valor)} ({((f.valor / total) * 100).toFixed(0)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
