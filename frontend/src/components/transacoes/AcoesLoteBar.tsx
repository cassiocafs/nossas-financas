import { useState } from "react";
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
}

export function AcoesLoteBar({ selectedIds, onDone }: AcoesLoteBarProps) {
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
      invalidarEFinalizar();
      setConfirmandoExclusao(false);
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

  if (selectedIds.length === 0) return null;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border border-line bg-surface px-4 py-3 text-sm dark:border-line-night dark:bg-surface-night">
      <span className="font-medium text-ink dark:text-paper">
        {selectedIds.length} selecionada(s)
      </span>
      <button
        type="button"
        onClick={() => consolidarMutation.mutate(true)}
        className="rounded-md border border-line px-3 py-1 text-ink/80 dark:border-line-night dark:text-paper/80"
      >
        Consolidar
      </button>
      <button
        type="button"
        onClick={() => consolidarMutation.mutate(false)}
        className="rounded-md border border-line px-3 py-1 text-ink/80 dark:border-line-night dark:text-paper/80"
      >
        Desmarcar consolidação
      </button>
      <div className="flex items-center gap-2">
        <div className="w-48">
          <CategoriaAutocomplete
            value={categoriaEmLote ?? ""}
            onChange={(v) => setCategoriaEmLote(v || null)}
          />
        </div>
        <button
          type="button"
          disabled={categorizarMutation.isPending}
          onClick={() => categorizarMutation.mutate()}
          className="rounded-md border border-line px-3 py-1 text-ink/80 dark:border-line-night dark:text-paper/80"
        >
          Alterar categoria
        </button>
      </div>
      <button
        type="button"
        onClick={() => setConfirmandoExclusao(true)}
        className="rounded-md border border-vermelho/40 px-3 py-1 text-vermelho hover:bg-vermelho/10 dark:border-vermelho-night/40 dark:text-vermelho-night"
      >
        Excluir
      </button>

      <ConfirmDialog
        open={confirmandoExclusao}
        onClose={() => setConfirmandoExclusao(false)}
        onConfirm={() => excluirMutation.mutate()}
        title="Excluir transações"
        confirmLabel="Excluir"
        confirmando={excluirMutation.isPending}
      >
        Tem certeza que deseja excluir {selectedIds.length} transação(ões)? Essa ação é
        permanente.
      </ConfirmDialog>
    </div>
  );
}
