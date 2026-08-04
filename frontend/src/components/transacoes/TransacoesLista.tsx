import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editarTransacao, type DiaTransacoes } from "@/api/transacoes";
import { formatarData } from "@/lib/format";
import { Valor } from "@/components/ui/Valor";
import { Card } from "@/components/ui/Card";
import { TransacaoFormInline } from "./TransacaoFormInline";

const COLUNAS = "grid-cols-[auto_1fr_140px_160px_140px]";

interface TransacoesListaProps {
  dias: DiaTransacoes[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  editandoId: string | null;
  onEdit: (id: string | null) => void;
  onSaved: () => void;
  desabilitada?: boolean;
  headerOffset?: number;
}

export function TransacoesLista({
  dias,
  selectedIds,
  onToggleSelect,
  editandoId,
  onEdit,
  onSaved,
  desabilitada = false,
  headerOffset = 0,
}: TransacoesListaProps) {
  const queryClient = useQueryClient();

  const consolidarMutation = useMutation({
    mutationFn: ({ id, consolidado }: { id: string; consolidado: boolean }) =>
      editarTransacao(id, { consolidado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transacoes"] }),
  });

  if (dias.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink/50 dark:text-paper/50">
        Nenhuma transação neste período.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div
        style={{ top: headerOffset }}
        className={`sticky z-10 hidden ${COLUNAS} items-center gap-3 bg-paper px-4 py-2 text-xs font-medium uppercase tracking-wide text-ink/40 sm:grid dark:bg-paper-night dark:text-paper/40`}
      >
        <span />
        <span>Descrição</span>
        <span>Conta</span>
        <span>Categoria</span>
        <span className="text-right">Valor</span>
      </div>

      {dias.map((dia) => (
        <Card key={dia.data} className="overflow-hidden">
          <div className="flex items-center justify-between bg-ink/5 px-4 py-2 text-sm dark:bg-white/5">
            <span className="font-medium text-ink/80 dark:text-paper/80">
              {formatarData(dia.data)}
            </span>
          </div>
          <ul className="divide-y divide-line dark:divide-line-night">
            {dia.transacoes.map((t) =>
              editandoId === t.id ? (
                <li key={t.id}>
                  <TransacaoFormInline
                    transacao={t}
                    onSaved={onSaved}
                    onCancel={() => onEdit(null)}
                  />
                </li>
              ) : (
                <li
                  key={t.id}
                  onClick={() => !desabilitada && onEdit(t.id)}
                  className={`grid ${COLUNAS} items-center gap-3 px-4 py-2 text-sm hover:bg-ink/5 dark:hover:bg-white/5 ${
                    desabilitada ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => onToggleSelect(t.id)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={desabilitada}
                    className="accent-ink disabled:cursor-not-allowed disabled:opacity-50 dark:accent-paper"
                  />
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`truncate text-ink dark:text-paper ${
                        t.consolidado ? "" : "font-bold"
                      }`}
                    >
                      {t.descricao}
                    </span>
                    {t.tipo === "TRANSFERENCIA" && (
                      <span className="shrink-0 border border-line px-1.5 py-0.5 font-mono text-xs text-ink/70 dark:border-line-night dark:text-paper/70">
                        Transferência
                      </span>
                    )}
                  </span>
                  <span
                    className={`truncate text-xs text-ink/50 dark:text-paper/50 ${
                      t.consolidado ? "" : "font-bold"
                    }`}
                  >
                    {t.conta.nome}
                  </span>
                  <span
                    className={`truncate text-xs text-ink/50 dark:text-paper/50 ${
                      t.consolidado ? "" : "font-bold"
                    }`}
                  >
                    {t.categoria ? t.categoria.nome : "—"}
                  </span>
                  <span className="flex items-center justify-end gap-3">
                    <Valor
                      valor={t.valor}
                      className={`text-right ${t.consolidado ? "font-medium" : "font-bold"}`}
                    />
                    <button
                      type="button"
                      title={t.consolidado ? "Consolidado" : "Marcar como consolidado"}
                      aria-pressed={t.consolidado}
                      onClick={(e) => {
                        e.stopPropagation();
                        consolidarMutation.mutate({ id: t.id, consolidado: !t.consolidado });
                      }}
                      disabled={desabilitada || consolidarMutation.isPending}
                      className={`ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        t.consolidado
                          ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-paper-night"
                          : "border-line text-transparent hover:border-ink/40 dark:border-line-night dark:hover:border-paper/40"
                      }`}
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                </li>
              ),
            )}
          </ul>
          <div className="flex items-center justify-end bg-ink/5 px-4 py-2 text-sm dark:bg-white/5">
            <span className="text-ink/50 dark:text-paper/50">
              Saldo do dia: <Valor valor={dia.saldoDia} neutro />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
