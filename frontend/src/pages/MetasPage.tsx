import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { editarMeta, listarMetas, type Meta } from "@/api/metas";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { MetaCard } from "@/components/metas/MetaCard";
import { MetaFormModal } from "@/components/metas/MetaFormModal";
import { AporteModal } from "@/components/metas/AporteModal";
import { ExcluirMetaDialog } from "@/components/metas/ExcluirMetaDialog";
import { MetaDetailModal } from "@/components/metas/MetaDetailModal";

export function MetasPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [incluirArquivadas, setIncluirArquivadas] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [metaEditando, setMetaEditando] = useState<Meta | null>(null);
  const [metaAportando, setMetaAportando] = useState<Meta | null>(null);
  const [metaExcluindo, setMetaExcluindo] = useState<Meta | null>(null);
  const [metaDetalheId, setMetaDetalheId] = useState<string | null>(null);

  const { data: metas = [], isLoading } = useQuery({
    queryKey: ["metas", incluirArquivadas],
    queryFn: () => listarMetas(incluirArquivadas),
  });

  const arquivar = useMutation({
    mutationFn: (meta: Meta) => editarMeta(meta.id, { arquivada: !meta.arquivada }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["metas"] }),
  });

  useEffect(() => {
    if (searchParams.get("nova") === "1") {
      setMetaEditando(null);
      setFormOpen(true);
      searchParams.delete("nova");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function abrirCriacao() {
    setMetaEditando(null);
    setFormOpen(true);
  }

  function abrirEdicao(meta: Meta) {
    setMetaEditando(meta);
    setFormOpen(true);
  }

  const metaDetalhe = metas.find((m) => m.id === metaDetalheId) ?? null;

  return (
    <div className="space-y-4 pt-4 sm:pt-6 lg:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Metas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Objetivos de economia e o progresso de cada um.
          </p>
        </div>
        <Button onClick={abrirCriacao}>Nova meta</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : metas.length === 0 && !incluirArquivadas ? (
        <EmptyState
          mood="welcome"
          title="Nenhuma meta ainda"
          action={<Button onClick={abrirCriacao}>Criar primeira meta</Button>}
        >
          Crie sua primeira meta e comece a poupar com objetivo.
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {metas.map((meta) => (
              <MetaCard
                key={meta.id}
                meta={meta}
                onAbrir={() => setMetaDetalheId(meta.id)}
                onEditar={() => abrirEdicao(meta)}
                onAportar={() => setMetaAportando(meta)}
                onArquivar={() => arquivar.mutate(meta)}
                onExcluir={() => setMetaExcluindo(meta)}
              />
            ))}
          </div>
          {metas.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma meta arquivada.</p>
          )}
        </>
      )}

      <button
        type="button"
        onClick={() => setIncluirArquivadas((v) => !v)}
        className="text-sm font-medium text-muted-foreground underline"
      >
        {incluirArquivadas ? "Ocultar" : "Mostrar"} metas arquivadas
      </button>

      <MetaFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        meta={metaEditando}
      />
      <AporteModal
        open={!!metaAportando}
        onClose={() => setMetaAportando(null)}
        meta={metaAportando}
      />
      <ExcluirMetaDialog
        open={!!metaExcluindo}
        onClose={() => setMetaExcluindo(null)}
        meta={metaExcluindo}
        onDeleted={() => {
          if (metaExcluindo && metaDetalheId === metaExcluindo.id) setMetaDetalheId(null);
        }}
      />
      <MetaDetailModal
        metaId={metaDetalheId}
        onClose={() => setMetaDetalheId(null)}
        onAportar={() => {
          if (metaDetalhe) setMetaAportando(metaDetalhe);
        }}
        onEditar={() => {
          if (metaDetalhe) abrirEdicao(metaDetalhe);
        }}
      />
    </div>
  );
}
