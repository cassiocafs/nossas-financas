import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarContas, type Conta } from "@/api/contas";
import { listarGrupos } from "@/api/categorias";
import { Valor } from "@/components/ui/Valor";
import { ContaFormModal } from "@/components/contas/ContaFormModal";

interface FiltrosLateraisProps {
  contaIds: string[];
  onContaIdsChange: (ids: string[]) => void;
  categoriaIds: string[];
  onCategoriaIdsChange: (ids: string[]) => void;
}

export function FiltrosLaterais({
  contaIds,
  onContaIdsChange,
  categoriaIds,
  onCategoriaIdsChange,
}: FiltrosLateraisProps) {
  const [gruposExpandidos, setGruposExpandidos] = useState<Record<string, boolean>>({});
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);

  const { data: contasData = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: () => listarContas(true),
  });
  const contas = useMemo(
    () => [...contasData].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [contasData],
  );
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

  function grupoExpandido(id: string) {
    return gruposExpandidos[id] ?? true;
  }

  function alternarGrupo(id: string) {
    setGruposExpandidos((prev) => ({ ...prev, [id]: !grupoExpandido(id) }));
  }

  const idsExpansiveis = useMemo(() => {
    const grupos = gruposData?.grupos ?? [];
    return [...grupos.map((g) => g.id), ...grupos.flatMap((g) => g.subgrupos.map((s) => `sub-${s.id}`))];
  }, [gruposData]);

  const todosExpandidos = idsExpansiveis.every((id) => grupoExpandido(id));

  function alternarTodosGrupos() {
    const novoValor = !todosExpandidos;
    setGruposExpandidos((prev) => {
      const next = { ...prev };
      for (const id of idsExpansiveis) next[id] = novoValor;
      return next;
    });
  }

  return (
    <aside className="space-y-6 text-sm lg:w-64 lg:shrink-0">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs tracking-widest text-muted-foreground uppercase">Contas</h3>
          <button
            type="button"
            onClick={alternarTodasContas}
            className="text-xs text-primary underline"
          >
            Todos
          </button>
        </div>
        <div className="space-y-1">
          {contas.map((conta) => (
            <label
              key={conta.id}
              className="group flex items-center justify-between gap-2 text-foreground/80"
            >
              <span className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={contaIds.includes(conta.id)}
                  onChange={() => alternarConta(conta.id)}
                  className="accent-primary"
                />
                <span className="truncate">{conta.nome}</span>
                <button
                  type="button"
                  onClick={() => onContaIdsChange([conta.id])}
                  className="hidden shrink-0 text-xs text-primary underline group-hover:inline"
                >
                  Somente
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setContaEditando(conta);
                  }}
                  className="hidden shrink-0 text-xs text-primary underline group-hover:inline"
                >
                  Editar
                </button>
              </span>
              <Valor valor={conta.saldoAtual} className="text-xs" />
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs tracking-widest text-muted-foreground uppercase">Categorias</h3>
          {idsExpansiveis.length > 0 && (
            <button
              type="button"
              onClick={alternarTodosGrupos}
              className="text-xs text-primary underline"
            >
              {todosExpandidos ? "Recolher tudo" : "Expandir tudo"}
            </button>
          )}
        </div>
        <div className="space-y-2">
          {gruposData?.grupos.map((grupo) => {
            const expandido = grupoExpandido(grupo.id);
            return (
              <div key={grupo.id}>
                <button
                  type="button"
                  onClick={() => alternarGrupo(grupo.id)}
                  className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left text-xs font-bold text-foreground/70 uppercase hover:bg-muted"
                >
                  <span className="inline-block w-4 text-lg leading-none">
                    {expandido ? "▾" : "▸"}
                  </span>
                  {grupo.nome}
                </button>
                {expandido && (
                  <div className="space-y-1">
                    {grupo.categorias.map((categoria) => (
                      <label
                        key={categoria.id}
                        className="flex items-center gap-2 pl-5 text-foreground/80"
                      >
                        <input
                          type="checkbox"
                          checked={categoriaIds.includes(categoria.id)}
                          onChange={() => alternarCategoria(categoria.id)}
                          className="accent-primary"
                        />
                        {categoria.nome}
                      </label>
                    ))}
                    {grupo.subgrupos.map((subgrupo) => {
                      const subChave = `sub-${subgrupo.id}`;
                      const subExpandido = grupoExpandido(subChave);
                      return (
                        <div key={subgrupo.id}>
                          <button
                            type="button"
                            onClick={() => alternarGrupo(subChave)}
                            className="flex w-full items-center gap-1.5 rounded px-1 py-1 pl-3 text-left text-xs font-semibold text-foreground/60 uppercase hover:bg-muted"
                          >
                            <span className="inline-block w-4 text-lg leading-none">
                              {subExpandido ? "▾" : "▸"}
                            </span>
                            {subgrupo.nome}
                          </button>
                          {subExpandido &&
                            subgrupo.categorias.map((categoria) => (
                              <label
                                key={categoria.id}
                                className="flex items-center gap-2 pl-8 text-foreground/80"
                              >
                                <input
                                  type="checkbox"
                                  checked={categoriaIds.includes(categoria.id)}
                                  onChange={() => alternarCategoria(categoria.id)}
                                  className="accent-primary"
                                />
                                {categoria.nome}
                              </label>
                            ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {gruposData?.semGrupo && gruposData.semGrupo.length > 0 && (
            <div className="space-y-1">
              {gruposData.grupos.length > 0 && (
                <span className="block text-xs font-bold text-foreground/70 uppercase">
                  Sem grupo
                </span>
              )}
              {gruposData.semGrupo.map((categoria) => (
                <label
                  key={categoria.id}
                  className="flex items-center gap-2 pl-5 text-foreground/80"
                >
                  <input
                    type="checkbox"
                    checked={categoriaIds.includes(categoria.id)}
                    onChange={() => alternarCategoria(categoria.id)}
                    className="accent-primary"
                  />
                  {categoria.nome}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <ContaFormModal
        open={!!contaEditando}
        onClose={() => setContaEditando(null)}
        conta={contaEditando}
      />
    </aside>
  );
}
