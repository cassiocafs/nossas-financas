import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { listarContas } from "@/api/contas";
import { criarRegra, editarRegra, type RegraTransacao } from "@/api/regras";
import { CategoriaAutocomplete } from "@/components/transacoes/CategoriaAutocomplete";
import { ContaAutocomplete } from "@/components/transacoes/ContaAutocomplete";

const schema = z.object({
  descricao: z.string().trim().min(1, "Descrição é obrigatória"),
  contaId: z.string().min(1, "Conta é obrigatória"),
  categoriaId: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface RegraFormModalProps {
  open: boolean;
  onClose: () => void;
  regra?: RegraTransacao | null;
}

export function RegraFormModal({ open, onClose, regra }: RegraFormModalProps) {
  const queryClient = useQueryClient();
  const editando = !!regra;

  const { data: contas = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: () => listarContas(false),
    enabled: open,
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { descricao: "", contaId: "", categoriaId: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        regra
          ? { descricao: regra.descricao, contaId: regra.contaId, categoriaId: regra.categoriaId ?? "" }
          : { descricao: "", contaId: "", categoriaId: "" },
      );
    }
  }, [open, regra, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const input = {
        descricao: values.descricao,
        contaId: values.contaId,
        categoriaId: values.categoriaId || null,
      };
      return editando ? editarRegra(regra!.id, input) : criarRegra(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regras"] });
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title={editando ? "Editar regra" : "Nova regra"}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Descrição</label>
          <input
            {...register("descricao")}
            placeholder="Ex.: Uber"
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Quando a descrição de uma transação for igual a esta, a conta e a categoria serão
            preenchidas automaticamente.
          </p>
          {errors.descricao && (
            <p className="text-sm text-destructive">{errors.descricao.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Conta</label>
          <Controller
            control={control}
            name="contaId"
            render={({ field }) => (
              <ContaAutocomplete value={field.value} onChange={field.onChange} contas={contas} />
            )}
          />
          {errors.contaId && <p className="text-sm text-destructive">{errors.contaId.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Categoria</label>
          <Controller
            control={control}
            name="categoriaId"
            render={({ field }) => (
              <CategoriaAutocomplete value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

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
