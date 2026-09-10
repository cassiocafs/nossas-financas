import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { IconButton } from "@/components/ui/IconButton";
import { useFormatarValor } from "@/hooks/use-formatar-valor";
import { formatarData } from "@/lib/format";
import { buscarMeta, removerAporte } from "@/api/metas";
import { noteDaMeta, toneDaMeta, formatarMesAno } from "@/lib/metas";

interface MetaDetailModalProps {
  metaId: string | null;
  onClose: () => void;
  onAportar: () => void;
  onEditar: () => void;
}

export function MetaDetailModal({ metaId, onClose, onAportar, onEditar }: MetaDetailModalProps) {
  const formatarValor = useFormatarValor();
  const queryClient = useQueryClient();

  const { data: meta, isLoading } = useQuery({
    queryKey: ["metas", metaId],
    queryFn: () => buscarMeta(metaId!),
    enabled: !!metaId,
  });

  const remover = useMutation({
    mutationFn: (aporteId: string) => removerAporte(metaId!, aporteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas"] });
    },
  });

  return (
    <Modal open={!!metaId} onClose={onClose} title={meta ? meta.nome : "Meta"}>
      {isLoading || !meta ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="num font-semibold text-foreground">
                {formatarValor(meta.valorAtual)} de {formatarValor(meta.valorAlvo)}
              </span>
              <span className="font-bold text-muted-foreground">
                {meta.progresso.toFixed(0)}%
              </span>
            </div>
            <ProgressBar progresso={meta.progresso} tone={toneDaMeta(meta.estado)} />
            <p className="text-[13px] text-muted-foreground">
              {noteDaMeta(meta, formatarValor)}
            </p>
            {meta.dataAlvo && (
              <p className="text-[12px] text-muted-foreground">
                Prazo: {formatarMesAno(meta.dataAlvo)}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={onAportar}>
              Registrar aporte
            </Button>
            <Button size="sm" variant="ghost" onClick={onEditar}>
              Editar
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Histórico de aportes</h3>
            {meta.aportes.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Nenhum aporte registrado ainda.</p>
            ) : (
              <ul className="divide-y divide-border rounded-[11px] border border-border">
                {meta.aportes.map((aporte) => (
                  <li
                    key={aporte.id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-[13px]"
                  >
                    <div className="min-w-0">
                      <span className="num font-medium text-foreground">
                        {formatarValor(aporte.valor)}
                      </span>
                      <span className="text-muted-foreground">
                        {" · "}
                        {formatarData(aporte.data)}
                      </span>
                      {aporte.nota && (
                        <p className="truncate text-[12px] text-muted-foreground">{aporte.nota}</p>
                      )}
                    </div>
                    <IconButton
                      icon={<Trash2 className="size-4" />}
                      label="Remover aporte"
                      size="sm"
                      disabled={remover.isPending}
                      onClick={() => remover.mutate(aporte.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
