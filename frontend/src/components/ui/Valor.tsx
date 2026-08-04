import { formatarMoeda } from "@/lib/format";

interface ValorProps {
  valor: number;
  className?: string;
  neutro?: boolean;
}

export function Valor({ valor, className = "", neutro = false }: ValorProps) {
  const cor = neutro
    ? "text-ink dark:text-paper"
    : valor < 0
      ? "text-vermelho dark:text-vermelho-night"
      : valor > 0
        ? "text-verde dark:text-verde-night"
        : "text-ink dark:text-paper";

  return (
    <span className={`font-mono tabular-nums ${cor} ${className}`}>
      {formatarMoeda(valor)}
    </span>
  );
}
