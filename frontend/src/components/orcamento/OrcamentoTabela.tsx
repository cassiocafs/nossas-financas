import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, TriangleAlert, LoaderCircle } from "lucide-react";
import type { CategoriaGrade, GrupoGrade, SubgrupoGrade } from "@/api/orcamento";
import { removerCategoriaDoOrcamento } from "@/api/orcamento";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
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

  const corValor = estourado ? "text-money-alert" : "text-foreground";

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
              className="absolute inset-y-0 rounded-r-full bg-money-alert/70 transition-[width] duration-300 ease-out"
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
            <TriangleAlert className="h-3.5 w-3.5 text-money-alert" />
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
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
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
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onRemover}
              disabled={bloqueado}
              aria-label={`Remover ${categoriaNome} do orçamento`}
              className="rounded p-0.5 text-foreground/35 hover:!text-destructive disabled:cursor-not-allowed disabled:hover:!text-foreground/35"
            >
              <Trash2 className="h-3.5 w-3.5" />
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
      <EmptyState mood="standing" title="Nenhuma categoria no orçamento">
        Ainda não há previsto para {MESES[mes - 1]}. Clique em "Adicionar categoria" para
        definir quanto pretende gastar.
      </EmptyState>
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
                <span className={estouradoGrupo ? "text-money-alert" : "text-foreground/70"}>
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
