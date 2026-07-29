import { useQuery } from "@tanstack/react-query";
import { listarContas } from "@/api/contas";
import { Card } from "@/components/ui/Card";
import { Valor } from "@/components/ui/Valor";

export function SaldoPorContasCard() {
  const { data: contas, isLoading } = useQuery({
    queryKey: ["contas", "ativas"],
    queryFn: () => listarContas(false),
  });

  return (
    <Card className="p-4">
      <h3 className="mb-2 font-display text-sm font-semibold text-ink dark:text-paper">
        Saldo por conta
      </h3>
      {isLoading || !contas ? (
        <p className="text-sm text-ink/50 dark:text-paper/50">Carregando...</p>
      ) : contas.length === 0 ? (
        <p className="text-sm text-ink/50 dark:text-paper/50">Nenhuma conta cadastrada.</p>
      ) : (
        <ul className="divide-y divide-line text-sm dark:divide-line-night">
          {contas.map((conta) => (
            <li key={conta.id} className="flex items-center justify-between py-2">
              <span className="text-ink/80 dark:text-paper/80">{conta.nome}</span>
              <div className="flex items-center gap-2">
                {conta.saldoAtual < 0 && (
                  <span
                    className="text-xs text-vermelho dark:text-vermelho-night"
                    title="Saldo negativo"
                  >
                    ⚠
                  </span>
                )}
                <Valor valor={conta.saldoAtual} className="font-medium" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
