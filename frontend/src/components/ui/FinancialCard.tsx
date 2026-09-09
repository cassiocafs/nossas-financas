import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatarMoeda } from "@/lib/format";

interface FinancialCardProps {
  label: string;
  amount: number;
  /** Variação do saldo no mês, já formatada (ex.: "+R$ 1.860"). */
  delta?: string;
}

/**
 * Card de saldo do topo do dashboard (spec "Topo — Opção B").
 * Único card verde da linha; ocupa a coluna mais larga e estica na altura
 * dos três StatCard ao lado (~132px). Sem ação "Ver extrato" e sem rodapé
 * "Saldo anterior" — ambos vivem na tela de extrato.
 */
export function FinancialCard({ label, amount, delta }: FinancialCardProps) {
  const [oculto, setOculto] = useState(false);

  return (
    <Card
      tone="brand"
      className="flex h-full flex-col justify-between gap-2 rounded-xl p-[18px]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-widest text-primary-foreground/70 uppercase">
          {label}
        </p>
        <button
          type="button"
          onClick={() => setOculto((v) => !v)}
          aria-label={oculto ? "Mostrar saldo" : "Ocultar saldo"}
          title={oculto ? "Mostrar saldo" : "Ocultar saldo"}
          className="-m-1 grid size-8 shrink-0 place-items-center rounded-full bg-primary-foreground/[0.14] text-primary-foreground/85 transition-colors hover:bg-primary-foreground/25"
        >
          {oculto ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      </div>
      <div className="min-w-0">
        <p className="num text-[clamp(1.125rem,1.1rem+1vw,1.5rem)] leading-[1.1] font-bold text-primary-foreground">
          {oculto ? "R$ ••••••" : formatarMoeda(amount)}
        </p>
        {delta && !oculto && (
          <p className="mt-1 text-sm text-primary-foreground/80">{delta}</p>
        )}
      </div>
    </Card>
  );
}
