import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buscarResumoMensal } from "@/api/transacoes";
import { formatarMoeda } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** Cor de rosa/coral para as saídas: exceção introduzida pelo usuário no handoff de design,
 * não faz parte da paleta de tokens — mantida como hex literal por decisão de produto. */
const COR_SAIDAS = "#E59D98";

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
  contaIds?: string[];
}

export function FluxoCaixaChart({ ano, mes, contaIds }: FluxoCaixaChartProps) {
  const [meses, setMeses] = useState<6 | 12>(6);
  const periodos = Array.from({ length: meses }, (_, i) => subtrairMeses(ano, mes, meses - 1 - i));

  const resultados = useQueries({
    queries: periodos.map((p) => ({
      queryKey: ["transacoes", "resumo", p.ano, p.mes, contaIds],
      queryFn: () => buscarResumoMensal(p.ano, p.mes, contaIds),
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

  const corEntradas = "var(--color-chart-2)";
  const corGrid = "var(--color-border)";
  const corEixo = "var(--color-muted-foreground)";

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">Entrou e saiu</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Últimos {meses === 6 ? "seis" : "doze"} meses
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Chip selected={meses === 6} onClick={() => setMeses(6)}>
            6 meses
          </Chip>
          <Chip selected={meses === 12} onClick={() => setMeses(12)}>
            12 meses
          </Chip>
        </div>
      </div>

      {carregando ? (
        <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={serie} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barGap={4}>
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
              <Bar dataKey="entradas" name="Entrou" fill={corEntradas} radius={[6, 6, 2, 2]}>
                <LabelList
                  dataKey="entradas"
                  position="top"
                  formatter={(valor: unknown) =>
                    formatarMoedaCompacta(typeof valor === "number" ? valor : Number(valor ?? 0))
                  }
                  style={{ fontSize: 10, fill: corEixo }}
                />
              </Bar>
              <Bar dataKey="saidas" name="Saiu" fill={COR_SAIDAS} radius={[6, 6, 2, 2]}>
                <LabelList
                  dataKey="saidas"
                  position="top"
                  formatter={(valor: unknown) =>
                    formatarMoedaCompacta(typeof valor === "number" ? valor : Number(valor ?? 0))
                  }
                  style={{ fontSize: 10, fill: "var(--color-yellow-accent)" }}
                />
              </Bar>
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
            <span className="ml-auto text-xs text-muted-foreground">
              Média das entradas{" "}
              <span className="num text-sm font-bold text-foreground">
                {formatarMoeda(mediaEntradas)}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">
              Média das saídas{" "}
              <span className="num text-sm font-bold text-foreground">
                {formatarMoeda(mediaSaidas)}
              </span>
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
