import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ApiError } from "@/api/client";
import { excluirMeta, type Meta } from "@/api/metas";

interface ExcluirMetaDialogProps {
  open: boolean;
  onClose: () => void;
  meta: Meta | null;
  onDeleted?: () => void;
}

export function ExcluirMetaDialog({ open, onClose, meta, onDeleted }: ExcluirMetaDialogProps) {
  const queryClient = useQueryClient();
  const [precisaConfirmar, setPrecisaConfirmar] = useState(false);

  useEffect(() => {
    if (open) setPrecisaConfirmar(false);
  }, [open, meta]);

  const mutation = useMutation({
    mutationFn: () => excluirMeta(meta!.id, precisaConfirmar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      onDeleted?.();
      onClose();
    },
    onError: (erro) => {
      if (erro instanceof ApiError && erro.status === 409) {
        setPrecisaConfirmar(true);
      }
    },
  });

  if (!meta) return null;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => mutation.mutate()}
      title={`Excluir meta "${meta.nome}"`}
      confirmLabel={precisaConfirmar ? "Excluir mesmo assim" : "Excluir"}
      confirmando={mutation.isPending}
    >
      {precisaConfirmar ? (
        <p>
          Esta meta tem aportes registrados. Excluir vai apagar a meta e todo o
          histórico de aportes. Essa ação não pode ser desfeita.
        </p>
      ) : (
        <p>Essa ação não pode ser desfeita. Deseja excluir esta meta?</p>
      )}
    </ConfirmDialog>
  );
}
