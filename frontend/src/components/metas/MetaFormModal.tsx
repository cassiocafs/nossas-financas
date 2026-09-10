import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { criarMeta, editarMeta, type Meta } from "@/api/metas";
import { isoParaMesInput, mesInputParaIso } from "@/lib/metas";

const schema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(80),
  emoji: z.string().trim().max(8),
  valorAlvo: z.number().finite().positive("Informe um valor-alvo maior que zero"),
  dataAlvo: z.string(),
});

type FormValues = z.infer<typeof schema>;

const VAZIO: FormValues = { nome: "", emoji: "", valorAlvo: 0, dataAlvo: "" };

interface MetaFormModalProps {
  open: boolean;
  onClose: () => void;
  meta?: Meta | null;
  onSaved?: (meta: Meta) => void;
}

export function MetaFormModal({ open, onClose, meta, onSaved }: MetaFormModalProps) {
  const queryClient = useQueryClient();
  const editando = !!meta;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: VAZIO,
  });

  useEffect(() => {
    if (open) {
      reset(
        meta
          ? {
              nome: meta.nome,
              emoji: meta.emoji ?? "",
              valorAlvo: meta.valorAlvo,
              dataAlvo: isoParaMesInput(meta.dataAlvo),
            }
          : VAZIO,
      );
    }
  }, [open, meta, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        nome: values.nome,
        emoji: values.emoji.trim() || undefined,
        valorAlvo: values.valorAlvo,
        dataAlvo: mesInputParaIso(values.dataAlvo),
      };
      return editando
        ? editarMeta(meta!.id, { ...payload, arquivada: meta!.arquivada })
        : criarMeta(payload);
    },
    onSuccess: (metaSalva) => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      onSaved?.(metaSalva);
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title={editando ? "Editar meta" : "Nova meta"}>
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <div className="flex gap-3">
          <div className="w-16 space-y-1">
            <label className="block text-sm font-medium text-foreground/80">Ícone</label>
            <input
              {...register("emoji")}
              placeholder="🎯"
              maxLength={8}
              className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-center text-[15px] text-foreground"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="block text-sm font-medium text-foreground/80">Nome</label>
            <input
              {...register("nome")}
              className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
            />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Valor-alvo</label>
          <Controller
            control={control}
            name="valorAlvo"
            render={({ field }) => (
              <CurrencyInput value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.valorAlvo && (
            <p className="text-sm text-destructive">{errors.valorAlvo.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">
            Prazo <span className="text-muted-foreground">(opcional)</span>
          </label>
          <input
            type="month"
            {...register("dataAlvo")}
            className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
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
