import { Link } from "react-router";
import { formatarMoeda } from "@/lib/format";

type Tone = "in" | "out" | "saved";

interface StatCardProps {
  label: string;
  amount: number;
  tone: Tone;
  caption: string;
  /** Quando presente, o card vira link (alvo ≥ 44px) para a lista de transações. */
  href?: string;
  /** Rótulo acessível completo; cai no `label` quando ausente. */
  ariaLabel?: string;
  /** Classes extras no elemento raiz (ex.: `order-*` do grid do topo). */
  className?: string;
}

/** Cor do número por papel. Despesa é neutra (nunca vermelha); "sobrou" negativo também. */
const VALOR_COR: Record<Tone, string> = {
  in: "text-income",
  out: "text-foreground",
  saved: "text-income",
};

/**
 * Card de fluxo do topo do dashboard (spec "Topo — Opção B"): label, número e
 * legenda empilhados. Branco, ao lado do card verde de saldo, mesma altura.
 */
export function StatCard({
  label,
  amount,
  tone,
  caption,
  href,
  ariaLabel,
  className = "",
}: StatCardProps) {
  const corValor =
    tone === "saved" && amount < 0 ? "text-foreground" : VALOR_COR[tone];

  const conteudo = (
    <>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className={`num text-[19px] font-semibold ${corValor}`}>
        {formatarMoeda(amount)}
      </span>
      <span className="text-xs text-muted-foreground">{caption}</span>
    </>
  );

  const base = `card-surface flex min-h-[44px] flex-col gap-1.5 rounded-lg p-3.5 ${className}`;

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
