import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { criarConta, editarConta, type Conta } from "@/api/contas";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  saldoInicial: z.number().finite(),
  ativa: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface ContaFormModalProps {
  open: boolean;
  onClose: () => void;
  conta?: Conta | null;
  onSaved?: () => void;
}

export function ContaFormModal({ open, onClose, conta, onSaved }: ContaFormModalProps) {
  const queryClient = useQueryClient();
  const editando = !!conta;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", saldoInicial: 0, ativa: true },
  });

  useEffect(() => {
    if (open) {
      reset(
        conta
          ? { nome: conta.nome, saldoInicial: conta.saldoInicial, ativa: conta.ativa }
          : { nome: "", saldoInicial: 0, ativa: true },
      );
    }
  }, [open, conta, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      editando ? editarConta(conta!.id, values) : criarConta(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      onSaved?.();
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title={editando ? "Editar conta" : "Nova conta"}>
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Nome</label>
          <input
            {...register("nome")}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Saldo inicial</label>
          <Controller
            control={control}
            name="saldoInicial"
            render={({ field }) => (
              <CurrencyInput value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground/80">
          <input type="checkbox" {...register("ativa")} className="accent-primary" />
          Conta ativa
        </label>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao salvar"}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
