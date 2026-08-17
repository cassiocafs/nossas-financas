import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { excluirGrupo, type GrupoCategoria } from "@/api/categorias";

interface ExcluirGrupoDialogProps {
  open: boolean;
  onClose: () => void;
  grupo: GrupoCategoria | null;
}

export function ExcluirGrupoDialog({ open, onClose, grupo }: ExcluirGrupoDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => excluirGrupo(grupo!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      onClose();
    },
  });

  if (!grupo) return null;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => mutation.mutate()}
      title={`Excluir grupo "${grupo.nome}"`}
      confirmLabel="Excluir"
      confirmando={mutation.isPending}
    >
      <div className="space-y-2">
        <p>Essa ação não pode ser desfeita. Deseja excluir este grupo?</p>
        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao excluir grupo"}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}
