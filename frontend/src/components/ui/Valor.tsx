import { formatarMoeda } from "@/lib/format";

interface ValorProps {
  valor: number;
  className?: string;
  neutro?: boolean;
}

export function Valor({ valor, className = "", neutro = false }: ValorProps) {
  const cor = neutro
    ? "text-foreground"
    : valor < 0
      ? "text-expense"
      : valor > 0
        ? "text-income"
        : "text-foreground";

  return (
    <span className={`num ${cor} ${className}`}>
      {formatarMoeda(valor)}
    </span>
  );
}
