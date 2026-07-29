import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GrupoGrade } from "@/api/orcamento";
import { removerCategoriaDoOrcamento } from "@/api/orcamento";
import { formatarMoeda } from "@/lib/format";

interface OrcamentoTabelaProps {
  orcamentoId: string;
  mes: number;
  grupos: GrupoGrade[];
  onEditarCategoria: (categoriaId: string) => void;
}

function BarraProgresso({ previsto, realizado, estourado }: { previsto: number; realizado: number; estourado: boolean }) {
  const percentual = previsto > 0 ? Math.min((realizado / previsto) * 100, 100) : realizado > 0 ? 100 : 0;
  return (
    <div className="h-1 w-full overflow-hidden bg-ink/10 dark:bg-white/10">
      <div
        className={`h-full ${estourado ? "bg-vermelho dark:bg-vermelho-night" : "bg-marca"}`}
        style={{ width: `${percentual}%` }}
      />
    </div>
  );
}

export function OrcamentoTabela({ orcamentoId, mes, grupos, onEditarCategoria }: OrcamentoTabelaProps) {
  const queryClient = useQueryClient();

  const removerMutation = useMutation({
    mutationFn: (categoriaId: string) => removerCategoriaDoOrcamento(orcamentoId, categoriaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orcamento", orcamentoId, "itens"] }),
  });

  if (grupos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink/50 dark:text-paper/50">
        Nenhuma categoria no orçamento de {mes}. Clique em "Adicionar categoria" para começar.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {grupos.map((grupo) => (
        <div key={grupo.grupoId ?? "sem-grupo"}>
          <div className="mb-1 flex justify-between font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
            <span>{grupo.grupoNome}</span>
            <span>
              {formatarMoeda(grupo.subtotalRealizado)} / {formatarMoeda(grupo.subtotalPrevisto)}
            </span>
          </div>
          <ul className="divide-y divide-line dark:divide-line-night">
            {grupo.categorias.map((c) => (
              <li key={c.categoriaId} className="group space-y-1 py-2">
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => onEditarCategoria(c.categoriaId)}
                    className="text-ink underline-offset-2 hover:underline dark:text-paper"
                  >
                    {c.categoriaNome}
                  </button>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        c.estourado
                          ? "text-vermelho dark:text-vermelho-night"
                          : "text-ink/60 dark:text-paper/60"
                      }
                    >
                      {formatarMoeda(c.realizado)} / {formatarMoeda(c.previsto)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removerMutation.mutate(c.categoriaId)}
                      className="hidden text-xs text-ink/40 underline group-hover:inline hover:text-vermelho dark:text-paper/40 dark:hover:text-vermelho-night"
                    >
                      Remover
                    </button>
                  </div>
                </div>
                <BarraProgresso previsto={c.previsto} realizado={c.realizado} estourado={c.estourado} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
