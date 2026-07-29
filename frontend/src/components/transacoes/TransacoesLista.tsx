import type { DiaTransacoes, Transacao } from "@/api/transacoes";
import { formatarData } from "@/lib/format";
import { Valor } from "@/components/ui/Valor";
import { Card } from "@/components/ui/Card";

interface TransacoesListaProps {
  dias: DiaTransacoes[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEdit: (transacao: Transacao) => void;
}

export function TransacoesLista({
  dias,
  selectedIds,
  onToggleSelect,
  onEdit,
}: TransacoesListaProps) {
  if (dias.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink/50 dark:text-paper/50">
        Nenhuma transação neste período.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {dias.map((dia) => (
        <Card key={dia.data} className="overflow-hidden">
          <div className="flex items-center justify-between bg-ink/5 px-4 py-2 text-sm dark:bg-white/5">
            <span className="font-medium text-ink/80 dark:text-paper/80">
              {formatarData(dia.data)}
            </span>
            <span className="text-ink/50 dark:text-paper/50">
              Saldo do dia: <Valor valor={dia.saldoDia} neutro />
            </span>
          </div>
          <ul className="divide-y divide-line dark:divide-line-night">
            {dia.transacoes.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-ink/5 dark:hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(t.id)}
                  onChange={() => onToggleSelect(t.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-ink dark:accent-paper"
                />
                <button
                  type="button"
                  onClick={() => onEdit(t)}
                  className="flex flex-1 items-center justify-between text-left"
                >
                  <span className="flex items-center gap-2">
                    {t.consolidado && <span title="Consolidado">✓</span>}
                    <span className="text-ink dark:text-paper">{t.descricao}</span>
                    {t.tipo === "TRANSFERENCIA" && (
                      <span className="border border-line px-1.5 py-0.5 font-mono text-xs text-ink/70 dark:border-line-night dark:text-paper/70">
                        Transferência
                      </span>
                    )}
                    <span className="text-xs text-ink/40 dark:text-paper/40">{t.conta.nome}</span>
                    {t.categoria && (
                      <span className="text-xs text-ink/40 dark:text-paper/40">· {t.categoria.nome}</span>
                    )}
                  </span>
                  <Valor valor={t.valor} className="font-medium" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
