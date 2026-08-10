import { Link } from "react-router";
import type { Transacao } from "@/api/transacoes";
import { formatarData } from "@/lib/format";
import { Valor } from "@/components/ui/Valor";
import { cardClassName } from "@/components/ui/Card";
import { TypeIcon } from "@/components/transacoes/TransacoesLista";

interface PendenciasListProps {
  titulo: string;
  itens: Transacao[];
}

export function PendenciasList({ titulo, itens }: PendenciasListProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{titulo}</h3>
      {itens.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma pendência.</p>
      ) : (
        <ul className={`divide-y divide-border ${cardClassName}`}>
          {itens.map((t) => {
            const [ano, mes] = t.data.split("-");
            return (
              <li key={t.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <TypeIcon tipo={t.tipo} />
                <Link
                  to={`/transacoes?ano=${ano}&mes=${Number(mes)}`}
                  className="min-w-0 flex-1 truncate text-muted-foreground hover:underline"
                >
                  {formatarData(t.data)} · {t.descricao}
                </Link>
                <Valor valor={t.valor} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
