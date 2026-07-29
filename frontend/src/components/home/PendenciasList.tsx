import { Link } from "react-router";
import type { Transacao } from "@/api/transacoes";
import { formatarData } from "@/lib/format";
import { Valor } from "@/components/ui/Valor";
import { cardClassName } from "@/components/ui/Card";

interface PendenciasListProps {
  titulo: string;
  itens: Transacao[];
}

export function PendenciasList({ titulo, itens }: PendenciasListProps) {
  return (
    <div>
      <h3 className="mb-2 font-display text-sm font-semibold text-ink dark:text-paper">{titulo}</h3>
      {itens.length === 0 ? (
        <p className="text-sm text-ink/50 dark:text-paper/50">Nenhuma pendência.</p>
      ) : (
        <ul className={`divide-y divide-line dark:divide-line-night ${cardClassName}`}>
          {itens.map((t) => {
            const [ano, mes] = t.data.split("-");
            return (
              <li key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <Link
                  to={`/transacoes?ano=${ano}&mes=${Number(mes)}`}
                  className="flex-1 text-ink/80 hover:underline dark:text-paper/80"
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
