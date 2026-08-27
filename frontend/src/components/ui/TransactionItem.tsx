import { ChevronRight } from "lucide-react";
import type { TipoTransacao } from "@/api/transacoes";
import { TransactionTypeIcon } from "@/components/ui/TransactionTypeIcon";
import { Valor } from "@/components/ui/Valor";

interface TransactionItemProps {
  title: string;
  category: string;
  amount: number;
  tipo: TipoTransacao;
  note?: string;
  time: string;
  showChevron?: boolean;
  onClick?: () => void;
}

export function TransactionItem({
  title,
  category,
  amount,
  tipo,
  note,
  time,
  showChevron = false,
  onClick,
}: TransactionItemProps) {
  return (
    <li
      onClick={onClick}
      className={`flex items-center gap-3 border-b border-border py-2.5 last:border-b-0 ${
        onClick ? "cursor-pointer hover:bg-muted" : ""
      }`}
    >
      <TransactionTypeIcon tipo={tipo} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {category}
          {note ? ` · ${note}` : ""} · {time}
        </p>
      </div>
      <Valor valor={amount} className="shrink-0 text-right text-sm font-bold" />
      {showChevron && (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
    </li>
  );
}
