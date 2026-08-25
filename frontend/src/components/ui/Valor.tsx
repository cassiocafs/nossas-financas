import { formatarMoeda } from "@/lib/format";

interface ValorProps {
  valor: number;
  className?: string;
  neutro?: boolean;
  /** Saldo de conta: negativo é um problema real (estouro), não uma despesa comum — usa a cor de alerta. */
  saldo?: boolean;
}

export function Valor({ valor, className = "", neutro = false, saldo = false }: ValorProps) {
  const cor = neutro
    ? "text-foreground"
    : valor < 0
      ? saldo
        ? "text-money-alert"
        : "text-expense"
      : valor > 0
        ? "text-income"
        : "text-foreground";

  return (
    <span className={`num ${cor} ${className}`}>
      {formatarMoeda(valor)}
    </span>
  );
}
