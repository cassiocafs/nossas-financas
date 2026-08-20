import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { editarGrupo, type GrupoCategoria } from "@/api/categorias";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
});

type FormValues = z.infer<typeof schema>;

interface GrupoFormModalProps {
  open: boolean;
  onClose: () => void;
  grupo: GrupoCategoria | null;
  onSaved?: () => void;
}

export function GrupoFormModal({ open, onClose, grupo, onSaved }: GrupoFormModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ nome: grupo?.nome ?? "" });
    }
  }, [open, grupo, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => editarGrupo(grupo!.id, { nome: values.nome.trim() }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["categorias"] });
      onSaved?.();
      onClose();
    },
  });

  if (!grupo) return null;

  return (
    <Modal open={open} onClose={onClose} title="Editar grupo" closable={!mutation.isPending}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Nome</label>
          <input
            {...register("nome")}
            className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
          />
          {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao salvar"}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
