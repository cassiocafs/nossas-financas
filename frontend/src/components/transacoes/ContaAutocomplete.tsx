import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Conta } from "@/api/contas";

function IconeSeta({ aberta }: { aberta: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-4 transition-transform ${aberta ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M5 7.5 10 12.5 15 7.5" />
    </svg>
  );
}

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
  const [focado, setFocado] = useState(false);
  const [busca, setBusca] = useState("");
  const [mostrarTudo, setMostrarTudo] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const selecionada = useMemo(() => contas.find((c) => c.id === value) ?? null, [contas, value]);

  const contasFiltradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return contas;
    return contas.filter((c) => normalizar(c.nome).includes(termo));
  }, [contas, busca]);

  const mostrarLista = focado && (busca.trim().length > 0 || mostrarTudo);

  useEffect(() => {
    setIndiceAtivo(-1);
  }, [busca, mostrarTudo]);

  useEffect(() => {
    if (indiceAtivo < 0) return;
    const item = listaRef.current?.children[indiceAtivo] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [indiceAtivo]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocado(false);
        setBusca("");
        setMostrarTudo(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  function selecionar(id: string) {
    onChange(id);
    setFocado(false);
    setBusca("");
    setMostrarTudo(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!mostrarLista || contasFiltradas.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceAtivo((i) => (i + 1) % contasFiltradas.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceAtivo((i) => (i <= 0 ? contasFiltradas.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (indiceAtivo >= 0) {
        e.preventDefault();
        selecionar(contasFiltradas[indiceAtivo].id);
      }
    } else if (e.key === "Escape") {
      setFocado(false);
      setBusca("");
      setMostrarTudo(false);
    }
  }

  const valorExibido = focado ? busca : (selecionada ? selecionada.nome : "");

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        disabled={disabled}
        value={valorExibido}
        onFocus={() => {
          setFocado(true);
          setBusca("");
        }}
        onChange={(e) => {
          setFocado(true);
          setBusca(e.target.value);
        }}
        onBlur={() => {
          setFocado(false);
          setBusca("");
          setMostrarTudo(false);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm text-foreground"
      />
      {focado && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={mostrarTudo ? "Ocultar contas" : "Ver todas as contas"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setMostrarTudo((v) => !v);
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <IconeSeta aberta={mostrarLista} />
        </button>
      )}
      {mostrarLista && !disabled && (
        <ul ref={listaRef} className="card-surface absolute z-20 mt-1 max-h-64 w-full overflow-auto py-1">
          {contasFiltradas.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(c.id)}
                className={`block w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-muted ${
                  indiceAtivo === i ? "bg-muted" : ""
                }`}
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
