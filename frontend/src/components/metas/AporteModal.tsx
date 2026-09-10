import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { registrarAporte, type Meta } from "@/api/metas";

const schema = z.object({
  valor: z.number().finite().positive("Informe um valor maior que zero"),
  data: z.string().min(1, "Informe a data"),
  nota: z.string().trim().max(140),
});

type FormValues = z.infer<typeof schema>;

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface AporteModalProps {
  open: boolean;
  onClose: () => void;
  meta: Meta | null;
}

export function AporteModal({ open, onClose, meta }: AporteModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { valor: 0, data: hojeISO(), nota: "" },
  });

  useEffect(() => {
    if (open) reset({ valor: 0, data: hojeISO(), nota: "" });
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      registrarAporte(meta!.id, {
        valor: values.valor,
        data: values.data,
        nota: values.nota.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
      onClose();
    },
  });

  if (!meta) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Registrar aporte — ${meta.nome}`}>
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <p className="text-[13px] text-muted-foreground">
          O aporte registra seu progresso na meta. Não movimenta nenhuma conta.
        </p>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Valor</label>
          <Controller
            control={control}
            name="valor"
            render={({ field }) => (
              <CurrencyInput value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.valor && <p className="text-sm text-destructive">{errors.valor.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Data</label>
          <input
            type="date"
            {...register("data")}
            className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
          />
          {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">
            Nota <span className="text-muted-foreground">(opcional)</span>
          </label>
          <input
            {...register("nota")}
            maxLength={140}
            className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
          />
        </div>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao registrar"}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar aporte"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
