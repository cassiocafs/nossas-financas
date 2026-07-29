import { useEffect, useState } from "react";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

function formatarBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseBRL(texto: string): number {
  const limpo = texto.replace(/[^\d,-]/g, "").replace(",", ".");
  const numero = Number.parseFloat(limpo);
  return Number.isFinite(numero) ? numero : 0;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  className = "",
}: CurrencyInputProps) {
  const [texto, setTexto] = useState(formatarBRL(value));

  useEffect(() => {
    setTexto(formatarBRL(value));
  }, [value]);

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      disabled={disabled}
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={() => {
        const numero = parseBRL(texto);
        setTexto(formatarBRL(numero));
        onChange(numero);
        onBlur?.();
      }}
      className={`w-full rounded-md border border-line bg-transparent px-3 py-2 text-right font-mono text-sm tabular-nums text-ink dark:border-line-night dark:text-paper ${className}`}
    />
  );
}
