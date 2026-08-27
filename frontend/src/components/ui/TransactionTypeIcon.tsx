import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import type { TipoTransacao } from "@/api/transacoes";

const TIPO_TONE: Record<TipoTransacao, string> = {
  RECEITA: "bg-income-soft text-income",
  DESPESA: "bg-expense-soft text-expense",
  TRANSFERENCIA: "bg-transfer-soft text-transfer",
};

const TIPO_ICON: Record<TipoTransacao, typeof ArrowDownLeft> = {
  RECEITA: ArrowDownLeft,
  DESPESA: ArrowUpRight,
  TRANSFERENCIA: ArrowLeftRight,
};

export function TransactionTypeIcon({ tipo }: { tipo: TipoTransacao }) {
  const Icon = TIPO_ICON[tipo];
  return (
    <span className={`grid size-7 shrink-0 place-items-center rounded-md ${TIPO_TONE[tipo]}`}>
      <Icon className="size-3.5" aria-hidden="true" />
    </span>
  );
}
