import { useState } from "react";
import type { StatusFiltro } from "@/api/transacoes";
import { Card } from "@/components/ui/Card";

interface BuscaEStatusBarProps {
  texto: string;
  onTextoChange: (texto: string) => void;
  status: StatusFiltro;
  onStatusChange: (status: StatusFiltro) => void;
}

export function BuscaEStatusBar({
  texto,
  onTextoChange,
  status,
  onStatusChange,
}: BuscaEStatusBarProps) {
  const [rascunhoBusca, setRascunhoBusca] = useState(texto);

  return (
    <Card className="flex flex-wrap items-center gap-4 px-4 py-3 text-sm">
      <div className="flex min-w-[200px] flex-1 gap-2">
        <input
          value={rascunhoBusca}
          onChange={(e) => setRascunhoBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onTextoChange(rascunhoBusca)}
          placeholder="Buscar transações..."
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
        <button
          type="button"
          onClick={() => onTextoChange(rascunhoBusca)}
          className="shrink-0 rounded-xl border border-input px-3 py-2 text-sm text-foreground/80"
        >
          Buscar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs tracking-widest text-muted-foreground uppercase">Status</span>
        {(
          [
            ["todas", "Todas"],
            ["consolidadas", "Consolidadas"],
            ["pendentes", "Não consolidadas"],
          ] as const
        ).map(([valor, label]) => (
          <label key={valor} className="flex items-center gap-1.5 text-foreground/80">
            <input
              type="radio"
              checked={status === valor}
              onChange={() => onStatusChange(valor)}
              className="accent-primary"
            />
            {label}
          </label>
        ))}
      </div>
    </Card>
  );
}
