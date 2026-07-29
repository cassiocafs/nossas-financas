import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { criarOrcamento, excluirOrcamento, listarAnosOrcamento } from "@/api/orcamento";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

interface AnoSelectorProps {
  orcamentoId: string | null;
  onSelecionar: (id: string) => void;
}

export function AnoSelector({ orcamentoId, onSelecionar }: AnoSelectorProps) {
  const queryClient = useQueryClient();
  const [criandoAno, setCriandoAno] = useState(false);
  const [novoAno, setNovoAno] = useState(new Date().getFullYear());
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const { data: anos = [] } = useQuery({
    queryKey: ["orcamento", "anos"],
    queryFn: listarAnosOrcamento,
  });

  const criarMutation = useMutation({
    mutationFn: () => criarOrcamento(novoAno),
    onSuccess: (orcamento) => {
      queryClient.invalidateQueries({ queryKey: ["orcamento", "anos"] });
      onSelecionar(orcamento.id);
      setCriandoAno(false);
    },
  });

  const excluirMutation = useMutation({
    mutationFn: () => excluirOrcamento(orcamentoId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamento", "anos"] });
      setConfirmandoExclusao(false);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <select
        value={orcamentoId ?? ""}
        onChange={(e) => onSelecionar(e.target.value)}
        className="rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
      >
        <option value="" disabled>
          Selecione um ano
        </option>
        {anos.map((a) => (
          <option key={a.id} value={a.id}>
            {a.ano}
          </option>
        ))}
      </select>

      {criandoAno ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={novoAno}
            onChange={(e) => setNovoAno(Number(e.target.value))}
            className="w-24 rounded-md border border-line bg-transparent px-2 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
          />
          <Button onClick={() => criarMutation.mutate()} disabled={criarMutation.isPending}>
            Criar
          </Button>
          <button
            type="button"
            onClick={() => setCriandoAno(false)}
            className="text-sm text-ink/60 underline dark:text-paper/60"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCriandoAno(true)}
          className="rounded-md border border-line px-3 py-2 text-sm text-ink/80 dark:border-line-night dark:text-paper/80"
        >
          Novo orçamento
        </button>
      )}

      {orcamentoId && (
        <button
          type="button"
          onClick={() => setConfirmandoExclusao(true)}
          className="text-sm text-vermelho underline dark:text-vermelho-night"
        >
          Excluir orçamento
        </button>
      )}

      {criarMutation.isError && (
        <p className="text-sm text-vermelho dark:text-vermelho-night">
          {criarMutation.error instanceof Error ? criarMutation.error.message : "Erro"}
        </p>
      )}

      <ConfirmDialog
        open={confirmandoExclusao}
        onClose={() => setConfirmandoExclusao(false)}
        onConfirm={() => excluirMutation.mutate()}
        title="Excluir orçamento"
        confirmLabel="Excluir"
        confirmando={excluirMutation.isPending}
      >
        Essa ação remove permanentemente todas as metas previstas deste ano, sem afetar as
        transações já lançadas. Deseja continuar?
      </ConfirmDialog>
    </div>
  );
}
