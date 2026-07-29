import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { listarTransacoesMes, type StatusFiltro, type Transacao } from "@/api/transacoes";
import { listarContas } from "@/api/contas";
import { MesNavigator } from "@/components/shared/MesNavigator";
import { FiltrosLaterais } from "@/components/transacoes/FiltrosLaterais";
import { TransacoesLista } from "@/components/transacoes/TransacoesLista";
import { TransacaoFormInline } from "@/components/transacoes/TransacaoFormInline";
import { AcoesLoteBar } from "@/components/transacoes/AcoesLoteBar";
import { Modal } from "@/components/ui/Modal";
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
  const [editando, setEditando] = useState<Transacao | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-paper">Transações</h1>
        <div className="flex items-center gap-4">
          <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
          <Button onClick={() => setCriando(true)}>Adicionar transação</Button>
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

      <div className="flex flex-col gap-6 lg:flex-row">
        <FiltrosLaterais
          status={status}
          onStatusChange={setStatus}
          contaIds={contaIds}
          onContaIdsChange={setContaIds}
          categoriaIds={categoriaIds}
          onCategoriaIdsChange={setCategoriaIds}
          texto={texto}
          onTextoChange={setTexto}
        />

        <div className="flex-1 space-y-4">
          <AcoesLoteBar selectedIds={selectedIds} onDone={() => setSelectedIds([])} />

          {criando && (
            <TransacaoFormInline
              onSaved={() => setCriando(false)}
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
              onEdit={setEditando}
            />
          )}
        </div>
      </div>

      <Modal open={!!editando} onClose={() => setEditando(null)} title="Editar transação">
        {editando && (
          <TransacaoFormInline
            transacao={editando}
            onSaved={() => setEditando(null)}
            onCancel={() => setEditando(null)}
          />
        )}
      </Modal>
    </div>
  );
}
