import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ExcluirContaUsuarioDialog } from "@/components/configuracoes/ExcluirContaUsuarioDialog";

export function ExcluirContaUsuarioCard() {
  const [aberto, setAberto] = useState(false);

  return (
    <Card className="p-6 sm:col-span-2">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-destructive/10 text-destructive">
          <AlertTriangle className="size-4" />
        </span>
        <h3 className="font-display text-sm font-bold text-foreground">Excluir conta</h3>
      </div>
      <p className="mt-3.5 text-xs leading-relaxed text-muted-foreground">
        Exclui permanentemente sua conta e todos os dados vinculados a ela (contas,
        transações, categorias, orçamentos e regras). Essa ação não pode ser desfeita.
      </p>
      <Button
        variant="destructive"
        size="sm"
        className="mt-4"
        onClick={() => setAberto(true)}
      >
        Excluir minha conta
      </Button>

      <ExcluirContaUsuarioDialog open={aberto} onClose={() => setAberto(false)} />
    </Card>
  );
}
