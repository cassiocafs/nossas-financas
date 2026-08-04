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
          className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
        />
        <button
          type="button"
          onClick={() => onTextoChange(rascunhoBusca)}
          className="shrink-0 rounded-md border border-line px-3 py-2 text-sm text-ink/80 dark:border-line-night dark:text-paper/80"
        >
          Buscar
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
          Status
        </span>
        {(
          [
            ["todas", "Todas"],
            ["consolidadas", "Consolidadas"],
            ["pendentes", "Não consolidadas"],
          ] as const
        ).map(([valor, label]) => (
          <label key={valor} className="flex items-center gap-1.5 text-ink/80 dark:text-paper/80">
            <input
              type="radio"
              checked={status === valor}
              onChange={() => onStatusChange(valor)}
              className="accent-marca"
            />
            {label}
          </label>
        ))}
      </div>
    </Card>
  );
}
