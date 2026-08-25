import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listarContas, type Conta } from "@/api/contas";
import { Card } from "@/components/ui/Card";
import { Valor } from "@/components/ui/Valor";
import { ContaFormModal } from "@/components/contas/ContaFormModal";

export function SaldoPorContasCard() {
  const { data: contasData, isLoading } = useQuery({
    queryKey: ["contas", "ativas"],
    queryFn: () => listarContas(false),
  });

  const contas = useMemo(
    () => [...(contasData ?? [])].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [contasData],
  );

  const [contaEditando, setContaEditando] = useState<Conta | null>(null);

  return (
    <Card className="p-4">
      <h3 className="mb-2 text-sm font-semibold text-foreground">
        Saldo por conta
      </h3>
      {isLoading || !contasData ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : contas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
      ) : (
        <ul className="divide-y divide-border text-sm">
          {contas.map((conta) => (
            <li key={conta.id} className="group flex items-center justify-between py-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-foreground/80">{conta.nome}</span>
                <button
                  type="button"
                  onClick={() => setContaEditando(conta)}
                  className="hidden shrink-0 text-xs text-primary underline group-hover:inline"
                >
                  Editar
                </button>
              </span>
              <div className="flex items-center gap-2">
                {conta.saldoAtual < 0 && (
                  <span title="Saldo negativo">
                    <TriangleAlert className="size-3.5 text-money-alert" />
                  </span>
                )}
                <Valor valor={conta.saldoAtual} saldo className="font-medium" />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ContaFormModal
        open={!!contaEditando}
        onClose={() => setContaEditando(null)}
        conta={contaEditando}
      />
    </Card>
  );
}
