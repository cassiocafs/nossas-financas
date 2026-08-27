import { useState, type ReactNode } from "react";
import type { StatusFiltro } from "@/api/transacoes";
import { Card } from "@/components/ui/Card";

interface BuscaEStatusBarProps {
  texto: string;
  onTextoChange: (texto: string) => void;
  status: StatusFiltro;
  onStatusChange: (status: StatusFiltro) => void;
  acoesInicio?: ReactNode;
  acoesLote?: ReactNode;
  className?: string;
}

export function BuscaEStatusBar({
  texto,
  onTextoChange,
  status,
  onStatusChange,
  acoesInicio,
  acoesLote,
  className = "",
}: BuscaEStatusBarProps) {
  const [rascunhoBusca, setRascunhoBusca] = useState(texto);

  return (
    <Card className={`flex flex-col gap-3 px-4 py-3 text-sm ${className}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {acoesInicio && (
          <div className="flex flex-wrap items-center gap-2">{acoesInicio}</div>
        )}
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <input
              value={rascunhoBusca}
              onChange={(e) => setRascunhoBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onTextoChange(rascunhoBusca)}
              placeholder="Buscar transações..."
              className="h-9 w-full rounded-[11px] border border-border bg-muted px-3 pr-14 text-[12px] text-foreground"
            />
            {rascunhoBusca && (
              <button
                type="button"
                onClick={() => {
                  setRascunhoBusca("");
                  onTextoChange("");
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => onTextoChange(rascunhoBusca)}
            className="h-9 shrink-0 rounded-[11px] border border-border px-2.5 text-[12px] font-semibold text-foreground/80 hover:bg-muted"
          >
            Buscar
          </button>

          <span className="ml-1 shrink-0 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Status</span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StatusFiltro)}
            className="h-9 shrink-0 rounded-[11px] border border-border bg-muted px-2 text-[12px] text-foreground"
          >
            <option value="todas">Todas</option>
            <option value="consolidadas">Consolidadas</option>
            <option value="pendentes">Não consolidadas</option>
          </select>
        </div>
      </div>

      {acoesLote && <div className="border-t border-border pt-3">{acoesLote}</div>}
    </Card>
  );
}
