import { useState } from "react";
import { Valor } from "@/components/ui/Valor";
import { formatarMoeda } from "@/lib/format";

interface ResumoMesCardProps {
  saldoAnterior: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
}

export function ResumoMesCard({
  saldoAnterior,
  totalEntradas,
  totalSaidas,
  saldoFinal,
}: ResumoMesCardProps) {
  const [incluirSaldoAnterior, setIncluirSaldoAnterior] = useState(true);
  const saldoExibido = incluirSaldoAnterior ? saldoFinal : saldoFinal - saldoAnterior;
  const positivo = saldoExibido >= 0;

  return (
    <div className="bg-surface dark:bg-surface-night">
      <div
        className={`border-t-[3px] p-6 ${
          positivo ? "border-t-ink dark:border-t-paper" : "border-t-vermelho dark:border-t-vermelho-night"
        }`}
      >
        <p className="font-mono text-xs tracking-widest text-ink/50 uppercase dark:text-paper/50">
          Saldo do mês
        </p>
        <p
          className={`font-mono text-5xl leading-none font-semibold tabular-nums ${
            positivo ? "text-ink dark:text-paper" : "text-vermelho dark:text-vermelho-night"
          }`}
        >
          {formatarMoeda(saldoExibido)}
        </p>
        <div className="mt-4 flex gap-6 border-t border-line pt-4 font-mono text-xs text-ink/60 dark:border-line-night dark:text-paper/60">
          <span>↑ {formatarMoeda(totalEntradas)}</span>
          <span>↓ {formatarMoeda(totalSaidas)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-line p-5 sm:grid-cols-3 dark:border-line-night">
        <div>
          <p className="text-xs text-ink/50 dark:text-paper/50">Saldo anterior</p>
          <Valor valor={saldoAnterior} neutro className="font-medium" />
        </div>
        <div>
          <p className="text-xs text-ink/50 dark:text-paper/50">Entradas</p>
          <Valor valor={totalEntradas} neutro className="font-medium" />
        </div>
        <div>
          <p className="text-xs text-ink/50 dark:text-paper/50">Saídas</p>
          <Valor valor={-Math.abs(totalSaidas)} className="font-medium" />
        </div>
      </div>

      <label className="flex items-center gap-2 px-5 pb-5 text-xs text-ink/60 dark:text-paper/60">
        <input
          type="checkbox"
          checked={incluirSaldoAnterior}
          onChange={(e) => setIncluirSaldoAnterior(e.target.checked)}
          className="accent-ink dark:accent-paper"
        />
        Incluir saldo anterior no cálculo
      </label>
    </div>
  );
}
