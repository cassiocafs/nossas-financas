import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SVGProps } from "react";
import type { CategoriaGrade, GrupoGrade, SubgrupoGrade } from "@/api/orcamento";
import { removerCategoriaDoOrcamento } from "@/api/orcamento";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

interface OrcamentoTabelaProps {
  orcamentoId: string;
  mes: number;
  grupos: GrupoGrade[];
  onEditarCategoria: (categoriaId: string) => void;
}

type IconProps = SVGProps<SVGSVGElement>;

function IconPencil(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconTrash(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </svg>
  );
}

function IconAlert(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 9v4" />
      <path d="M10.4 3.6 2.7 17a1.5 1.5 0 0 0 1.3 2.2h16a1.5 1.5 0 0 0 1.3-2.2L13.6 3.6a1.5 1.5 0 0 0-2.6 0Z" />
      <path d="M12 16.2h.01" />
    </svg>
  );
}

function IconInbox(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h4l2 3h4l2-3h4" />
      <path d="M5.5 5h13l3 7v6a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-6Z" />
    </svg>
  );
}

function LinhaCategoria({
  linha,
  onEditar,
  onRemover,
}: {
  linha: CategoriaGrade;
  onEditar: () => void;
  onRemover: () => void;
}) {
  const { categoriaNome, previsto, realizado, estourado } = linha;
  const percentualBarra = previsto > 0 ? Math.min((realizado / previsto) * 100, 100) : realizado > 0 ? 100 : 0;
  const percentualExibido = previsto > 0 ? Math.round((realizado / previsto) * 100) : realizado > 0 ? 100 : 0;

  const corValor = estourado ? "text-vermelho dark:text-vermelho-night" : "text-ink dark:text-paper";
  const corBarra = estourado ? "bg-vermelho dark:bg-vermelho-night" : "bg-verde dark:bg-verde-night";

  return (
    <li className="group flex items-center gap-3 py-1.5">
      <button
        type="button"
        onClick={onEditar}
        className="w-28 shrink-0 truncate text-left text-sm font-medium text-ink hover:text-marca dark:text-paper dark:hover:text-marca-night sm:w-40"
      >
        {categoriaNome}
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10 dark:bg-white/10">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ease-out ${corBarra}`}
            style={{ width: `${percentualBarra}%` }}
          />
        </div>
        <span className="w-8 shrink-0 text-right font-mono text-[11px] tabular-nums text-ink/40 dark:text-paper/40">
          {percentualExibido}%
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {estourado && (
          <span title={`Estourou o previsto em ${formatarMoeda(realizado - previsto)}`}>
            <IconAlert className="h-3.5 w-3.5 text-vermelho dark:text-vermelho-night" />
          </span>
        )}
        <span className="font-mono text-xs tabular-nums whitespace-nowrap">
          <span className={corValor}>{formatarMoeda(realizado)}</span>
          <span className="text-ink/30 dark:text-paper/30"> / {formatarMoeda(previsto)}</span>
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEditar}
          aria-label={`Editar ${categoriaNome}`}
          className="rounded p-0.5 text-ink/35 hover:!text-marca dark:text-paper/35 dark:hover:!text-marca-night"
        >
          <IconPencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemover}
          aria-label={`Remover ${categoriaNome} do orçamento`}
          className="rounded p-0.5 text-ink/35 hover:!text-vermelho dark:text-paper/35 dark:hover:!text-vermelho-night"
        >
          <IconTrash className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
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
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line px-6 py-14 text-center dark:border-line-night">
        <IconInbox className="h-7 w-7 text-ink/20 dark:text-paper/20" />
        <p className="max-w-xs text-sm text-ink/50 dark:text-paper/50">
          Nenhuma categoria no orçamento de {MESES[mes - 1]}. Clique em "Adicionar categoria" para definir
          quanto pretende gastar.
        </p>
      </div>
    );
  }

  function renderLista(categorias: CategoriaGrade[]) {
    return (
      <ul className="divide-y divide-line dark:divide-line-night">
        {categorias.map((c) => (
          <LinhaCategoria
            key={c.categoriaId}
            linha={c}
            onEditar={() => onEditarCategoria(c.categoriaId)}
            onRemover={() => removerMutation.mutate(c.categoriaId)}
          />
        ))}
      </ul>
    );
  }

  function renderSubgrupo(sub: SubgrupoGrade) {
    return (
      <div key={sub.subgrupoId} className="mt-2.5 border-l-2 border-marca/20 pl-3 dark:border-marca-night/25">
        <div className="mb-0.5 flex items-baseline justify-between gap-3">
          <span className="font-display text-xs font-medium text-marca dark:text-marca-night">
            {sub.subgrupoNome}
          </span>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink/40 dark:text-paper/40">
            {formatarMoeda(sub.subtotalRealizado)} / {formatarMoeda(sub.subtotalPrevisto)}
          </span>
        </div>
        {renderLista(sub.categorias)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {grupos.map((grupo) => {
        const estouradoGrupo = grupo.subtotalRealizado > grupo.subtotalPrevisto;
        return (
          <Card key={grupo.grupoId ?? "sem-grupo"} className="p-3 sm:p-4">
            <div className="mb-0.5 flex items-baseline justify-between gap-3 border-b border-line pb-2 dark:border-line-night">
              <h3 className="font-mono text-xs font-semibold tracking-widest text-ink uppercase dark:text-paper">
                {grupo.grupoNome}
              </h3>
              <div className="shrink-0 font-mono text-xs tabular-nums">
                <span className={estouradoGrupo ? "text-vermelho dark:text-vermelho-night" : "text-ink/70 dark:text-paper/70"}>
                  {formatarMoeda(grupo.subtotalRealizado)}
                </span>
                <span className="text-ink/30 dark:text-paper/30"> / {formatarMoeda(grupo.subtotalPrevisto)}</span>
              </div>
            </div>
            {grupo.categorias.length > 0 && renderLista(grupo.categorias)}
            {grupo.subgrupos.map(renderSubgrupo)}
          </Card>
        );
      })}
    </div>
  );
}
