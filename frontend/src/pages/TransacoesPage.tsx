import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { listarTransacoesMes, type StatusFiltro } from "@/api/transacoes";
import { listarContas } from "@/api/contas";
import { MesNavigator } from "@/components/shared/MesNavigator";
import { FiltrosLaterais } from "@/components/transacoes/FiltrosLaterais";
import { BuscaEStatusBar } from "@/components/transacoes/BuscaEStatusBar";
import { TransacoesLista } from "@/components/transacoes/TransacoesLista";
import { TransacaoFormInline } from "@/components/transacoes/TransacaoFormInline";
import { AcoesLoteBar } from "@/components/transacoes/AcoesLoteBar";
import { Valor } from "@/components/ui/Valor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

export function TransacoesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const padrao = hoje();
  const ano = Number(searchParams.get("ano")) || padrao.ano;
  const mes = Number(searchParams.get("mes")) || padrao.mes;

  const [status, setStatus] = useState<StatusFiltro>("todas");
  const [contaIds, setContaIds] = useState<string[]>([]);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [texto, setTexto] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const mensagemTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topoRef = useRef<HTMLDivElement>(null);
  const [alturaTopo, setAlturaTopo] = useState(0);

  const { data: contas = [] } = useQuery({ queryKey: ["contas"], queryFn: () => listarContas(true) });

  useEffect(() => {
    if (contas.length > 0 && contaIds.length === 0) {
      setContaIds(contas.map((c) => c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contas]);

  const { data, isLoading } = useQuery({
    queryKey: ["transacoes", { ano, mes, contaIds, categoriaIds, status, texto }],
    queryFn: () =>
      listarTransacoesMes({
        ano,
        mes,
        contaIds: contaIds.length > 0 ? contaIds : undefined,
        categoriaIds: categoriaIds.length > 0 ? categoriaIds : undefined,
        status,
        texto: texto || undefined,
      }),
    enabled: contaIds.length > 0,
  });

  function mudarMes(novoAno: number, novoMes: number) {
    setSearchParams({ ano: String(novoAno), mes: String(novoMes) });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function mostrarMensagemSucesso(mensagem: string) {
    if (mensagemTimeoutRef.current) clearTimeout(mensagemTimeoutRef.current);
    setMensagemSucesso(mensagem);
    mensagemTimeoutRef.current = setTimeout(() => setMensagemSucesso(null), 6000);
  }

  function fecharMensagemSucesso() {
    if (mensagemTimeoutRef.current) clearTimeout(mensagemTimeoutRef.current);
    setMensagemSucesso(null);
  }

  useEffect(() => {
    return () => {
      if (mensagemTimeoutRef.current) clearTimeout(mensagemTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const elemento = topoRef.current;
    if (!elemento) return;
    const observer = new ResizeObserver(([entry]) => setAlturaTopo(entry.contentRect.height));
    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-4">
      <div
        ref={topoRef}
        className="sticky top-0 z-20 -mx-4 -mt-4 space-y-4 bg-paper px-4 pb-4 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 dark:bg-paper-night"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 sm:pt-6 lg:pt-8">
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-paper">Transações</h1>
          <div className="flex items-center gap-4">
            <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
            <button
              type="button"
              onClick={() => mudarMes(padrao.ano, padrao.mes)}
              className="rounded-md border border-line px-2 py-1 text-sm text-ink/70 hover:bg-ink/5 dark:border-line-night dark:text-paper/70 dark:hover:bg-white/5"
            >
              Hoje
            </button>
            <Button onClick={() => setCriando(true)} disabled={excluindo}>
              Adicionar transação
            </Button>
          </div>
        </div>

        {data && (
          <Card className="flex flex-wrap gap-6 px-4 py-3 text-sm">
            <span className="text-ink/60 dark:text-paper/60">
              Saldo anterior: <Valor valor={data.saldoAnterior} neutro className="font-medium" />
            </span>
            <span className="text-ink/60 dark:text-paper/60">
              Entradas: <Valor valor={data.totalEntradas} className="font-medium" />
            </span>
            <span className="text-ink/60 dark:text-paper/60">
              Saídas: <Valor valor={-Math.abs(data.totalSaidas)} className="font-medium" />
            </span>
            <span className="text-ink/60 dark:text-paper/60">
              Saldo final: <Valor valor={data.saldoFinal} className="font-medium" />
            </span>
          </Card>
        )}

        {mensagemSucesso && (
          <div className="relative flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-10 py-2.5 text-sm font-bold text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="flex items-center gap-2">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                  clipRule="evenodd"
                />
              </svg>
              {mensagemSucesso}
            </span>
            <button
              type="button"
              onClick={fecharMensagemSucesso}
              aria-label="Fechar mensagem"
              className="absolute right-3 rounded p-1 text-emerald-700/60 hover:text-emerald-700 dark:text-emerald-300/60 dark:hover:text-emerald-300"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
        )}

        <BuscaEStatusBar
          texto={texto}
          onTextoChange={setTexto}
          status={status}
          onStatusChange={setStatus}
        />

        <AcoesLoteBar
          selectedIds={selectedIds}
          onDone={() => setSelectedIds([])}
          onExcluindoChange={setExcluindo}
          onExcluida={(quantidade) =>
            mostrarMensagemSucesso(
              quantidade === 1
                ? "Transação excluída com sucesso"
                : `${quantidade} transações excluídas com sucesso`,
            )
          }
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <FiltrosLaterais
          contaIds={contaIds}
          onContaIdsChange={setContaIds}
          categoriaIds={categoriaIds}
          onCategoriaIdsChange={setCategoriaIds}
        />

        <div className="flex-1 space-y-4">
          {criando && (
            <TransacaoFormInline
              onSaved={() => {
                setCriando(false);
                mostrarMensagemSucesso("Transação criada com sucesso");
              }}
              onCancel={() => setCriando(false)}
            />
          )}

          {isLoading ? (
            <p className="font-mono text-sm text-ink/50 dark:text-paper/50">Carregando...</p>
          ) : (
            <TransacoesLista
              dias={data?.dias ?? []}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              editandoId={editandoId}
              onEdit={setEditandoId}
              onSaved={() => {
                setEditandoId(null);
                mostrarMensagemSucesso("Transação atualizada com sucesso");
              }}
              desabilitada={excluindo}
              headerOffset={alturaTopo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
