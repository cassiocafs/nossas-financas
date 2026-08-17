import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { listarTransacoesMes, type ItemCategoriaResumo } from "@/api/transacoes";
import { formatarData, formatarMoeda } from "@/lib/format";
import { CATEGORICAL_PALETTE, OUTROS_COR } from "@/lib/chartPalette";
import { cardClassName } from "@/components/ui/Card";
import { Valor } from "@/components/ui/Valor";

type Nivel =
  | { tipo: "raiz" }
  | { tipo: "grupo"; id: string; nome: string }
  | { tipo: "subgrupo"; grupoId: string; id: string; nome: string }
  | { tipo: "outros"; nome: string; itens: ItemGrafico[] };

interface ItemGrafico {
  chave: string;
  nome: string;
  total: number;
  folha: boolean;
  categoriaId?: string | null;
  proximoNivel?: Nivel;
}

function itensDoNivel(dados: ItemCategoriaResumo[], nivel: Nivel): ItemGrafico[] {
  if (nivel.tipo === "outros") {
    return nivel.itens;
  }

  if (nivel.tipo === "raiz") {
    const porGrupo = new Map<string, { nome: string; total: number }>();
    const soltos: ItemGrafico[] = [];
    for (const item of dados) {
      if (item.grupoId) {
        const atual = porGrupo.get(item.grupoId) ?? { nome: item.grupoNome ?? "", total: 0 };
        atual.total += item.total;
        porGrupo.set(item.grupoId, atual);
      } else {
        soltos.push({
          chave: item.categoriaId ?? "sem-categoria",
          nome: item.categoriaNome,
          total: item.total,
          folha: true,
          categoriaId: item.categoriaId,
        });
      }
    }
    const grupos: ItemGrafico[] = Array.from(porGrupo.entries()).map(([id, v]) => ({
      chave: id,
      nome: v.nome,
      total: v.total,
      folha: false,
      proximoNivel: { tipo: "grupo", id, nome: v.nome },
    }));
    return [...grupos, ...soltos];
  }

  if (nivel.tipo === "grupo") {
    const doGrupo = dados.filter((d) => d.grupoId === nivel.id);
    const porSubgrupo = new Map<string, { nome: string; total: number }>();
    const soltos: ItemGrafico[] = [];
    for (const item of doGrupo) {
      if (item.subgrupoId) {
        const atual = porSubgrupo.get(item.subgrupoId) ?? {
          nome: item.subgrupoNome ?? "",
          total: 0,
        };
        atual.total += item.total;
        porSubgrupo.set(item.subgrupoId, atual);
      } else {
        soltos.push({
          chave: item.categoriaId ?? "sem-categoria",
          nome: item.categoriaNome,
          total: item.total,
          folha: true,
          categoriaId: item.categoriaId,
        });
      }
    }
    const subgrupos: ItemGrafico[] = Array.from(porSubgrupo.entries()).map(([id, v]) => ({
      chave: id,
      nome: v.nome,
      total: v.total,
      folha: false,
      proximoNivel: { tipo: "subgrupo", grupoId: nivel.id, id, nome: v.nome },
    }));
    return [...subgrupos, ...soltos];
  }

  return dados
    .filter((d) => d.subgrupoId === nivel.id)
    .map((item) => ({
      chave: item.categoriaId ?? "sem-categoria",
      nome: item.categoriaNome,
      total: item.total,
      folha: true,
      categoriaId: item.categoriaId,
    }));
}

interface CategoriaDrilldownChartProps {
  dados: ItemCategoriaResumo[];
  tipo: "DESPESA" | "RECEITA";
  ano: number;
  mes: number;
}

const LIMITE_FATIAS = 8;

