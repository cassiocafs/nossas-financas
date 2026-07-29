import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarContas } from "@/api/contas";
import { sugerirCategoria } from "@/api/categorias";
import {
  criarTransacao,
  criarTransferencia,
  editarTransacao,
  type Transacao,
  type TipoTransacao,
} from "@/api/transacoes";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Button } from "@/components/ui/Button";
import { CategoriaAutocomplete } from "./CategoriaAutocomplete";

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface TransacaoFormInlineProps {
  transacao?: Transacao | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function TransacaoFormInline({ transacao, onSaved, onCancel }: TransacaoFormInlineProps) {
  const queryClient = useQueryClient();
  const isEdicaoTransferencia = !!transacao?.transferenciaGrupoId;
  const editando = !!transacao;

  const { data: contas = [] } = useQuery({
    queryKey: ["contas"],
    queryFn: () => listarContas(false),
  });

  const [tipo, setTipo] = useState<TipoTransacao>(transacao?.tipo ?? "DESPESA");
  const [data, setData] = useState(transacao?.data ?? hojeISO());
  const [descricao, setDescricao] = useState(transacao?.descricao ?? "");
  const [contaId, setContaId] = useState(transacao?.contaId ?? "");
  const [categoriaId, setCategoriaId] = useState(transacao?.categoriaId ?? "");
  const [categoriaTocada, setCategoriaTocada] = useState(editando);
  const [valor, setValor] = useState(transacao ? Math.abs(transacao.valor) : 0);
  const [consolidado, setConsolidado] = useState(transacao?.consolidado ?? false);
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
      if (isEdicaoTransferencia) {
        return editarTransacao(transacao!.id, { data, descricao, nota, consolidado });
      }
      if (tipo === "TRANSFERENCIA") {
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
      return editando ? editarTransacao(transacao!.id, payload) : criarTransacao(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      onSaved();
    },
  });

  return (
    <div className="space-y-3 border border-line bg-surface p-4 dark:border-line-night dark:bg-surface-night">
      {!isEdicaoTransferencia && !editando && (
        <div className="flex gap-2">
          {(["DESPESA", "RECEITA", "TRANSFERENCIA"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`px-3 py-1 text-sm font-medium ${
                tipo === t
                  ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                  : "bg-ink/5 text-ink/70 dark:bg-white/5 dark:text-paper/70"
              }`}
            >
              {t === "DESPESA" ? "Despesa" : t === "RECEITA" ? "Receita" : "Transferência"}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink/50 dark:text-paper/50">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/50 dark:text-paper/50">Valor</label>
          <CurrencyInput
            value={valor}
            onChange={setValor}
            disabled={isEdicaoTransferencia}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink/50 dark:text-paper/50">Descrição</label>
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
        />
      </div>

      {tipo === "TRANSFERENCIA" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink/50 dark:text-paper/50">Conta de origem</label>
            <select
              value={isEdicaoTransferencia ? transacao!.contaId : contaOrigemId}
              disabled={isEdicaoTransferencia}
              onChange={(e) => setContaOrigemId(e.target.value)}
              className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
            >
              <option value="">Selecione</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/50 dark:text-paper/50">Conta de destino</label>
            <select
              value={contaDestinoId}
              disabled={isEdicaoTransferencia}
              onChange={(e) => setContaDestinoId(e.target.value)}
              className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
            >
              <option value="">Selecione</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink/50 dark:text-paper/50">Conta</label>
            <select
              value={contaId}
              disabled={isEdicaoTransferencia}
              onChange={(e) => setContaId(e.target.value)}
              className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
            >
              <option value="">Selecione</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/50 dark:text-paper/50">Categoria</label>
            <CategoriaAutocomplete
              value={categoriaId}
              disabled={isEdicaoTransferencia}
              onChange={(v) => {
                setCategoriaId(v);
                setCategoriaTocada(true);
              }}
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-ink/50 dark:text-paper/50">Nota</label>
        <input
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/80 dark:text-paper/80">
        <input
          type="checkbox"
          checked={consolidado}
          onChange={(e) => setConsolidado(e.target.checked)}
          className="accent-ink dark:accent-paper"
        />
        Consolidado
      </label>

      {mutation.isError && (
        <p className="text-sm text-vermelho dark:text-vermelho-night">
          {mutation.error instanceof Error ? mutation.error.message : "Erro ao salvar"}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
