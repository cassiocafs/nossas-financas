import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { GoalCard } from "@/components/ui/GoalCard";
import { IconButton } from "@/components/ui/IconButton";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { useFormatarValor } from "@/hooks/use-formatar-valor";
import type { Meta } from "@/api/metas";
import { noteDaMeta, toneDaMeta } from "@/lib/metas";

interface MetaCardProps {
  meta: Meta;
  onAbrir?: () => void;
  onEditar?: () => void;
  onAportar?: () => void;
  onArquivar?: () => void;
  onExcluir?: () => void;
}

export function MetaCard({
  meta,
  onAbrir,
  onEditar,
  onAportar,
  onArquivar,
  onExcluir,
}: MetaCardProps) {
  const formatarValor = useFormatarValor();
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  const temAcoes = onEditar || onAportar || onArquivar || onExcluir;

  const itens = [
    onAportar && { label: "Registrar aporte", onClick: onAportar },
    onEditar && { label: "Editar", onClick: onEditar },
    onArquivar && {
      label: meta.arquivada ? "Desarquivar" : "Arquivar",
      onClick: onArquivar,
    },
    onExcluir && { label: "Excluir", onClick: onExcluir, danger: true },
  ].filter(Boolean) as { label: string; onClick: () => void; danger?: boolean }[];

  return (
    <>
      <GoalCard
        name={meta.nome}
        emoji={meta.emoji}
        current={meta.valorAtual}
        target={meta.valorAlvo}
        note={noteDaMeta(meta, formatarValor)}
        tone={toneDaMeta(meta.estado)}
        onClick={onAbrir}
        action={
          temAcoes ? (
            <IconButton
              icon={<MoreVertical className="size-4" />}
              label="Ações da meta"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setMenuPos({ x: rect.right - 180, y: rect.bottom + 4 });
              }}
            />
          ) : undefined
        }
      />
      {menuPos && (
        <ContextMenu
          x={menuPos.x}
          y={menuPos.y}
          items={itens}
          onClose={() => setMenuPos(null)}
        />
      )}
    </>
  );
}
