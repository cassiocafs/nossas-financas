import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarContas } from "@/api/contas";
import { listarGrupos } from "@/api/categorias";
import type { StatusFiltro } from "@/api/transacoes";

interface FiltrosLateraisProps {
  status: StatusFiltro;
  onStatusChange: (status: StatusFiltro) => void;
  contaIds: string[];
  onContaIdsChange: (ids: string[]) => void;
  categoriaIds: string[];
  onCategoriaIdsChange: (ids: string[]) => void;
  texto: string;
  onTextoChange: (texto: string) => void;
}

export function FiltrosLaterais({
  status,
  onStatusChange,
  contaIds,
  onContaIdsChange,
  categoriaIds,
  onCategoriaIdsChange,
  texto,
  onTextoChange,
}: FiltrosLateraisProps) {
  const [rascunhoBusca, setRascunhoBusca] = useState(texto);

  const { data: contas = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: () => listarContas(true),
  });
  const { data: gruposData } = useQuery({
    queryKey: ["categorias", "grupos"],
    queryFn: listarGrupos,
  });

  function alternarConta(id: string) {
    onContaIdsChange(
      contaIds.includes(id) ? contaIds.filter((c) => c !== id) : [...contaIds, id],
    );
  }

  function alternarTodasContas() {
    onContaIdsChange(contaIds.length === contas.length ? [] : contas.map((c) => c.id));
  }

  function alternarCategoria(id: string) {
    onCategoriaIdsChange(
      categoriaIds.includes(id)
        ? categoriaIds.filter((c) => c !== id)
        : [...categoriaIds, id],
    );
  }

  return (
    <aside className="space-y-6 text-sm lg:w-64 lg:shrink-0">
      <div>
        <h3 className="mb-2 font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
          Busca rápida
        </h3>
        <div className="flex gap-2">
          <input
            value={rascunhoBusca}
            onChange={(e) => setRascunhoBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onTextoChange(rascunhoBusca)}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
          />
          <button
            type="button"
            onClick={() => onTextoChange(rascunhoBusca)}
            className="rounded-md border border-line px-3 py-2 text-sm text-ink/80 dark:border-line-night dark:text-paper/80"
          >
            Buscar
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
          Status
        </h3>
        <div className="space-y-1">
          {(
            [
              ["todas", "Todas"],
              ["consolidadas", "Consolidadas"],
              ["pendentes", "Não consolidadas"],
            ] as const
          ).map(([valor, label]) => (
            <label key={valor} className="flex items-center gap-2 text-ink/80 dark:text-paper/80">
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
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
            Contas
          </h3>
          <button
            type="button"
            onClick={alternarTodasContas}
            className="text-xs text-marca underline dark:text-marca-night"
          >
            Todos
          </button>
        </div>
        <div className="space-y-1">
          {contas.map((conta) => (
            <label key={conta.id} className="flex items-center gap-2 text-ink/80 dark:text-paper/80">
              <input
                type="checkbox"
                checked={contaIds.includes(conta.id)}
                onChange={() => alternarConta(conta.id)}
                className="accent-marca"
              />
              {conta.nome}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
          Categorias
        </h3>
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {gruposData?.grupos.map((grupo) => (
            <div key={grupo.id}>
              <p className="text-xs font-semibold text-ink/40 uppercase dark:text-paper/40">{grupo.nome}</p>
              {grupo.categorias.map((categoria) => (
                <label key={categoria.id} className="flex items-center gap-2 pl-2 text-ink/80 dark:text-paper/80">
                  <input
                    type="checkbox"
                    checked={categoriaIds.includes(categoria.id)}
                    onChange={() => alternarCategoria(categoria.id)}
                    className="accent-marca"
                  />
                  {categoria.nome}
                </label>
              ))}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
