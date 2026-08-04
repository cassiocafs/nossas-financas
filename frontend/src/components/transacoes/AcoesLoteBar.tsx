import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  categorizarLote,
  consolidarLote,
  excluirTransacoesLote,
} from "@/api/transacoes";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CategoriaAutocomplete } from "./CategoriaAutocomplete";

interface AcoesLoteBarProps {
  selectedIds: string[];
  onDone: () => void;
  onExcluida: (quantidade: number) => void;
  onExcluindoChange: (excluindo: boolean) => void;
}

export function AcoesLoteBar({
  selectedIds,
  onDone,
  onExcluida,
  onExcluindoChange,
}: AcoesLoteBarProps) {
  const queryClient = useQueryClient();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [categoriaEmLote, setCategoriaEmLote] = useState<string | null>(null);

  function invalidarEFinalizar() {
    queryClient.invalidateQueries({ queryKey: ["transacoes"] });
    onDone();
  }

  const excluirMutation = useMutation({
    mutationFn: () => excluirTransacoesLote(selectedIds),
    onSuccess: () => {
      const quantidade = selectedIds.length;
      invalidarEFinalizar();
      setConfirmandoExclusao(false);
      onExcluida(quantidade);
    },
  });

  const consolidarMutation = useMutation({
    mutationFn: (consolidado: boolean) => consolidarLote(selectedIds, consolidado),
    onSuccess: invalidarEFinalizar,
  });

  const categorizarMutation = useMutation({
    mutationFn: () => categorizarLote(selectedIds, categoriaEmLote),
    onSuccess: invalidarEFinalizar,
  });

  const excluindo = excluirMutation.isPending;

  useEffect(() => {
    onExcluindoChange(excluindo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excluindo]);

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm dark:border-line-night dark:bg-surface-night">
      {excluindo ? (
        <span className="flex items-center gap-2 font-medium text-ink dark:text-paper">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 animate-spin text-ink/60 dark:text-paper/60"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.25"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          Excluindo {selectedIds.length} transação(ões)...
        </span>
      ) : (
        <span className="font-medium text-ink dark:text-paper">
          {selectedIds.length} selecionada(s)
        </span>
      )}
      <button
        type="button"
        disabled={excluindo}
        onClick={() => consolidarMutation.mutate(true)}
        className="rounded-md border border-line px-3 py-1 text-ink/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-line-night dark:text-paper/80"
      >
        Consolidar
      </button>
      <button
        type="button"
        disabled={excluindo}
        onClick={() => consolidarMutation.mutate(false)}
        className="rounded-md border border-line px-3 py-1 text-ink/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-line-night dark:text-paper/80"
      >
        Desmarcar consolidação
      </button>
      <div className="flex items-center gap-2">
        <div className="w-48">
          <CategoriaAutocomplete
            value={categoriaEmLote ?? ""}
            onChange={(v) => setCategoriaEmLote(v || null)}
            disabled={excluindo}
          />
        </div>
        <button
          type="button"
          disabled={categorizarMutation.isPending || excluindo}
          onClick={() => categorizarMutation.mutate()}
          className="rounded-md border border-line px-3 py-1 text-ink/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-line-night dark:text-paper/80"
        >
          Alterar categoria
        </button>
      </div>
      <button
        type="button"
        disabled={excluindo}
        onClick={() => setConfirmandoExclusao(true)}
        className="rounded-md border border-vermelho/40 px-3 py-1 text-vermelho hover:bg-vermelho/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-vermelho-night/40 dark:text-vermelho-night"
      >
        Excluir
      </button>

      <ConfirmDialog
        open={confirmandoExclusao}
        onClose={() => setConfirmandoExclusao(false)}
        onConfirm={() => excluirMutation.mutate()}
        title="Excluir transações"
        confirmLabel="Excluir"
        confirmando={excluindo}
      >
        Tem certeza que deseja excluir {selectedIds.length} transação(ões)? Essa ação é
        permanente.
      </ConfirmDialog>
    </div>
  );
}
