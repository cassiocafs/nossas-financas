import { useQuery } from "@tanstack/react-query";
import { listarTransacoesMes } from "@/api/transacoes";
import { formatarData, formatarMoeda } from "@/lib/format";
import { cardClassName } from "@/components/ui/Card";
import { Valor } from "@/components/ui/Valor";

type TipoLancamento = "DESPESA" | "RECEITA";

interface TransacoesDaCategoriaProps {
  ano: number;
  mes: number;
  categoriaId: string | null;
  categoriaNome: string;
  /**
   * Quando informado, mostra só despesas ou só receitas (uso da Home, onde o
   * contexto é um gráfico de pizza de um tipo). Sem `tipo`, mostra despesas e
   * receitas da categoria — que é o que o Orçamento precisa para bater com o
   * `realizado` da linha.
   */
  tipo?: TipoLancamento;
  contaIds?: string[];
  titulo?: string;
}

export function TransacoesDaCategoria({
  ano,
  mes,
  categoriaId,
  categoriaNome,
  tipo,
  contaIds,
  titulo,
}: TransacoesDaCategoriaProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["transacoes", "categoria", ano, mes, categoriaId, tipo ?? null, contaIds ?? null],
    queryFn: () =>
      listarTransacoesMes({
        ano,
        mes,
        categoriaIds: categoriaId ? [categoriaId] : undefined,
        contaIds,
      }),
    enabled: Number.isFinite(ano) && ano > 0,
  });

  const transacoes = (data?.dias.flatMap((d) => d.transacoes) ?? []).filter((t) => {
    // O `realizado` do orçamento exclui transferências; espelhamos isso aqui
    // para o total da lista bater com o número da linha.
    if (t.tipo === "TRANSFERENCIA") return false;
    if (tipo && t.tipo !== tipo) return false;
    if (categoriaId === null) return t.categoriaId === null;
    return true;
  });

  const total = transacoes.reduce((soma, t) => soma + Math.abs(t.valor), 0);

  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-[10.5px] font-bold tracking-widest text-muted-foreground uppercase">
          {titulo ?? `Transações · ${categoriaNome}`}
        </h4>
        {!isLoading && !isError && transacoes.length > 0 && (
          <span className="num shrink-0 text-xs font-semibold text-foreground/70">
            {formatarMoeda(total)}
          </span>
        )}
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : isError ? (
        <p className="text-sm text-money-alert">Não foi possível carregar as transações.</p>
      ) : transacoes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
      ) : (
        <ul className={`divide-y divide-border ${cardClassName}`}>
          {transacoes.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-muted-foreground">
                {formatarData(t.data)} · {t.descricao}
              </span>
              <Valor valor={t.valor} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
