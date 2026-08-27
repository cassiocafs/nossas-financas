import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatarMoeda } from "@/lib/format";

interface GoalCardProps {
  name: string;
  icon: ReactNode;
  current: number;
  target: number;
  note: string;
}

export function GoalCard({ name, icon, current, target, note }: GoalCardProps) {
  const progresso = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  return (
    <Card className="space-y-2.5 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
            {icon}
          </span>
          <span className="truncate text-[12.5px] font-semibold text-foreground">{name}</span>
        </span>
        <span className="shrink-0 text-[11.5px] font-bold text-muted-foreground">
          {progresso.toFixed(0)}%
        </span>
      </div>
      <ProgressBar progresso={progresso} />
      <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
        <span className="num">
          {formatarMoeda(current)} de {formatarMoeda(target)}
        </span>
      </div>
      <p className="text-[11.5px] text-muted-foreground">{note}</p>
    </Card>
  );
}
