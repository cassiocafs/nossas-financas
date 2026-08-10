import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { excluirOrcamento, listarAnosOrcamento } from "@/api/orcamento";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { NovoOrcamentoModal } from "@/components/orcamento/NovoOrcamentoModal";

interface AnoSelectorProps {
  orcamentoId: string | null;
  onSelecionar: (id: string) => void;
}

export function AnoSelector({ orcamentoId, onSelecionar }: AnoSelectorProps) {
  const queryClient = useQueryClient();
  const [criandoAno, setCriandoAno] = useState(false);
  const [novoAno, setNovoAno] = useState(new Date().getFullYear());
  const [modalNovoOrcamentoAberto, setModalNovoOrcamentoAberto] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const { data: anos = [] } = useQuery({
    queryKey: ["orcamento", "anos"],
    queryFn: listarAnosOrcamento,
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
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
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
            className="w-24 rounded-md border border-input bg-background px-2 py-2 text-sm text-foreground"
          />
          <Button onClick={() => setModalNovoOrcamentoAberto(true)}>Continuar</Button>
          <button
            type="button"
            onClick={() => setCriandoAno(false)}
            className="text-sm text-muted-foreground underline"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCriandoAno(true)}
          className="rounded-md border border-input px-3 py-2 text-sm text-foreground/80"
        >
          Novo orçamento
        </button>
      )}

      {orcamentoId && (
        <button
          type="button"
          onClick={() => setConfirmandoExclusao(true)}
          className="text-sm text-destructive underline"
        >
          Excluir orçamento
        </button>
      )}

      <NovoOrcamentoModal
        open={modalNovoOrcamentoAberto}
        ano={novoAno}
        onClose={() => setModalNovoOrcamentoAberto(false)}
        onCriado={(id) => {
          queryClient.invalidateQueries({ queryKey: ["orcamento", "anos"] });
          onSelecionar(id);
          setModalNovoOrcamentoAberto(false);
          setCriandoAno(false);
        }}
      />

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
