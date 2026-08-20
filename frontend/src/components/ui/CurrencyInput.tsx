import { useEffect, useRef, useState } from "react";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

const MAX_DIGITOS = 15;

function centavosDeValor(valor: number): number {
  return Math.round(Math.abs(valor) * 100);
}

function valorDeCentavos(centavos: number, negativo: boolean): number {
  const numero = centavos / 100;
  return negativo ? -numero : numero;
}

function formatarCentavos(centavos: number, negativo: boolean): string {
  const texto = (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return negativo ? `-${texto}` : texto;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  className = "",
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [centavos, setCentavos] = useState(() => centavosDeValor(value));
  const [negativo, setNegativo] = useState(value < 0);
  const ultimoValorEmitido = useRef(value);

  useEffect(() => {
    if (value !== ultimoValorEmitido.current) {
      setCentavos(centavosDeValor(value));
      setNegativo(value < 0);
      ultimoValorEmitido.current = value;
    }
  }, [value]);

  useEffect(() => {
    const el = inputRef.current;
    if (el && document.activeElement === el) {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [centavos, negativo]);

  function emitir(novosCentavos: number, novoNegativo: boolean) {
    setCentavos(novosCentavos);
    setNegativo(novoNegativo);
    const numero = valorDeCentavos(novosCentavos, novoNegativo);
    ultimoValorEmitido.current = numero;
    onChange(numero);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const digitos = raw.replace(/\D/g, "").slice(-MAX_DIGITOS);
    const novosCentavos = digitos ? Number(digitos) : 0;
    const novoNegativo = raw.includes("-");
    emitir(novosCentavos, novoNegativo);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    const len = e.target.value.length;
    e.target.setSelectionRange(len, len);
  }

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="decimal"
      disabled={disabled}
      value={formatarCentavos(centavos, negativo)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={onBlur}
      className={`num w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-right text-[13px] text-foreground ${className}`}
    />
  );
}
