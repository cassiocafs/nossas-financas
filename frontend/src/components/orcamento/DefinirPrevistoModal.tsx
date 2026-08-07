import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CategoriaAutocomplete } from "@/components/transacoes/CategoriaAutocomplete";
import { definirPrevisto } from "@/api/orcamento";

const MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

interface DefinirPrevistoModalProps {
  open: boolean;
  onClose: () => void;
  orcamentoId: string;
  categoriaIdInicial?: string | null;
}

export function DefinirPrevistoModal({
  open,
  onClose,
  orcamentoId,
  categoriaIdInicial,
}: DefinirPrevistoModalProps) {
  const queryClient = useQueryClient();
  const [categoriaId, setCategoriaId] = useState(categoriaIdInicial ?? "");
  const [modo, setModo] = useState<"mesmoValorTodosMeses" | "porMes">("mesmoValorTodosMeses");
  const [valorUnico, setValorUnico] = useState(0);
  const [valoresPorMes, setValoresPorMes] = useState<number[]>(new Array(12).fill(0));

  useEffect(() => {
    if (open) {
      setCategoriaId(categoriaIdInicial ?? "");
      setModo("mesmoValorTodosMeses");
      setValorUnico(0);
      setValoresPorMes(new Array(12).fill(0));
    }
  }, [open, categoriaIdInicial]);

  const mutation = useMutation({
    mutationFn: async () => {
      await definirPrevisto(
        orcamentoId,
        modo === "mesmoValorTodosMeses"
          ? { categoriaId, modo, valor: valorUnico }
          : { categoriaId, modo, valoresPorMes },
      );
      await queryClient.invalidateQueries({ queryKey: ["orcamento", orcamentoId, "itens"] });
    },
    onSuccess: () => {
      onClose();
    },
  });

  return (
    <Modal open={open} onClose={onClose} title="Definir valor previsto" closable={!mutation.isPending}>
      <fieldset disabled={mutation.isPending} className="space-y-4">
        {!categoriaIdInicial && (
          <div>
            <label className="block text-sm font-medium text-ink/80 dark:text-paper/80">
              Categoria
            </label>
            <CategoriaAutocomplete value={categoriaId} onChange={setCategoriaId} />
          </div>
        )}

        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={modo === "mesmoValorTodosMeses"}
              onChange={() => setModo("mesmoValorTodosMeses")}
              className="accent-ink dark:accent-paper"
            />
            Aplicar o mesmo valor a todos os meses
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={modo === "porMes"}
              onChange={() => setModo("porMes")}
              className="accent-ink dark:accent-paper"
            />
            Definir um valor específico por mês
          </label>
        </div>

        {modo === "mesmoValorTodosMeses" ? (
          <CurrencyInput value={valorUnico} onChange={setValorUnico} />
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {MESES_ABREV.map((label, i) => (
              <div key={label}>
                <label className="block text-xs text-ink/50 dark:text-paper/50">{label}</label>
                <CurrencyInput
                  value={valoresPorMes[i]}
                  onChange={(v) =>
                    setValoresPorMes((prev) => prev.map((p, idx) => (idx === i ? v : p)))
                  }
                />
              </div>
            ))}
          </div>
        )}

        {mutation.isError && (
          <p className="text-sm text-vermelho dark:text-vermelho-night">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao salvar"}
          </p>
        )}

        {mutation.isPending && <ProgressBar label="Salvando..." />}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button disabled={!categoriaId || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </fieldset>
    </Modal>
  );
}
