import { formatarMoeda } from "@/lib/format";

interface ValorProps {
  valor: number;
  className?: string;
  neutro?: boolean;
}

export function Valor({ valor, className = "", neutro = false }: ValorProps) {
  const cor =
    !neutro && valor < 0
      ? "text-vermelho dark:text-vermelho-night"
      : "text-ink dark:text-paper";

  return (
    <span className={`font-mono tabular-nums ${cor} ${className}`}>
      {formatarMoeda(valor)}
    </span>
  );
}
