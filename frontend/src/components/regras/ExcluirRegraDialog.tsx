import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { excluirRegra, type RegraTransacao } from "@/api/regras";

interface ExcluirRegraDialogProps {
  open: boolean;
  onClose: () => void;
  regra: RegraTransacao | null;
}

export function ExcluirRegraDialog({ open, onClose, regra }: ExcluirRegraDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => excluirRegra(regra!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regras"] });
      onClose();
    },
  });

  if (!regra) return null;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => mutation.mutate()}
      title={`Excluir regra "${regra.descricao}"`}
      confirmLabel="Excluir"
      confirmando={mutation.isPending}
    >
      <p>
        Essa ação não pode ser desfeita. Novas transações com esta descrição deixarão de
        preencher a conta e a categoria automaticamente.
      </p>
    </ConfirmDialog>
  );
}
