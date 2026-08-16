import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarContas, type Conta } from "@/api/contas";
import { listarGrupos, type Categoria } from "@/api/categorias";
import { Valor } from "@/components/ui/Valor";
import { ContaFormModal } from "@/components/contas/ContaFormModal";
import { CategoriaFormModal } from "@/components/categorias/CategoriaFormModal";

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
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [criandoCategoria, setCriandoCategoria] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const mensagemTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function mostrarMensagemSucesso(mensagem: string) {
    if (mensagemTimeoutRef.current) clearTimeout(mensagemTimeoutRef.current);
    setMensagemSucesso(mensagem);
    mensagemTimeoutRef.current = setTimeout(() => setMensagemSucesso(null), 6000);
  }

  function fecharMensagemSucesso() {
    if (mensagemTimeoutRef.current) clearTimeout(mensagemTimeoutRef.current);
    setMensagemSucesso(null);
  }

  useEffect(() => {
    return () => {
      if (mensagemTimeoutRef.current) clearTimeout(mensagemTimeoutRef.current);
    };
  }, []);

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
      {mensagemSucesso && (
        <div className="relative flex items-center justify-center gap-2 rounded-xl border border-income/20 bg-income-soft px-8 py-2 text-xs font-bold text-income shadow-soft">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
              clipRule="evenodd"
            />
          </svg>
          {mensagemSucesso}
          <button
            type="button"
            onClick={fecharMensagemSucesso}
            aria-label="Fechar mensagem"
            className="absolute right-2 rounded p-1 text-income/60 hover:text-income"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      )}

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
                <span className="min-w-0 truncate">{conta.nome}</span>
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
              <Valor valor={conta.saldoAtual} className="shrink-0 text-xs" />
            </label>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs tracking-widest text-muted-foreground uppercase">Categorias</h3>
            <button
              type="button"
              onClick={() => setCriandoCategoria(true)}
              className="text-xs text-primary underline"
            >
              Nova
            </button>
          </div>
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
                        className="group flex items-center gap-2 pl-5 text-foreground/80"
                      >
                        <input
                          type="checkbox"
                          checked={categoriaIds.includes(categoria.id)}
                          onChange={() => alternarCategoria(categoria.id)}
                          className="accent-primary"
                        />
                        <span className="min-w-0 truncate">{categoria.nome}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setCategoriaEditando(categoria);
                          }}
                          className="hidden shrink-0 text-xs text-primary underline group-hover:inline"
                        >
                          Editar
                        </button>
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
                                className="group flex items-center gap-2 pl-8 text-foreground/80"
                              >
                                <input
                                  type="checkbox"
                                  checked={categoriaIds.includes(categoria.id)}
                                  onChange={() => alternarCategoria(categoria.id)}
                                  className="accent-primary"
                                />
                                <span className="min-w-0 truncate">{categoria.nome}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCategoriaEditando(categoria);
                                  }}
                                  className="hidden shrink-0 text-xs text-primary underline group-hover:inline"
                                >
                                  Editar
                                </button>
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
                  className="group flex items-center gap-2 pl-5 text-foreground/80"
                >
                  <input
                    type="checkbox"
                    checked={categoriaIds.includes(categoria.id)}
                    onChange={() => alternarCategoria(categoria.id)}
                    className="accent-primary"
                  />
                  <span className="min-w-0 truncate">{categoria.nome}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setCategoriaEditando(categoria);
                    }}
                    className="hidden shrink-0 text-xs text-primary underline group-hover:inline"
                  >
                    Editar
                  </button>
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
      <CategoriaFormModal
        open={!!categoriaEditando || criandoCategoria}
        onClose={() => {
          setCategoriaEditando(null);
          setCriandoCategoria(false);
        }}
        categoria={categoriaEditando}
        onSaved={() =>
          mostrarMensagemSucesso(
            criandoCategoria ? "Categoria criada com sucesso" : "Categoria atualizada com sucesso",
          )
        }
      />
    </aside>
  );
}
