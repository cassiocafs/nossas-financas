import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { excluirSubgrupo, type SubgrupoCategoria } from "@/api/categorias";

interface ExcluirSubgrupoDialogProps {
  open: boolean;
  onClose: () => void;
  subgrupo: SubgrupoCategoria | null;
}

export function ExcluirSubgrupoDialog({ open, onClose, subgrupo }: ExcluirSubgrupoDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => excluirSubgrupo(subgrupo!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      onClose();
    },
  });

  if (!subgrupo) return null;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => mutation.mutate()}
      title={`Excluir subgrupo "${subgrupo.nome}"`}
      confirmLabel="Excluir"
      confirmando={mutation.isPending}
    >
      <div className="space-y-2">
        <p>Essa ação não pode ser desfeita. Deseja excluir este subgrupo?</p>
        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Erro ao excluir subgrupo"}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}
