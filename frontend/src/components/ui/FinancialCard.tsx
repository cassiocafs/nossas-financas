import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";

interface FinancialCardProps {
  label: string;
  amount: number;
  delta?: string;
  action?: { label: string; onClick: () => void };
  footer?: { label: string; value: number };
}

export function FinancialCard({ label, amount, delta, action, footer }: FinancialCardProps) {
  const [oculto, setOculto] = useState(false);

  return (
    <Card tone="brand" className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest text-primary-foreground/70 uppercase">
            {label}
          </p>
          <p className="type-money-lg mt-2 text-primary-foreground">
            {oculto ? "R$ ••••••" : formatarMoeda(amount)}
          </p>
          {delta && <p className="mt-1.5 text-sm text-primary-foreground/80">{delta}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="rounded-full border border-primary-foreground/30 px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-foreground/10"
            >
              {action.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOculto((v) => !v)}
            aria-label={oculto ? "Mostrar saldo" : "Ocultar saldo"}
            title={oculto ? "Mostrar saldo" : "Ocultar saldo"}
            className="grid size-8 shrink-0 place-items-center rounded-full text-primary-foreground/80 hover:bg-primary-foreground/10"
          >
            {oculto ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
        </div>
      </div>

      {footer && (
        <p className="mt-5 border-t border-primary-foreground/15 pt-4 text-sm text-primary-foreground/70">
          {footer.label}{" "}
          <span className="num font-bold text-primary-foreground">
            {formatarMoeda(footer.value)}
          </span>
        </p>
      )}
    </Card>
  );
}
