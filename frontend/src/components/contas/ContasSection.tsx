import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarContas, type Conta } from "@/api/contas";
import { formatarMoeda } from "@/lib/format";
import { ContaFormModal } from "./ContaFormModal";
import { ExcluirContaDialog } from "./ExcluirContaDialog";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";

export function ContasSection() {
  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["contas"],
    queryFn: () => listarContas(true),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);
  const [contaExcluindo, setContaExcluindo] = useState<Conta | null>(null);
  const [mostrarInativas, setMostrarInativas] = useState(false);

  const ativas = contas.filter((c) => c.ativa);
  const inativas = contas.filter((c) => !c.ativa);
  const saldoConsolidado = ativas.reduce((soma, c) => soma + c.saldoAtual, 0);

  function abrirEdicao(conta: Conta) {
    setContaEditando(conta);
    setFormOpen(true);
  }

  function abrirCriacao() {
    setContaEditando(null);
    setFormOpen(true);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Contas</h2>
          <p className="text-sm text-muted-foreground">
            Saldo consolidado:{" "}
            <span className="font-medium text-foreground">{formatarMoeda(saldoConsolidado)}</span>
          </p>
        </div>
        <Button onClick={abrirCriacao}>Nova conta</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <ul className={`divide-y divide-border ${cardClassName}`}>
          {ativas.map((conta) => (
            <li
              key={conta.id}
              className="group flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="text-foreground">{conta.nome}</span>
              <div className="flex items-center gap-4">
                <span className="text-foreground/80">{formatarMoeda(conta.saldoAtual)}</span>
                <div className="hidden gap-2 group-hover:flex">
                  <button
                    type="button"
                    onClick={() => abrirEdicao(conta)}
                    className="text-muted-foreground underline hover:text-foreground"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setContaExcluindo(conta)}
                    className="text-destructive underline hover:text-destructive/80"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </li>
          ))}
          {ativas.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">Nenhuma conta ativa.</li>
          )}
        </ul>
      )}

      {inativas.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setMostrarInativas((v) => !v)}
            className="text-sm font-medium text-muted-foreground underline"
          >
            {mostrarInativas ? "Ocultar" : "Mostrar"} contas inativas ({inativas.length})
          </button>
          {mostrarInativas && (
            <ul className={`mt-2 divide-y divide-border ${cardClassName}`}>
              {inativas.map((conta) => (
                <li
                  key={conta.id}
                  className="group flex items-center justify-between px-4 py-3 text-sm text-muted-foreground"
                >
                  <span>{conta.nome}</span>
                  <div className="flex items-center gap-4">
                    <span>{formatarMoeda(conta.saldoAtual)}</span>
                    <button
                      type="button"
                      onClick={() => abrirEdicao(conta)}
                      className="text-muted-foreground underline hover:text-foreground"
                    >
                      Reativar/editar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ContaFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        conta={contaEditando}
      />
      <ExcluirContaDialog
        open={!!contaExcluindo}
        onClose={() => setContaExcluindo(null)}
        conta={contaExcluindo}
      />
    </section>
  );
}
