import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  buscarImpactoExclusaoCategoria,
  excluirCategoria,
  listarGrupos,
  type Categoria,
  type ExcluirCategoriaInput,
} from "@/api/categorias";

interface ExcluirCategoriaDialogProps {
  open: boolean;
  onClose: () => void;
  categoria: Categoria | null;
  onExcluida?: () => void;
}

export function ExcluirCategoriaDialog({
  open,
  onClose,
  categoria,
  onExcluida,
}: ExcluirCategoriaDialogProps) {
  const queryClient = useQueryClient();
  const [estrategia, setEstrategia] = useState<"semCategoria" | "realocarPara">("semCategoria");
  const [categoriaDestinoId, setCategoriaDestinoId] = useState("");

  const impactoQuery = useQuery({
    queryKey: ["categorias", categoria?.id, "impacto-exclusao"],
    queryFn: () => buscarImpactoExclusaoCategoria(categoria!.id),
    enabled: open && !!categoria,
  });

  const gruposQuery = useQuery({
    queryKey: ["categorias", "grupos"],
    queryFn: listarGrupos,
    enabled: open && !!categoria,
  });

  useEffect(() => {
    if (open) {
      setEstrategia("semCategoria");
      setCategoriaDestinoId("");
    }
  }, [open, categoria]);

  const mutation = useMutation({
    mutationFn: () => {
      const temVinculo = (impactoQuery.data?.transacoesVinculadas ?? 0) > 0;
      const input: ExcluirCategoriaInput | undefined = temVinculo
        ? {
            estrategia,
            categoriaDestinoId: estrategia === "realocarPara" ? categoriaDestinoId : undefined,
          }
        : undefined;
      return excluirCategoria(categoria!.id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      onClose();
      onExcluida?.();
    },
  });

  if (!categoria) return null;

  const transacoesVinculadas = impactoQuery.data?.transacoesVinculadas ?? 0;
  const todasCategorias = [
    ...(gruposQuery.data?.grupos.flatMap((g) => [
      ...g.categorias,
      ...g.subgrupos.flatMap((s) => s.categorias),
    ]) ?? []),
    ...(gruposQuery.data?.semGrupo ?? []),
  ].filter((c) => c.id !== categoria.id);
  const podeConfirmar =
    transacoesVinculadas === 0 || estrategia === "semCategoria" || !!categoriaDestinoId;

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => mutation.mutate()}
      title={`Excluir categoria "${categoria.nome}"`}
      confirmLabel="Excluir"
      confirmando={mutation.isPending || !podeConfirmar}
    >
      {impactoQuery.isLoading ? (
        <p>Verificando transações vinculadas...</p>
      ) : transacoesVinculadas > 0 ? (
        <div className="space-y-3">
          <p>
            Esta categoria possui <strong>{transacoesVinculadas}</strong> transação(ões)
            vinculada(s). O que deseja fazer?
          </p>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={estrategia === "semCategoria"}
              onChange={() => setEstrategia("semCategoria")}
            />
            Deixar as transações sem categoria
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={estrategia === "realocarPara"}
              onChange={() => setEstrategia("realocarPara")}
            />
            Reclassificar para outra categoria
          </label>
          {estrategia === "realocarPara" && (
            <select
              value={categoriaDestinoId}
              onChange={(e) => setCategoriaDestinoId(e.target.value)}
              className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
            >
              <option value="">Selecione a categoria de destino</option>
              {todasCategorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <p>Essa ação não pode ser desfeita. Deseja excluir esta categoria?</p>
      )}
    </ConfirmDialog>
  );
}
