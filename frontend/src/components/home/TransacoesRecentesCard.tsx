import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { listarTransacoesMes } from "@/api/transacoes";
import { formatarData } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Valor } from "@/components/ui/Valor";
import { TypeIcon } from "@/components/transacoes/TransacoesLista";

interface TransacoesRecentesCardProps {
  ano: number;
  mes: number;
}

const LIMITE = 6;

export function TransacoesRecentesCard({ ano, mes }: TransacoesRecentesCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["transacoes", { ano, mes, status: "todas" as const }],
    queryFn: () => listarTransacoesMes({ ano, mes, status: "todas" }),
  });

  const recentes = (data?.dias ?? []).flatMap((dia) => dia.transacoes).slice(0, LIMITE);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">
            Transações recentes
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Últimos lançamentos nas contas ativas
          </p>
        </div>
        <Link
          to={`/transacoes?ano=${ano}&mes=${mes}`}
          className="shrink-0 rounded-[10px] border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Ver todas
        </Link>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
      ) : recentes.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nenhuma transação neste período.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {recentes.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2.5">
              <TypeIcon tipo={t.tipo} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{t.descricao}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {t.categoria?.nome ?? "—"} · {formatarData(t.data)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  t.consolidado ? "bg-income-soft text-income" : "bg-accent text-accent-foreground"
                }`}
              >
                {t.consolidado ? "Pago" : "Pendente"}
              </span>
              <Valor valor={t.valor} className="w-24 shrink-0 text-right text-sm font-bold" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
