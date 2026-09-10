import type { ReactNode } from "react";
import { Link } from "react-router";
import { useFormatarValor } from "@/hooks/use-formatar-valor";

type Tone = "in" | "out" | "saved";

interface StatCardProps {
  label: string;
  amount: number;
  tone: Tone;
  icon: ReactNode;
  caption: string;
  /** Quando presente, o card vira link (alvo ≥ 44px) para a lista de transações. */
  href?: string;
  /** Rótulo acessível completo; cai no `label` quando ausente. */
  ariaLabel?: string;
  /** Classes extras no elemento raiz (ex.: `order-*` do grid do topo). */
  className?: string;
}

/** Tom do chip do ícone e da pílula. `saved` negativo usa o tom de `out`. */
const TONES: Record<Tone, { chip: string; pill: string }> = {
  in: { chip: "bg-income-soft text-income", pill: "bg-income-soft text-income" },
  out: {
    chip: "bg-yellow-accent/15 text-yellow-accent",
    pill: "bg-yellow-accent/15 text-yellow-accent",
  },
  saved: { chip: "bg-income-soft text-income", pill: "bg-income-soft text-income" },
};

/**
 * Card de fluxo do topo do dashboard: ícone + rótulo, número neutro e a
 * legenda de variação em pílula. Fica ao lado do card verde de saldo, na
 * mesma linha e com a mesma altura.
 */
export function StatCard({
  label,
  amount,
  tone,
  icon,
  caption,
  href,
  ariaLabel,
  className = "",
}: StatCardProps) {
  const formatarValor = useFormatarValor();
  const efetivo: Tone = tone === "saved" && amount < 0 ? "out" : tone;
  const cor = TONES[efetivo];

  const conteudo = (
    <>
      <div className="flex items-center gap-2">
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-lg [&>svg]:size-3.5 ${cor.chip}`}
        >
          {icon}
        </span>
        <span className="text-xs font-medium leading-tight text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="num text-[19px] font-semibold text-foreground">{formatarValor(amount)}</p>
      <span
        className={`self-start rounded-full px-2 py-0.5 text-[11px] leading-snug font-semibold ${cor.pill}`}
      >
        {caption}
      </span>
    </>
  );

  const base = `card-surface flex min-h-[44px] flex-col justify-center gap-2 rounded-lg p-3.5 ${className}`;

  if (href) {
    return (
      <Link
        to={href}
        aria-label={ariaLabel ?? label}
        className={`${base} transition-[box-shadow,transform] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-0.5 hover:shadow-lift focus-visible:shadow-[0_0_0_3px_rgba(31,163,74,0.35)] focus-visible:outline-none`}
      >
        {conteudo}
      </Link>
    );
  }

  return (
    <article aria-label={ariaLabel} className={base}>
      {conteudo}
    </article>
  );
}
