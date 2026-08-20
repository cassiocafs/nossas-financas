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

function IconeSeta({ aberta }: { aberta: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-4 shrink-0 transition-transform ${aberta ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M5 7.5 10 12.5 15 7.5" />
    </svg>
  );
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
        className="rounded-[11px] border border-border px-2 py-1 text-[13px] text-foreground/70 hover:bg-muted"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex min-w-36 items-center justify-center gap-1 rounded-[11px] px-2 py-1 text-center font-display text-sm font-medium text-foreground hover:bg-muted"
      >
        {MESES[mes - 1]} {ano}
        <IconeSeta aberta={aberto} />
      </button>
      <button
        type="button"
        onClick={() => irPara(1)}
        aria-label="Próximo mês"
        className="rounded-[11px] border border-border px-2 py-1 text-[13px] text-foreground/70 hover:bg-muted"
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
              className="flex-1 rounded-[11px] border border-border bg-muted px-2 py-1.5 text-[13px] text-foreground"
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
              className="w-24 rounded-[11px] border border-border bg-muted px-2 py-1.5 text-[13px] text-foreground"
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
