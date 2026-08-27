import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Wallet, Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarContas,
  editarConta,
  excluirConta,
  buscarImpactoExclusaoConta,
  type Conta,
} from "@/api/contas";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CategoriasSidebar } from "@/components/categorias/CategoriasSidebar";
import { ContaFormModal } from "@/components/contas/ContaFormModal";
import { useAccountFilter } from "@/contexts/AccountFilterContext";
import { formatarMoeda } from "@/lib/format";

function parseMoedaPtBr(texto: string): number | null {
  const limpo = texto.trim().replace(/\./g, "").replace(",", ".");
  const valor = Number(limpo);
  return Number.isFinite(valor) ? valor : null;
}

interface ContaMenuProps {
  onEditar: () => void;
  onExcluir: () => void;
  onClose: () => void;
}

function ContaMenu({ onEditar, onExcluir, onClose }: ContaMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function aoPressionarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [onClose]);

  const itemClassName =
    "flex w-full items-center gap-2 rounded-sm px-[9px] py-[7px] text-left text-[11.5px] leading-[1.3] font-medium";

  return (
    <div
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      className="absolute top-9 right-2 z-[60] min-w-[150px] rounded-lg border border-border bg-card p-[5px] shadow-lg"
    >
      <button
        type="button"
        onClick={onEditar}
        className={`${itemClassName} text-foreground hover:bg-accent`}
      >
        <Pencil className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
        Editar conta
      </button>
      <button
        type="button"
        onClick={onExcluir}
        className={`${itemClassName} text-error-600 hover:bg-error-100`}
      >
        <Trash2 className="size-3.5 shrink-0 text-error-600" aria-hidden="true" />
        Excluir conta
      </button>
      <button
        type="button"
        onClick={onClose}
        className={`${itemClassName} text-muted-foreground hover:bg-accent`}
      >
        Cancelar
      </button>
    </div>
  );
}

export function AccountsSidebar() {
  const queryClient = useQueryClient();
  const { contasSelecionadasIds, alternarContaSelecionada } = useAccountFilter();
  const { data: contas } = useQuery({
    queryKey: ["contas", "ativas"],
    queryFn: () => listarContas(false),
  });

  const [menuAbertoId, setMenuAbertoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [rascunho, setRascunho] = useState("");
  const [excluindoConta, setExcluindoConta] = useState<Conta | null>(null);
  const [novaContaAberta, setNovaContaAberta] = useState(false);

  const editarMutation = useMutation({
    mutationFn: ({ id, saldoInicial }: { id: string; saldoInicial: number }) =>
      editarConta(id, { saldoInicial }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      setEditandoId(null);
    },
  });

  const { data: impacto } = useQuery({
    queryKey: ["contas", "impacto-exclusao", excluindoConta?.id],
    queryFn: () => buscarImpactoExclusaoConta(excluindoConta!.id),
    enabled: !!excluindoConta,
  });

  const excluirMutation = useMutation({
    mutationFn: (id: string) => excluirConta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas"] });
      setExcluindoConta(null);
    },
  });

  function abrirMenu(e: MouseEvent<HTMLButtonElement>, conta: Conta) {
    e.stopPropagation();
    if (editandoId) return;
    setMenuAbertoId((atual) => (atual === conta.id ? null : conta.id));
  }

  function iniciarEdicao(conta: Conta) {
    setEditandoId(conta.id);
    setRascunho(
      conta.saldoInicial.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    );
  }

  function salvarEdicao(conta: Conta) {
    const valor = parseMoedaPtBr(rascunho);
    if (valor === null) {
      setEditandoId(null);
      return;
    }
    editarMutation.mutate({ id: conta.id, saldoInicial: valor });
  }

  return (
    <aside className="flex min-h-0 w-[288px] shrink-0 flex-col gap-5 border-r border-border bg-card p-3.5 pt-5">
      <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Suas contas
      </p>

      <ul className="scrollbar-thin flex max-h-[40%] min-h-0 shrink-0 flex-col gap-2 overflow-y-auto pr-1">
        {(contas ?? []).map((conta) => {
          const selecionada = contasSelecionadasIds.includes(conta.id);
          return (
          <li
            key={conta.id}
            onClick={() => {
              if (editandoId) return;
              alternarContaSelecionada(conta.id);
            }}
            aria-pressed={selecionada}
            className={`group relative cursor-pointer rounded-lg border px-3.5 py-2.5 shadow-soft transition-[background-color,border-color,box-shadow,color] duration-150 ease-out hover:border-primary hover:shadow-lift ${
              selecionada ? "border-primary bg-primary/5 shadow-lift" : "border-border"
            }`}
          >
            <div className="flex items-center gap-2">
              <Wallet className="size-[14px] shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 truncate text-[12px] leading-[1.2] font-bold whitespace-nowrap text-foreground">
                {conta.nome}
              </span>
              <span className="num flex-1 text-right text-[12px] leading-[1.2] font-medium whitespace-nowrap text-foreground">
                {formatarMoeda(conta.saldoAtual)}
              </span>
              <button
                type="button"
                aria-label="Opções da conta"
                onClick={(e) => abrirMenu(e, conta)}
                className="shrink-0 rounded-md p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
              >
                <Pencil className="size-3" aria-hidden="true" />
              </button>
            </div>

            {editandoId === conta.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 space-y-2 border-t border-muted pt-2.5"
              >
                <label className="block text-[12.5px] text-muted-foreground">
                  Saldo inicial
                  <input
                    autoFocus
                    value={rascunho}
                    onChange={(e) => setRascunho(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-muted px-2 py-1 text-[12.5px] text-foreground"
                  />
                </label>
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditandoId(null)}
                    className="h-7 rounded-md px-3 text-[11.5px] font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => salvarEdicao(conta)}
                    disabled={editarMutation.isPending}
                    className="h-7 rounded-md bg-primary px-3 text-[11.5px] font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}

            {menuAbertoId === conta.id && (
              <ContaMenu
                onEditar={() => {
                  setMenuAbertoId(null);
                  iniciarEdicao(conta);
                }}
                onExcluir={() => {
                  setMenuAbertoId(null);
                  setExcluindoConta(conta);
                }}
                onClose={() => setMenuAbertoId(null)}
              />
            )}
          </li>
          );
        })}
      </ul>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setNovaContaAberta(true)}
        className="h-9 w-full gap-1.5"
      >
        <Plus className="size-4" />
        Nova conta
      </Button>

      <CategoriasSidebar />

      <ContaFormModal open={novaContaAberta} onClose={() => setNovaContaAberta(false)} />

      <ConfirmDialog
        open={!!excluindoConta}
        onClose={() => setExcluindoConta(null)}
        onConfirm={() => excluindoConta && excluirMutation.mutate(excluindoConta.id)}
        title="Excluir conta"
        confirmLabel="Excluir"
        confirmando={excluirMutation.isPending}
      >
        {impacto && impacto.transacoesVinculadas > 0 ? (
          <>
            Esta conta tem <strong>{impacto.transacoesVinculadas}</strong> transação(ões)
            vinculada(s). Excluir a conta também removerá essas transações. Esta ação não pode ser
            desfeita.
          </>
        ) : (
          <>Tem certeza que deseja excluir a conta "{excluindoConta?.nome}"? Esta ação não pode ser desfeita.</>
        )}
      </ConfirmDialog>
    </aside>
  );
}
