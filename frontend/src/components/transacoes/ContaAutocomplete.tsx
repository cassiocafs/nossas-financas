import { useEffect, useMemo, useRef, useState } from "react";
import type { Conta } from "@/api/contas";

interface ContaAutocompleteProps {
  value: string;
  onChange: (contaId: string) => void;
  contas: Conta[];
  placeholder?: string;
  disabled?: boolean;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function ContaAutocomplete({
  value,
  onChange,
  contas,
  placeholder = "Conta",
  disabled,
}: ContaAutocompleteProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selecionada = useMemo(() => contas.find((c) => c.id === value) ?? null, [contas, value]);

  const contasFiltradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return contas;
    return contas.filter((c) => normalizar(c.nome).includes(termo));
  }, [contas, busca]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
        setBusca("");
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function selecionar(id: string) {
    onChange(id);
    setAberto(false);
    setBusca("");
  }

  const valorExibido = aberto ? busca : (selecionada ? selecionada.nome : "");

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        disabled={disabled}
        value={valorExibido}
        onFocus={() => {
          setAberto(true);
          setBusca("");
        }}
        onChange={(e) => {
          setAberto(true);
          setBusca(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
      {aberto && !disabled && (
        <ul className="card-surface absolute z-20 mt-1 max-h-64 w-full overflow-auto py-1">
          {contasFiltradas.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(c.id)}
                className="block w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-muted"
              >
                {c.nome}
              </button>
            </li>
          ))}
          {contasFiltradas.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-muted-foreground">
              Nenhuma conta encontrada
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