export function CategoriaDrilldownChart({ dados, tipo, ano, mes }: CategoriaDrilldownChartProps) {
  const [pilha, setPilha] = useState<Nivel[]>([{ tipo: "raiz" }]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<{
    id: string | null;
    nome: string;
  } | null>(null);

  useEffect(() => {
    setPilha([{ tipo: "raiz" }]);
    setCategoriaSelecionada(null);
  }, [ano, mes]);

  const nivelAtual = pilha[pilha.length - 1];
  const itens = itensDoNivel(dados, nivelAtual);

  // "Sem Categoria" costuma ter um valor pequeno; se entrasse na truncagem do
  // top-N, seria engolida pela fatia "Outros" (que não é navegável) e o
  // usuário perderia a única forma de encontrar essas transações no gráfico.
  const semCategoria = itens.find((i) => i.categoriaId === null);
  const demais = itens.filter((i) => i !== semCategoria);

  const ordenado = [...demais].sort((a, b) => b.total - a.total);
  const principais = ordenado.slice(0, LIMITE_FATIAS);
  const resto = ordenado.slice(LIMITE_FATIAS);
  const totalOutros = resto.reduce((soma, d) => soma + d.total, 0);

  const fatias = [
    ...principais.map((d, i) => ({ ...d, cor: CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length] })),
    ...(totalOutros > 0
      ? [
          {
            chave: "outros",
            nome: "Outros",
            total: totalOutros,
            folha: false,
            cor: OUTROS_COR,
          } satisfies ItemGrafico & { cor: string },
        ]
      : []),
    ...(semCategoria ? [{ ...semCategoria, cor: OUTROS_COR }] : []),
  ];

  const totalGeral = fatias.reduce((soma, f) => soma + f.total, 0);

  function aoClicarItem(item: ItemGrafico) {
    if (item.chave === "outros") {
      setPilha((p) => [...p, { tipo: "outros", nome: "Outros", itens: resto }]);
      setCategoriaSelecionada(null);
      return;
    }
    if (!item.folha && item.proximoNivel) {
      setPilha((p) => [...p, item.proximoNivel!]);
      setCategoriaSelecionada(null);
      return;
    }
    setCategoriaSelecionada({ id: item.categoriaId ?? null, nome: item.nome });
  }

  function voltar() {
    if (categoriaSelecionada) {
      setCategoriaSelecionada(null);
      return;
    }
    setPilha((p) => (p.length > 1 ? p.slice(0, -1) : p));
  }

  function resetar() {
    setPilha([{ tipo: "raiz" }]);
    setCategoriaSelecionada(null);
  }

  const podeVoltar = pilha.length > 1 || categoriaSelecionada !== null;
  const titulo = tipo === "DESPESA" ? "Despesas por categoria" : "Receitas por categoria";
  const caminho = pilha
    .slice(1)
    .map((n) => (n.tipo === "raiz" ? "" : n.nome))
    .join(" › ");

  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground">{titulo}</h3>
          {caminho && (
            <p className="text-xs text-muted-foreground">{caminho}</p>
          )}
        </div>
        {podeVoltar && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={voltar}
              className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              ← Voltar
            </button>
            <button
              type="button"
              onClick={resetar}
              className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Resetar
            </button>
          </div>
        )}
      </div>

      {itens.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tipo === "DESPESA" ? "Nenhuma despesa registrada." : "Nenhuma receita registrada."}
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={fatias}
                dataKey="total"
                nameKey="nome"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                onClick={(data) => aoClicarItem(data as unknown as ItemGrafico)}
                cursor="pointer"
              >
                {fatias.map((f) => (
                  <Cell key={f.chave} fill={f.cor} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(valor) => (typeof valor === "number" ? formatarMoeda(valor) : String(valor ?? ""))}
                contentStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {fatias.map((f) => (
              <li
                key={f.chave}
                onClick={() => aoClicarItem(f)}
                className="flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-0.5 hover:bg-muted"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: f.cor }}
                  />
                  <span className="truncate">{f.nome}</span>
                  {!f.folha && <span aria-hidden>›</span>}
                </span>
                <span className="shrink-0 num">
                  {formatarMoeda(f.total)} ({((f.total / totalGeral) * 100).toFixed(0)}%)
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {categoriaSelecionada && (
        <TransacoesDaCategoria
          ano={ano}
          mes={mes}
          tipo={tipo}
          categoriaId={categoriaSelecionada.id}
          categoriaNome={categoriaSelecionada.nome}
        />
      )}
    </div>
  );
}

interface TransacoesDaCategoriaProps {
  ano: number;
  mes: number;
  tipo: "DESPESA" | "RECEITA";
  categoriaId: string | null;
  categoriaNome: string;
}

function TransacoesDaCategoria({
  ano,
  mes,
  tipo,
  categoriaId,
  categoriaNome,
}: TransacoesDaCategoriaProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["transacoes", "categoria", ano, mes, categoriaId],
    queryFn: () =>
      listarTransacoesMes({
        ano,
        mes,
        categoriaIds: categoriaId ? [categoriaId] : undefined,
      }),
  });

  const transacoes = (data?.dias.flatMap((d) => d.transacoes) ?? []).filter((t) => {
    if (t.tipo !== tipo) return false;
    if (categoriaId === null) return t.categoriaId === null;
    return true;
  });

  return (
    <div className="mt-4 border-t border-border pt-3">
      <h4 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Transações · {categoriaNome}
      </h4>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
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
