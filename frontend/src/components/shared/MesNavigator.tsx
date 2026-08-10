import { useEffect, useRef, useState } from "react";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface MesNavigatorProps {
  ano: number;
  mes: number;
  onChange: (ano: number, mes: number) => void;
}

export function MesNavigator({ ano, mes, onChange }: MesNavigatorProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function aoClicarFora(evento: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, [aberto]);

  function irPara(delta: number) {
    const data = new Date(Date.UTC(ano, mes - 1 + delta, 1));
    onChange(data.getUTCFullYear(), data.getUTCMonth() + 1);
  }

  const anos = Array.from({ length: 11 }, (_, i) => ano - 5 + i);

  return (
    <div ref={containerRef} className="relative flex items-center gap-3">
      <button
        type="button"
        onClick={() => irPara(-1)}
        aria-label="Mês anterior"
        className="rounded-xl border border-border px-2 py-1 text-sm text-foreground/70 hover:bg-muted"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="min-w-36 rounded-xl px-2 py-1 text-center font-display text-sm font-medium text-foreground hover:bg-muted"
      >
        {MESES[mes - 1]} {ano}
      </button>
      <button
        type="button"
        onClick={() => irPara(1)}
        aria-label="Próximo mês"
        className="rounded-xl border border-border px-2 py-1 text-sm text-foreground/70 hover:bg-muted"
      >
        →
      </button>

      {aberto && (
        <div className="card-surface absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 p-3 shadow-lift">
          <div className="flex gap-2">
            <select
              value={mes}
              onChange={(e) => onChange(ano, Number(e.target.value))}
              aria-label="Selecionar mês"
              className="flex-1 rounded-xl border border-input bg-background px-2 py-1.5 text-sm text-foreground"
            >
              {MESES.map((nome, indice) => (
                <option key={nome} value={indice + 1}>
                  {nome}
                </option>
              ))}
            </select>
            <select
              value={ano}
              onChange={(e) => onChange(Number(e.target.value), mes)}
              aria-label="Selecionar ano"
              className="w-24 rounded-xl border border-input bg-background px-2 py-1.5 text-sm text-foreground"
            >
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
