import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listarGrupos, type Categoria } from "@/api/categorias";
import { useCategoryFilter } from "@/contexts/CategoryFilterContext";

function alternar(lista: string[], valor: string): string[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor];
}

const linkClasse = "text-[11.5px] font-semibold text-primary underline hover:opacity-80";

/**
 * Árvore de três níveis (grupo → subgrupo → categoria) na sidebar, abaixo do
 * bloco "Suas contas". Grupos e subgrupos são estruturais; só as folhas
 * (categorias) recebem checkbox.
 *
 * A seleção de folhas filtra a lista de transações (via CategoryFilterContext).
 *
 * Pendente de decisão de produto (não implementado aqui):
 * - o link "Nova" (modal ou bottom sheet, com seletor de nível);
 * - menu de contexto por nó para editar / excluir.
 */
export function CategoriasSidebar() {
  const { data } = useQuery({
    queryKey: ["categorias", "grupos"],
    queryFn: listarGrupos,
  });

  const {
    categoriasSelecionadasIds: catsMarcadas,
    alternarCategoriaSelecionada,
    limparCategoriasSelecionadas,
  } = useCategoryFilter();

  const [gruposAbertos, setGruposAbertos] = useState<string[]>([]);
  const [subsAbertos, setSubsAbertos] = useState<string[]>([]);

  const grupos = useMemo(() => data?.grupos ?? [], [data]);
  const semGrupo = useMemo(() => data?.semGrupo ?? [], [data]);

  const { idsGrupos, idsSubs } = useMemo(
    () => ({
      idsGrupos: grupos.map((g) => g.id),
      idsSubs: grupos.flatMap((g) => g.subgrupos.map((s) => s.id)),
    }),
    [grupos],
  );

  const tudoAberto =
    idsGrupos.length > 0 &&
    idsGrupos.every((id) => gruposAbertos.includes(id)) &&
    idsSubs.every((id) => subsAbertos.includes(id));

  function alternarTudo() {
    if (tudoAberto) {
      setGruposAbertos([]);
      setSubsAbertos([]);
    } else {
      setGruposAbertos(idsGrupos);
      setSubsAbertos(idsSubs);
    }
  }

  const selecionadas = catsMarcadas.length;

  function renderFolha(categoria: Categoria) {
    const marcada = catsMarcadas.includes(categoria.id);
    return (
      <button
        key={categoria.id}
        type="button"
        role="treeitem"
        aria-checked={marcada}
        onClick={() => alternarCategoriaSelecionada(categoria.id)}
        className="flex w-full items-center gap-2.5 rounded-md py-1 pr-2 pl-[41px] text-left transition-colors hover:bg-accent"
      >
        <span
          className={`flex size-[15px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] ${
            marcada
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-card"
          }`}
        >
          {marcada && <Check className="size-[11px]" strokeWidth={3} aria-hidden="true" />}
        </span>
        <span className="min-w-0 truncate text-[12px] leading-[1.3] text-foreground">
          {categoria.nome}
        </span>
      </button>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Categorias
        </span>
        <button type="button" className={linkClasse}>
          Nova
        </button>
        <span className="flex-1" />
        {idsGrupos.length > 0 && (
          <button type="button" onClick={alternarTudo} className={linkClasse}>
            {tudoAberto ? "Recolher tudo" : "Expandir tudo"}
          </button>
        )}
      </div>

      <div
        role="tree"
        aria-label="Categorias"
        className="scrollbar-thin mt-2.5 -mr-1.5 flex min-h-0 flex-1 flex-col gap-px overflow-y-auto pr-1.5"
      >
        {grupos.map((grupo) => {
          const aberto = gruposAbertos.includes(grupo.id);
          return (
            <div key={grupo.id}>
              <button
                type="button"
                role="treeitem"
                aria-expanded={aberto}
                onClick={() => setGruposAbertos((l) => alternar(l, grupo.id))}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent ${
                  aberto ? "bg-accent" : ""
                }`}
              >
                {aberto ? (
                  <ChevronDown className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ChevronRight className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="text-[11.5px] leading-[1.2] font-bold tracking-[0.07em] text-foreground uppercase">
                  {grupo.nome}
                </span>
              </button>

              {aberto && (
                <>
                  {grupo.categorias.map(renderFolha)}
                  {grupo.subgrupos.map((sub) => {
                    const subAberto = subsAbertos.includes(sub.id);
                    return (
                      <div key={sub.id}>
                        <button
                          type="button"
                          role="treeitem"
                          aria-expanded={subAberto}
                          onClick={() => setSubsAbertos((l) => alternar(l, sub.id))}
                          className="flex w-full items-center gap-2 rounded-md py-1.5 pr-2 pl-[22px] text-left transition-colors hover:bg-accent"
                        >
                          {subAberto ? (
                            <ChevronDown
                              className="size-[11px] shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronRight
                              className="size-[11px] shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                          <span className="text-[10.5px] leading-[1.2] font-semibold tracking-[0.09em] text-foreground/70 uppercase">
                            {sub.nome}
                          </span>
                        </button>
                        {subAberto && sub.categorias.map(renderFolha)}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}

        {semGrupo.length > 0 && (
          <div>
            {grupos.length > 0 && (
              <span className="block px-2 py-1.5 text-[11.5px] font-bold tracking-[0.07em] text-foreground uppercase">
                Sem grupo
              </span>
            )}
            {semGrupo.map(renderFolha)}
          </div>
        )}

        {grupos.length === 0 && semGrupo.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground">Nenhuma categoria ainda.</p>
        )}
      </div>

      {selecionadas > 0 && (
        <div className="mt-2 flex items-center gap-2 border-t border-border pt-2">
          <span className="text-[11px] leading-[1.2] font-medium text-muted-foreground">
            {selecionadas === 1
              ? "1 categoria selecionada"
              : `${selecionadas} categorias selecionadas`}
          </span>
          <span className="flex-1" />
          <button type="button" onClick={limparCategoriasSelecionadas} className={linkClasse}>
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}
