import { Link } from "react-router";
import type { Transacao } from "@/api/transacoes";
import { Card } from "@/components/ui/Card";
import { TransactionItem } from "@/components/ui/TransactionItem";

interface TransacoesRecentesCardProps {
  ano: number;
  mes: number;
  recentes: Transacao[];
}

function formatarDiaMesCurto(iso: string): string {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" })
    .format(new Date(Date.UTC(ano, mes - 1, dia)))
    .replace(".", "");
}

export function TransacoesRecentesCard({ ano, mes, recentes }: TransacoesRecentesCardProps) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold text-foreground">
          Últimas transações
        </h3>
        <Link
          to={`/transacoes?ano=${ano}&mes=${mes}`}
          className="shrink-0 text-xs font-semibold text-primary hover:underline"
        >
          Ver todas →
        </Link>
      </div>

      {recentes.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nenhuma transação neste período.</p>
      ) : (
        <ul className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {recentes.map((t) => (
            <TransactionItem
              key={t.id}
              title={t.descricao}
              category={t.categoria?.nome ?? "Sem categoria"}
              amount={t.valor}
              tipo={t.tipo}
              time={formatarDiaMesCurto(t.data)}
              showChevron
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
