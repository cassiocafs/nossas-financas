import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SVGProps } from "react";
import type { CategoriaGrade, GrupoGrade, SubgrupoGrade } from "@/api/orcamento";
import { removerCategoriaDoOrcamento } from "@/api/orcamento";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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

function IconSpinner(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="animate-spin" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function LinhaCategoria({
  linha,
  onEditar,
  onRemover,
  removendo,
  bloqueado,
}: {
  linha: CategoriaGrade;
  onEditar: () => void;
  onRemover: () => void;
  removendo: boolean;
  bloqueado: boolean;
}) {
  const { categoriaNome, previsto, realizado, estourado } = linha;
  const excedente = Math.max(realizado - previsto, 0);
  const percentualBarra = estourado
    ? (previsto / realizado) * 100
    : previsto > 0
      ? (realizado / previsto) * 100
      : realizado > 0
        ? 100
        : 0;
  const percentualExcedente = estourado ? (excedente / realizado) * 100 : 0;
  const percentualExibido = previsto > 0 ? Math.round((realizado / previsto) * 100) : realizado > 0 ? 100 : 0;

  const corValor = estourado ? "text-expense" : "text-foreground";

  return (
    <li className={`group flex items-center gap-3 py-1.5 transition-opacity ${removendo ? "opacity-50" : ""}`}>
      <button
        type="button"
        onClick={onEditar}
        disabled={bloqueado}
        className="w-28 shrink-0 truncate text-left text-sm font-medium text-foreground hover:text-primary disabled:cursor-not-allowed disabled:hover:text-foreground sm:w-40"
      >
        {categoriaNome}
      </button>

      <div className="min-w-0 flex-1">
        <div className="relative h-6 overflow-hidden rounded-full bg-foreground/10">
          <div
            className={`absolute inset-y-0 left-0 rounded-l-full bg-black transition-[width] duration-300 ease-out ${
              estourado ? "" : "rounded-r-full"
            }`}
            style={{ width: `${percentualBarra}%` }}
          />
          {estourado && (
            <div
              className="absolute inset-y-0 rounded-r-full bg-expense/70 transition-[width] duration-300 ease-out"
              style={{ left: `${percentualBarra}%`, width: `${percentualExcedente}%` }}
            />
          )}
          <span
            className={`num absolute inset-0 flex items-center justify-center text-xs font-semibold ${
              percentualBarra + percentualExcedente > 50 ? "text-white" : "text-foreground"
            }`}
          >
            {percentualExibido}%
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {estourado && (
          <span title={`Estourou o previsto em ${formatarMoeda(realizado - previsto)}`}>
            <IconAlert className="h-3.5 w-3.5 text-expense" />
          </span>
        )}
        <span className="num text-xs whitespace-nowrap">
          <span className={corValor}>{formatarMoeda(realizado)}</span>
          <span className="text-foreground/30"> / {formatarMoeda(previsto)}</span>
        </span>
      </div>

      <div
        className={`flex shrink-0 items-center gap-1.5 transition-opacity ${
          removendo ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {removendo ? (
          <span className="p-0.5 text-foreground/40" aria-label="Removendo...">
            <IconSpinner className="h-3.5 w-3.5" />
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={onEditar}
              disabled={bloqueado}
              aria-label={`Editar ${categoriaNome}`}
              className="rounded p-0.5 text-foreground/35 hover:!text-primary disabled:cursor-not-allowed disabled:hover:!text-foreground/35"
            >
              <IconPencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRemover}
              disabled={bloqueado}
              aria-label={`Remover ${categoriaNome} do orçamento`}
              className="rounded p-0.5 text-foreground/35 hover:!text-destructive disabled:cursor-not-allowed disabled:hover:!text-foreground/35"
            >
              <IconTrash className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

export function OrcamentoTabela({ orcamentoId, mes, grupos, onEditarCategoria }: OrcamentoTabelaProps) {
  const queryClient = useQueryClient();
  const [categoriaParaRemover, setCategoriaParaRemover] = useState<CategoriaGrade | null>(null);

  const removerMutation = useMutation({
    mutationFn: async (categoriaId: string) => {
      await removerCategoriaDoOrcamento(orcamentoId, categoriaId);
      await queryClient.invalidateQueries({ queryKey: ["orcamento", orcamentoId, "itens"] });
    },
    onSuccess: () => {
      setCategoriaParaRemover(null);
    },
  });

  if (grupos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <IconInbox className="h-7 w-7 text-foreground/20" />
        <p className="max-w-xs text-sm text-muted-foreground">
          Nenhuma categoria no orçamento de {MESES[mes - 1]}. Clique em "Adicionar categoria" para definir
          quanto pretende gastar.
        </p>
      </div>
    );
  }

  function renderLista(categorias: CategoriaGrade[]) {
    return (
      <ul className="divide-y divide-border">
        {categorias.map((c) => (
          <LinhaCategoria
            key={c.categoriaId}
            linha={c}
            onEditar={() => onEditarCategoria(c.categoriaId)}
            onRemover={() => setCategoriaParaRemover(c)}
            removendo={removerMutation.isPending && removerMutation.variables === c.categoriaId}
            bloqueado={removerMutation.isPending}
          />
        ))}
      </ul>
    );
  }

  function renderSubgrupo(sub: SubgrupoGrade) {
    return (
      <div key={sub.subgrupoId} className="mt-2.5 border-l-2 border-primary/20 pl-3">
        <div className="mb-0.5 flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium text-primary">{sub.subgrupoNome}</span>
          <span className="num shrink-0 text-[11px] text-muted-foreground">
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
            <div className="mb-0.5 flex items-baseline justify-between gap-3 border-b border-border pb-2">
              <h3 className="text-[10.5px] font-bold tracking-widest text-foreground uppercase">
                {grupo.grupoNome}
              </h3>
              <div className="num shrink-0 text-xs">
                <span className={estouradoGrupo ? "text-expense" : "text-foreground/70"}>
                  {formatarMoeda(grupo.subtotalRealizado)}
                </span>
                <span className="text-foreground/30"> / {formatarMoeda(grupo.subtotalPrevisto)}</span>
              </div>
            </div>
            {grupo.categorias.length > 0 && renderLista(grupo.categorias)}
            {grupo.subgrupos.map(renderSubgrupo)}
          </Card>
        );
      })}

      <ConfirmDialog
        open={!!categoriaParaRemover}
        onClose={() => setCategoriaParaRemover(null)}
        onConfirm={() => categoriaParaRemover && removerMutation.mutate(categoriaParaRemover.categoriaId)}
        title={`Remover "${categoriaParaRemover?.categoriaNome ?? ""}" do orçamento`}
        confirmLabel="Remover"
        confirmando={removerMutation.isPending}
      >
        <p>
          Esta ação removerá a categoria do orçamento de {MESES[mes - 1]}. Os valores previstos definidos
          para este mês serão perdidos. Deseja continuar?
        </p>
      </ConfirmDialog>
    </div>
  );
}
