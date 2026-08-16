import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarRegras, type RegraTransacao } from "@/api/regras";
import { RegraFormModal } from "./RegraFormModal";
import { ExcluirRegraDialog } from "./ExcluirRegraDialog";
import { Button } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui/Card";

export function RegrasSection() {
  const { data: regras = [], isLoading } = useQuery({
    queryKey: ["regras"],
    queryFn: listarRegras,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [regraEditando, setRegraEditando] = useState<RegraTransacao | null>(null);
  const [regraExcluindo, setRegraExcluindo] = useState<RegraTransacao | null>(null);

  function abrirEdicao(regra: RegraTransacao) {
    setRegraEditando(regra);
    setFormOpen(true);
  }

  function abrirCriacao() {
    setRegraEditando(null);
    setFormOpen(true);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Regras de inserção</h2>
          <p className="text-sm text-muted-foreground">
            Quando a descrição de uma nova transação bater com uma regra, a conta e a categoria
            são preenchidas automaticamente. Regras também são aprendidas sozinhas conforme você
            registra transações.
          </p>
        </div>
        <Button onClick={abrirCriacao}>Nova regra</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <ul className={`divide-y divide-border ${cardClassName}`}>
          {regras.map((regra) => (
            <li
              key={regra.id}
              className="group flex items-center justify-between px-4 py-3 text-sm"
            >
              <div className="flex flex-col">
                <span className="text-foreground">{regra.descricao}</span>
                <span className="text-xs text-muted-foreground">
                  {regra.conta.nome}
                  {regra.categoria ? ` · ${regra.categoria.nome}` : ""}
                </span>
              </div>
              <div className="hidden gap-2 group-hover:flex">
                <button
                  type="button"
                  onClick={() => abrirEdicao(regra)}
                  className="text-muted-foreground underline hover:text-foreground"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setRegraExcluindo(regra)}
                  className="text-destructive underline hover:text-destructive/80"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
          {regras.length === 0 && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              Nenhuma regra cadastrada ainda.
            </li>
          )}
        </ul>
      )}

      <RegraFormModal open={formOpen} onClose={() => setFormOpen(false)} regra={regraEditando} />
      <ExcluirRegraDialog
        open={!!regraExcluindo}
        onClose={() => setRegraExcluindo(null)}
        regra={regraExcluindo}
      />
    </section>
  );
}
