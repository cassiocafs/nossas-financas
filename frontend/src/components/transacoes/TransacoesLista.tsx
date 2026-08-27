import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editarTransacao, type DiaTransacoes } from "@/api/transacoes";
import { formatarData } from "@/lib/format";
import { Valor } from "@/components/ui/Valor";
import { Card } from "@/components/ui/Card";
import { TransactionTypeIcon } from "@/components/ui/TransactionTypeIcon";
import { EmptyState } from "@/components/shared/EmptyState";
import { TransacaoFormInline } from "./TransacaoFormInline";

const COLUNAS = "grid-cols-[auto_auto_1fr_140px_160px_140px]";

interface TransacoesListaProps {
  dias: DiaTransacoes[];
  saldoAnterior?: number;
  headerOffset?: number;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  editandoId: string | null;
  onEdit: (id: string | null) => void;
  onSaved: () => void;
  desabilitada?: boolean;
}

export function TransacoesLista({
  dias,
  saldoAnterior,
  headerOffset = 0,
  selectedIds,
  onToggleSelect,
  editandoId,
  onEdit,
  onSaved,
  desabilitada = false,
}: TransacoesListaProps) {
  const queryClient = useQueryClient();

  const consolidarMutation = useMutation({
    mutationFn: ({ id, consolidado }: { id: string; consolidado: boolean }) =>
      editarTransacao(id, { consolidado }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transacoes"] }),
  });

  const saldoAnteriorEl = saldoAnterior !== undefined && (
    <div className="flex items-center justify-end gap-1.5 px-4 text-sm text-muted-foreground">
      Saldo anterior: <Valor valor={saldoAnterior} neutro className="font-medium" />
    </div>
  );

  if (dias.length === 0) {
    return (
      <div className="space-y-4">
        {saldoAnteriorEl}
        <EmptyState mood="thinking" title="Nenhuma transação encontrada">
          Ajuste o período ou os filtros para ver outras transações.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {saldoAnteriorEl}

      <div
        style={{ top: headerOffset }}
        className={`sticky z-10 hidden ${COLUNAS} items-center gap-3 border-b border-border bg-background px-4 py-2 text-[10.5px] font-bold uppercase tracking-widest text-muted-foreground sm:grid`}
      >
        <span />
        <span />
        <span>Descrição</span>
        <span>Categoria</span>
        <span>Conta</span>
        <span className="text-right">Valor</span>
      </div>

      {dias.map((dia) => (
        <Card key={dia.data}>
          <div className="flex items-center justify-between rounded-t-2xl bg-muted px-4 py-2 text-sm">
            <span className="font-medium text-foreground/80">{formatarData(dia.data)}</span>
          </div>
          <ul className="divide-y divide-border">
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
                  className={`grid ${COLUNAS} items-center gap-3 px-4 py-2 text-sm hover:bg-muted ${
                    desabilitada ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => onToggleSelect(t.id)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={desabilitada}
                    className="accent-primary disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <TransactionTypeIcon tipo={t.tipo} />
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`truncate text-foreground ${t.consolidado ? "" : "font-bold"}`}
                    >
                      {t.descricao}
                    </span>
                  </span>
                  <span
                    className={`flex items-center gap-1 truncate text-xs text-muted-foreground ${
                      t.consolidado ? "" : "font-bold"
                    } ${t.tipo === "TRANSFERENCIA" ? "text-transfer" : ""}`}
                  >
                    {t.tipo === "TRANSFERENCIA" ? (
                      <>
                        Transferência
                        {t.valor < 0 ? (
                          <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
                        ) : (
                          <ArrowDownLeft className="size-3 shrink-0" aria-hidden="true" />
                        )}
                      </>
                    ) : t.categoria ? (
                      t.categoria.nome
                    ) : (
                      "—"
                    )}
                  </span>
                  <span
                    className={`truncate text-xs text-muted-foreground ${
                      t.consolidado ? "" : "font-bold"
                    }`}
                  >
                    {t.conta.nome}
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
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-transparent hover:border-foreground/40"
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
          <div className="flex items-center justify-end rounded-b-2xl bg-muted px-4 py-2 text-sm">
            <span className="text-muted-foreground">
              Saldo do dia: <Valor valor={dia.saldoDia} neutro />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
