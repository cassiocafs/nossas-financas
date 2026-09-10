import type { ReactNode } from "react";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useFormatarValor } from "@/hooks/use-formatar-valor";

interface GoalCardProps {
  name: string;
  /** Ícone customizado (ReactNode). Se omitido, usa `emoji` ou o ícone padrão. */
  icon?: ReactNode;
  /** Emoji livre escolhido pelo usuário. Ignorado quando `icon` é passado. */
  emoji?: string | null;
  current: number;
  target: number;
  note: string;
  /** Cor da barra de progresso. */
  tone?: "default" | "success" | "warning";
  /** Conteúdo no canto direito do cabeçalho (menu de ações). */
  action?: ReactNode;
  /** Torna o card clicável (abre o detalhe). */
  onClick?: () => void;
}

export function GoalCard({
  name,
  icon,
  emoji,
  current,
  target,
  note,
  tone = "default",
  action,
  onClick,
}: GoalCardProps) {
  const formatarValor = useFormatarValor();
  const progresso = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  const conteudoIcone = icon ?? (
    emoji ? (
      <span className="text-sm leading-none">{emoji}</span>
    ) : (
      <Target className="size-4" />
    )
  );

  return (
    <Card
      className={`space-y-2.5 p-3.5 ${onClick ? "cursor-pointer text-left transition-colors hover:border-primary/30" : ""}`}
      {...(onClick
        ? {
            role: "button",
            tabIndex: 0,
            onClick,
            onKeyDown: (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            },
          }
        : {})}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
            {conteudoIcone}
          </span>
          <span className="truncate text-[12.5px] font-semibold text-foreground">{name}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <span className="text-[11.5px] font-bold text-muted-foreground">
            {progresso.toFixed(0)}%
          </span>
          {action}
        </span>
      </div>
      <ProgressBar progresso={progresso} tone={tone} />
      <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
        <span className="num">
          {formatarValor(current)} de {formatarValor(target)}
        </span>
      </div>
      <p className="text-[11.5px] text-muted-foreground">{note}</p>
    </Card>
  );
}
