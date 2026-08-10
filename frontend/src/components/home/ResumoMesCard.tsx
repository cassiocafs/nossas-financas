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
    <div className="bg-card">
      <div
        className={`border-t-[3px] p-6 ${
          positivo ? "border-t-foreground" : "border-t-expense"
        }`}
      >
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          Saldo do mês
        </p>
        <p
          className={`num text-5xl leading-none font-semibold ${
            positivo ? "text-foreground" : "text-expense"
          }`}
        >
          {formatarMoeda(saldoExibido)}
        </p>
        <div className="mt-4 flex gap-6 border-t border-border pt-4 text-xs text-muted-foreground">
          <span>↑ {formatarMoeda(totalEntradas)}</span>
          <span>↓ {formatarMoeda(totalSaidas)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Saldo anterior</p>
          <Valor valor={saldoAnterior} neutro className="font-medium" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Entradas</p>
          <Valor valor={totalEntradas} neutro className="font-medium" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Saídas</p>
          <Valor valor={-Math.abs(totalSaidas)} className="font-medium" />
        </div>
      </div>

      <label className="flex items-center gap-2 px-5 pb-5 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={incluirSaldoAnterior}
          onChange={(e) => setIncluirSaldoAnterior(e.target.checked)}
          className="accent-primary"
        />
        Incluir saldo anterior no cálculo
      </label>
    </div>
  );
}
