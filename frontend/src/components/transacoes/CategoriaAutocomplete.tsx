import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarGrupos } from "@/api/categorias";

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

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function CategoriaAutocomplete({ value, onChange, disabled }: CategoriaAutocompleteProps) {
  const { data } = useQuery({ queryKey: ["categorias", "grupos"], queryFn: listarGrupos });
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

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

  const valorExibido = aberto ? busca : (selecionada ? selecionada.nome : "Sem Categoria");

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
        placeholder="Buscar categoria..."
        className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:bg-transparent dark:text-paper"
      />
      {aberto && !disabled && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-surface py-1 shadow-sm dark:border-line-night dark:bg-surface-night">
          <li>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selecionar("")}
              className="block w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-white/5"
            >
              Sem Categoria
            </button>
          </li>
          {itensFiltrados.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(item.id)}
                className="block w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-ink/5 dark:text-paper dark:hover:bg-white/5"
              >
                <span className="block">{item.nome}</span>
                {(item.grupoNome || item.subgrupoNome) && (
                  <span className="block text-xs text-ink/50 dark:text-paper/50">
                    {[item.grupoNome, item.subgrupoNome].filter(Boolean).join(" · ")}
                  </span>
                )}
              </button>
            </li>
          ))}
          {itensFiltrados.length === 0 && (
            <li className="px-3 py-1.5 text-sm text-ink/50 dark:text-paper/50">
              Nenhuma categoria encontrada
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
