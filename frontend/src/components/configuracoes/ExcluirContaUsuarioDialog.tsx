import { useMutation } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { excluirContaUsuario } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";

interface ExcluirContaUsuarioDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExcluirContaUsuarioDialog({ open, onClose }: ExcluirContaUsuarioDialogProps) {
  const { signOut } = useAuth();

  const mutation = useMutation({
    mutationFn: excluirContaUsuario,
    onSuccess: async () => {
      await signOut();
    },
  });

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => mutation.mutate()}
      title="Excluir sua conta"
      confirmLabel="Excluir minha conta"
      confirmando={mutation.isPending}
    >
      <div className="space-y-2">
        <p>
          <strong>Essa ação não pode ser desfeita.</strong> Suas contas, transações,
          categorias, orçamentos e regras serão excluídos permanentemente e você perderá o
          acesso a esta conta — inclusive para entrar novamente com este e-mail ou com o
          Google.
        </p>
        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao excluir conta"}
          </p>
        )}
      </div>
    </ConfirmDialog>
  );
}
