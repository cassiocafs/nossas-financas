import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarGrupos } from "@/api/categorias";

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

interface CategoriaAutocompleteProps {
  value: string;
  onChange: (categoriaId: string) => void;
  disabled?: boolean;
}

interface ItemCategoria {
  id: string;
  nome: string;
  grupoNome: string | null;
  subgrupoNome: string | null;
}

type LinhaArvore =
  | { tipo: "cabecalho"; nivel: 1 | 2; texto: string; key: string }
  | { tipo: "item"; item: ItemCategoria; indiceOpcao: number };

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function CategoriaAutocomplete({ value, onChange, disabled }: CategoriaAutocompleteProps) {
  const { data } = useQuery({ queryKey: ["categorias", "grupos"], queryFn: listarGrupos });
  const [focado, setFocado] = useState(false);
  const [busca, setBusca] = useState("");
  const [mostrarTudo, setMostrarTudo] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const itens = useMemo<ItemCategoria[]>(() => {
    if (!data) return [];
    const lista: ItemCategoria[] = [];
    for (const grupo of data.grupos) {
      for (const subgrupo of grupo.subgrupos) {
        for (const c of subgrupo.categorias) {
          lista.push({ id: c.id, nome: c.nome, grupoNome: grupo.nome, subgrupoNome: subgrupo.nome });
        }
      }
      for (const c of grupo.categorias) {
        lista.push({ id: c.id, nome: c.nome, grupoNome: grupo.nome, subgrupoNome: null });
      }
    }
    for (const c of data.semGrupo) {
      lista.push({ id: c.id, nome: c.nome, grupoNome: null, subgrupoNome: null });
    }
    return lista;
  }, [data]);

  const selecionada = useMemo(() => itens.find((i) => i.id === value) ?? null, [itens, value]);

  const itensFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return itens;
    return itens.filter((i) =>
      [i.nome, i.subgrupoNome, i.grupoNome].some((t) => t && normalizar(t).includes(termo)),
    );
  }, [itens, busca]);

  const mostrarLista = focado && (busca.trim().length > 0 || mostrarTudo);

  const opcoes = useMemo(
    () => [{ id: "", nome: "Sem Categoria" }, ...itensFiltrados],
    [itensFiltrados],
  );

  const linhasArvore = useMemo<LinhaArvore[]>(() => {
    const linhas: LinhaArvore[] = [];
    let grupoAtual: string | null | undefined;
    let subgrupoAtual: string | null | undefined;
    itensFiltrados.forEach((item, i) => {
      if (item.grupoNome !== grupoAtual) {
        grupoAtual = item.grupoNome;
        subgrupoAtual = undefined;
        if (item.grupoNome) {
          linhas.push({ tipo: "cabecalho", nivel: 1, texto: item.grupoNome, key: `g-${i}` });
        }
      }
      if (item.subgrupoNome !== subgrupoAtual) {
        subgrupoAtual = item.subgrupoNome;
        if (item.subgrupoNome) {
          linhas.push({ tipo: "cabecalho", nivel: 2, texto: item.subgrupoNome, key: `s-${i}` });
        }
      }
      linhas.push({ tipo: "item", item, indiceOpcao: i + 1 });
    });
    return linhas;
  }, [itensFiltrados]);

  useEffect(() => {
    setIndiceAtivo(-1);
  }, [busca, mostrarTudo]);

  useEffect(() => {
    if (indiceAtivo < 0) return;
    itemRefs.current[indiceAtivo]?.scrollIntoView({ block: "nearest" });
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
    if (!mostrarLista || opcoes.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceAtivo((i) => (i + 1) % opcoes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceAtivo((i) => (i <= 0 ? opcoes.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (indiceAtivo >= 0) {
        e.preventDefault();
        selecionar(opcoes[indiceAtivo].id);
      }
    } else if (e.key === "Escape") {
      setFocado(false);
      setBusca("");
      setMostrarTudo(false);
    }
  }

  const valorExibido = focado ? busca : (selecionada ? selecionada.nome : "Sem Categoria");

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
        placeholder="Buscar categoria..."
        className="w-full rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm text-foreground"
      />
      {focado && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={mostrarTudo ? "Ocultar categorias" : "Ver todas as categorias"}
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
        <ul className="card-surface absolute z-20 mt-1 max-h-64 w-full overflow-auto py-1">
          <li>
            <button
              type="button"
              ref={(el) => {
                itemRefs.current[0] = el;
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selecionar("")}
              className={`block w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-muted ${
                indiceAtivo === 0 ? "bg-muted" : ""
              }`}
            >
              Sem Categoria
            </button>
          </li>
          {linhasArvore.map((linha) => {
            if (linha.tipo === "cabecalho") {
              return (
                <li
                  key={linha.key}
                  className={`px-3 pt-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground ${
                    linha.nivel === 2 ? "pl-6" : "pl-3"
                  }`}
                >
                  {linha.texto}
                </li>
              );
            }
            const { item, indiceOpcao } = linha;
            const indentacao = item.subgrupoNome ? "pl-7" : item.grupoNome ? "pl-5" : "pl-3";
            return (
              <li key={item.id}>
                <button
                  type="button"
                  ref={(el) => {
                    itemRefs.current[indiceOpcao] = el;
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selecionar(item.id)}
                  className={`block w-full py-1.5 pr-3 text-left text-sm text-foreground hover:bg-muted ${indentacao} ${
                    indiceAtivo === indiceOpcao ? "bg-muted" : ""
                  }`}
                >
                  {item.nome}
                </button>
              </li>
            );
          })}
          {itensFiltrados.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-muted-foreground">
              Nenhuma categoria encontrada
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
