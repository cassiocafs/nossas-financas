import { Lightbulb, ArrowRight } from "lucide-react";
import { Mascot, type MascotState } from "@/components/ui/Mascot";

interface InsightCardProps {
  title?: string;
  children: string;
  cta?: { label: string; onClick: () => void };
  mascotState?: MascotState;
}

/** "Dica do Poupeu" — cartão creme com o mascote ao lado do texto (nunca sobreposto). */
export function InsightCard({
  title = "Dica do Poupeu",
  children,
  cta,
  mascotState = "encouraging",
}: InsightCardProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3.5 overflow-hidden rounded-3xl bg-secondary p-5">
      <div className="min-w-0 text-center">
        <p className="flex items-center justify-center gap-1.5 font-display text-base font-bold text-primary">
          {title}
          <Lightbulb className="size-4 text-yellow-accent" aria-hidden="true" />
        </p>
        <p className="mt-2 text-sm text-foreground/80" style={{ textWrap: "pretty" }}>
          {children}
        </p>
        {cta && (
          <button
            type="button"
            onClick={cta.onClick}
            className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {cta.label}
            <ArrowRight className="size-[15px]" aria-hidden="true" />
          </button>
        )}
      </div>
      <Mascot state={mascotState} size={96} />
    </div>
  );
}
