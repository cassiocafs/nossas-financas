import type { ReactNode } from "react";
import { Mascot, type MascotState } from "@/components/ui/Mascot";

interface EmptyStateProps {
  mood?: MascotState;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Estado vazio com o mascote do Poupeu — use só para "nada aqui ainda", nunca como decoração. */
export function EmptyState({
  mood = "thinking",
  title,
  children,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 py-10 text-center ${className}`}
    >
      <Mascot state={mood} size={80} />
      <p className="font-display text-sm font-bold text-foreground">{title}</p>
      {children && (
        <p className="max-w-xs text-sm text-muted-foreground">{children}</p>
      )}
      {action}
    </div>
  );
}
