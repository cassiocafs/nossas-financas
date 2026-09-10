import { Card } from "@/components/ui/Card";
import { useFormatarValor } from "@/hooks/use-formatar-valor";

interface FinancialCardProps {
  label: string;
  amount: number;
  delta?: string;
  action?: { label: string; onClick: () => void };
  footer?: { label: string; value: number };
}

/**
 * Card de saldo do topo do dashboard: único card verde da linha, ocupa a
 * coluna mais larga e estica na altura dos StatCard ao lado. Mantém a ação
 * "Ver extrato" e o rodapé "Saldo anterior" (agrupados na base para não
 * espremer o rótulo). O controle de ocultar valores vive na barra do topo.
 */
export function FinancialCard({ label, amount, delta, action, footer }: FinancialCardProps) {
  const formatarValor = useFormatarValor();

  return (
    <Card tone="brand" className="flex h-full flex-col rounded-xl p-[18px]">
      <p className="text-xs font-semibold text-primary-foreground/70">{label}</p>

      <div className="mt-2 min-w-0">
        <p className="num text-[clamp(1.125rem,1.1rem+1vw,1.5rem)] leading-[1.1] font-bold text-primary-foreground">
          {formatarValor(amount)}
        </p>
        {delta && <p className="mt-1 text-sm text-primary-foreground/80">{delta}</p>}
      </div>

      {(footer || action) && (
        <div className="mt-auto flex flex-col gap-2 border-t border-primary-foreground/15 pt-3 lg:flex-row lg:items-end lg:justify-between">
          {footer && (
            <p className="text-[11px] leading-tight text-primary-foreground/70">
              {footer.label}{" "}
              <span className="num font-bold text-primary-foreground">
                {formatarValor(footer.value)}
              </span>
            </p>
          )}
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="shrink-0 self-start rounded-full border border-primary-foreground/30 px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary-foreground/10 lg:self-auto"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
