import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";

type Tone = "in" | "out" | "saved";

interface StatCardProps {
  label: string;
  amount: number;
  tone: Tone;
  icon: ReactNode;
  caption: string;
}

const TONES: Record<Tone, { icon: string; caption: string }> = {
  in: { icon: "bg-income-soft text-income", caption: "bg-income-soft text-income" },
  out: {
    icon: "bg-yellow-accent/15 text-yellow-accent",
    caption: "bg-yellow-accent/15 text-yellow-accent",
  },
  saved: { icon: "bg-income-soft text-income", caption: "bg-income-soft text-income" },
};

/** `saved` com valor negativo usa o mesmo tom de alerta que `out`. */
export function StatCard({ label, amount, tone, icon, caption }: StatCardProps) {
  const efetivo: Tone = tone === "saved" && amount < 0 ? "out" : tone;
  const cores = TONES[efetivo];

  return (
    <Card className="flex flex-col items-start gap-2 p-5">
      <div className="flex items-center gap-2.5">
        <span className={`grid size-8 place-items-center rounded-[10px] ${cores.icon}`}>
          {icon}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="num text-[26px] font-bold tracking-tight text-foreground">
        {formatarMoeda(amount)}
      </p>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cores.caption}`}>
        {caption}
      </span>
    </Card>
  );
}
