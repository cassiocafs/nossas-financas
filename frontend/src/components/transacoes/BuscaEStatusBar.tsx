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
        <div className="flex w-full max-w-xs gap-2">
          <div className="relative w-full">
            <input
              value={rascunhoBusca}
              onChange={(e) => setRascunhoBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onTextoChange(rascunhoBusca)}
              placeholder="Buscar transações..."
              className="h-9 w-full rounded-[11px] border border-border bg-muted px-3 pr-16 text-[13px] text-foreground"
            />
            {rascunhoBusca && (
              <button
                type="button"
                onClick={() => {
                  setRascunhoBusca("");
                  onTextoChange("");
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => onTextoChange(rascunhoBusca)}
            className="h-9 shrink-0 rounded-[11px] border border-border px-3 text-[13px] font-semibold text-foreground/80 hover:bg-muted"
          >
            Buscar
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-bold tracking-widest text-muted-foreground uppercase">Status</span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StatusFiltro)}
            className="h-9 rounded-[11px] border border-border bg-muted px-3 text-[13px] text-foreground"
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
