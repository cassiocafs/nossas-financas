import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  buscarImpactoExclusaoConta,
  excluirConta,
  listarContas,
  type Conta,
  type ExcluirContaInput,
} from "@/api/contas";

interface ExcluirContaDialogProps {
  open: boolean;
  onClose: () => void;
  conta: Conta | null;
}

export function ExcluirContaDialog({ open, onClose, conta }: ExcluirContaDialogProps) {
  const queryClient = useQueryClient();
  const [estrategia, setEstrategia] = useState<"excluirTransacoes" | "realocar">(
    "excluirTransacoes",
  );
  const [contaDestinoId, setContaDestinoId] = useState("");

  const impactoQuery = useQuery({
    queryKey: ["contas", conta?.id, "impacto-exclusao"],
    queryFn: () => buscarImpactoExclusaoConta(conta!.id),
    enabled: open && !!conta,
  });

  const outrasContasQuery = useQuery({
    queryKey: ["contas"],
    queryFn: () => listarContas(false),
    enabled: open && !!conta,
  });

  useEffect(() => {
    if (open) {
      setEstrategia("excluirTransacoes");
      setContaDestinoId("");
    }
  }, [open, conta]);

  const mutation = useMutation({
    mutationFn: () => {
      const temVinculo = (impactoQuery.data?.transacoesVinculadas ?? 0) > 0;
      const input: ExcluirContaInput | undefined = temVinculo
        ? { estrategia, contaDestinoId: estrategia === "realocar" ? contaDestinoId : undefined }
        : undefined;
      return excluirConta(conta!.id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      onClose();
    },
  });

  if (!conta) return null;

  const transacoesVinculadas = impactoQuery.data?.transacoesVinculadas ?? 0;
  const outrasContas = (outrasContasQuery.data ?? []).filter((c) => c.id !== conta.id);
  const podeConfirmar =
    transacoesVinculadas === 0 || estrategia === "excluirTransacoes" || !!contaDestinoId;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => mutation.mutate()}
      title={`Excluir conta "${conta.nome}"`}
      confirmLabel="Excluir"
      confirmando={mutation.isPending || !podeConfirmar}
    >
      {impactoQuery.isLoading ? (
        <p>Verificando transações vinculadas...</p>
      ) : transacoesVinculadas > 0 ? (
        <div className="space-y-3">
          <p>
            Esta conta possui <strong>{transacoesVinculadas}</strong> transação(ões)
            vinculada(s). O que deseja fazer?
          </p>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={estrategia === "excluirTransacoes"}
              onChange={() => setEstrategia("excluirTransacoes")}
            />
            Excluir as transações junto com a conta
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={estrategia === "realocar"}
              onChange={() => setEstrategia("realocar")}
            />
            Realocar as transações para outra conta
          </label>
          {estrategia === "realocar" && (
            <select
              value={contaDestinoId}
              onChange={(e) => setContaDestinoId(e.target.value)}
              className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
            >
              <option value="">Selecione a conta de destino</option>
              {outrasContas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <p>Essa ação não pode ser desfeita. Deseja excluir esta conta?</p>
      )}
    </ConfirmDialog>
  );
}
