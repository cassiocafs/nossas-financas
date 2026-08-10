import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarContas } from "@/api/contas";
import { sugerirCategoria } from "@/api/categorias";
import {
  criarTransacao,
  criarTransferencia,
  editarTransacao,
  excluirTransacao,
  type Transacao,
  type TipoTransacao,
} from "@/api/transacoes";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { CategoriaAutocomplete } from "./CategoriaAutocomplete";
import { ContaAutocomplete } from "./ContaAutocomplete";

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface TransacaoFormInlineProps {
  transacao?: Transacao | null;
  contaIdPadrao?: string;
  onSaved: () => void;
  onCancel: () => void;
}

export function TransacaoFormInline({
  transacao,
  contaIdPadrao,
  onSaved,
  onCancel,
}: TransacaoFormInlineProps) {
  const queryClient = useQueryClient();
  const isEdicaoTransferencia = !!transacao?.transferenciaGrupoId;
  const editando = !!transacao;

  const { data: contasData = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: () => listarContas(false),
  });
  const contas = useMemo(
    () => [...contasData].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    [contasData],
  );

  const [tipo, setTipo] = useState<TipoTransacao>(transacao?.tipo ?? "DESPESA");
  const [data, setData] = useState(transacao?.data ?? hojeISO());
  const [descricao, setDescricao] = useState(transacao?.descricao ?? "");
  const [contaId, setContaId] = useState(transacao?.contaId ?? contaIdPadrao ?? "");
  const [categoriaId, setCategoriaId] = useState(transacao?.categoriaId ?? "");
  const [categoriaTocada, setCategoriaTocada] = useState(editando);
  const [valor, setValor] = useState(transacao ? Math.abs(transacao.valor) : 0);
  const [consolidado, setConsolidado] = useState(transacao ? transacao.consolidado : true);
  const [nota, setNota] = useState(transacao?.nota ?? "");
  const [contaOrigemId, setContaOrigemId] = useState("");
  const [contaDestinoId, setContaDestinoId] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isEdicaoTransferencia || tipo === "TRANSFERENCIA" || categoriaTocada) return;
    if (!descricao.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const sugestao = await sugerirCategoria(descricao.trim());
        if (sugestao.categoriaId && !categoriaTocada) {
          setCategoriaId(sugestao.categoriaId);
        }
      } catch {
        // sugestão é best-effort, ignora falha
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descricao]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdicaoTransferencia && tipo === "TRANSFERENCIA") {
        return editarTransacao(transacao!.id, { data, descricao, nota, consolidado });
      }
      if (tipo === "TRANSFERENCIA") {
        if (editando) await excluirTransacao(transacao!.id);
        return criarTransferencia({
          data,
          descricao,
          contaOrigemId,
          contaDestinoId,
          valor,
          consolidado,
          nota,
        });
      }
      const payload = {
        tipo,
        data,
        descricao,
        contaId,
        categoriaId: categoriaId || null,
        valor,
        consolidado,
        nota,
      };
      if (isEdicaoTransferencia) {
        await excluirTransacao(transacao!.id);
        return criarTransacao(payload);
      }
      return editando ? editarTransacao(transacao!.id, payload) : criarTransacao(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      onSaved();
    },
  });

  const campoClasse =
    "rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground";

  const TIPOS = [
    { valor: "DESPESA", label: "Despesa", tone: "text-expense" },
    { valor: "RECEITA", label: "Receita", tone: "text-income" },
    { valor: "TRANSFERENCIA", label: "Transferência", tone: "text-transfer" },
  ] as const;

  return (
    <div className="card-surface">
      <div className="flex items-center justify-between gap-3 rounded-t-2xl border-b border-border bg-muted px-3 py-2">
        <div className="flex items-center gap-1 rounded-xl bg-background p-1">
          {TIPOS.map(({ valor: t, label, tone }) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                tipo === t ? `card-surface ${tone}` : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {!editando && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="text-foreground/40 hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-wrap items-center gap-2 px-3 py-2"
      >
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className={`w-[145px] shrink-0 ${campoClasse}`}
        />

        <input
          autoFocus
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descrição"
          className={`min-w-[140px] flex-1 ${campoClasse}`}
        />

        {tipo === "TRANSFERENCIA" ? (
          isEdicaoTransferencia ? (
            <select
              value={transacao!.contaId}
              disabled
              className={`w-[150px] shrink-0 ${campoClasse}`}
            >
              <option value={transacao!.contaId}>{transacao!.conta.nome}</option>
            </select>
          ) : (
            <>
              <select
                value={contaOrigemId}
                onChange={(e) => setContaOrigemId(e.target.value)}
                className={`w-[150px] shrink-0 ${campoClasse}`}
              >
                <option value="">Conta origem</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <select
                value={contaDestinoId}
                onChange={(e) => setContaDestinoId(e.target.value)}
                className={`w-[150px] shrink-0 ${campoClasse}`}
              >
                <option value="">Conta destino</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </>
          )
        ) : (
          <>
            <div className="w-[170px] shrink-0">
              <CategoriaAutocomplete
                value={categoriaId}
                onChange={(v) => {
                  setCategoriaId(v);
                  setCategoriaTocada(true);
                }}
              />
            </div>
            <div className="w-[150px] shrink-0">
              <ContaAutocomplete value={contaId} onChange={setContaId} contas={contas} />
            </div>
          </>
        )}

        <div className="w-[130px] shrink-0">
          <CurrencyInput
            value={valor}
            onChange={setValor}
            disabled={isEdicaoTransferencia && tipo === "TRANSFERENCIA"}
          />
        </div>

        <label
          className="flex shrink-0 items-center gap-1 text-foreground/70"
          title="Consolidado"
        >
          <input
            type="checkbox"
            checked={consolidado}
            onChange={(e) => setConsolidado(e.target.checked)}
            className="accent-primary"
          />
        </label>

        {editando && (
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Nota (opcional)"
            className={`min-w-[160px] flex-1 basis-full ${campoClasse}`}
          />
        )}

        {mutation.isError && (
          <span className="text-xs text-destructive">
            {mutation.error instanceof Error ? mutation.error.message : "Erro ao salvar"}
          </span>
        )}

        {editando && (
          <Button type="button" variant="ghost" onClick={onCancel} className="shrink-0">
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending} className="shrink-0">
          {mutation.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </div>
  );
}
