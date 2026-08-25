import type { GrupoGrade } from "@/api/orcamento";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";
import { categoryColor } from "@/lib/categoryColor";

interface PrevistoRealizadoBarrasProps {
  grupos: GrupoGrade[];
}

export function PrevistoRealizadoBarras({ grupos }: PrevistoRealizadoBarrasProps) {
  const comPrevisto = grupos.filter((g) => g.subtotalPrevisto > 0 || g.subtotalRealizado > 0);
  const noLimite = comPrevisto.filter(
    (g) => g.subtotalPrevisto > 0 && g.subtotalRealizado > g.subtotalPrevisto,
  ).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">
            Previsto × realizado por grupo
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Barras acima de 100% indicam estouro do previsto
          </p>
        </div>
        {noLimite > 0 && (
          <span className="rounded-full bg-money-alert-soft px-3 py-1 text-[11px] font-bold text-money-alert">
            {noLimite} {noLimite === 1 ? "grupo" : "grupos"} no limite
          </span>
        )}
      </div>

      {comPrevisto.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nenhum previsto definido este mês.</p>
      ) : (
        <div className="mt-5 space-y-5">
          {comPrevisto.map((grupo) => {
            const pct =
              grupo.subtotalPrevisto > 0
                ? (grupo.subtotalRealizado / grupo.subtotalPrevisto) * 100
                : 0;
            const estourado = pct > 100;
            const cor = categoryColor(grupo.grupoId ?? grupo.grupoNome);
            return (
              <div key={grupo.grupoId ?? grupo.grupoNome}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <i className="inline-block size-2 rounded-[3px]" style={{ background: cor }} />
                    <span className="text-sm font-semibold text-foreground">{grupo.grupoNome}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        estourado ? "bg-money-alert-soft text-money-alert" : "bg-income-soft text-income"
                      }`}
                    >
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    <b className="font-semibold text-foreground">
                      {formatarMoeda(grupo.subtotalRealizado)}
                    </b>{" "}
                    de {formatarMoeda(grupo.subtotalPrevisto)}
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(pct, 100)}%`, background: cor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
