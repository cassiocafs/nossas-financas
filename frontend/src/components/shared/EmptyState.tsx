import type { ReactNode } from "react";

import mascotHappy from "@/assets/mascot/happy.png";
import mascotEncouraging from "@/assets/mascot/encouraging.png";
import mascotThinking from "@/assets/mascot/thinking.png";
import mascotWelcome from "@/assets/mascot/welcome.png";
import mascotStanding from "@/assets/mascot/standing.png";

const MASCOT = {
  happy: mascotHappy,
  encouraging: mascotEncouraging,
  thinking: mascotThinking,
  welcome: mascotWelcome,
  standing: mascotStanding,
} as const;

type Mood = keyof typeof MASCOT;

interface EmptyStateProps {
  mood?: Mood;
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
      <img src={MASCOT[mood]} alt="" className="h-20 w-auto" aria-hidden="true" />
      <p className="font-display text-sm font-bold text-foreground">{title}</p>
      {children && (
        <p className="max-w-xs text-sm text-muted-foreground">{children}</p>
      )}
      {action}
    </div>
  );
}
