import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { listarTransacoesMes, type ItemCategoriaResumo } from "@/api/transacoes";
import { formatarData, formatarMoeda } from "@/lib/format";
import { OUTROS_COR } from "@/lib/chartPalette";
import { categoryColor } from "@/lib/categoryColor";
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
  contaIds?: string[];
}

const LIMITE_FATIAS = 8;

export function CategoriaDrilldownChart({ dados, tipo, ano, mes, contaIds }: CategoriaDrilldownChartProps) {
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
    // Nos níveis de grupo/subgrupo não há categoriaId próprio (só existe nas folhas) —
    // sem esse fallback para a chave do item, todo grupo caía no cinza de "sem categoria".
    ...principais.map((d) => ({ ...d, cor: categoryColor(d.categoriaId ?? d.chave) })),
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

  function resetar() {
    setPilha([{ tipo: "raiz" }]);
    setCategoriaSelecionada(null);
  }

  const podeVoltar = pilha.length > 1 || categoriaSelecionada !== null;
  const centerLabel = tipo === "DESPESA" ? "Saiu" : "Entrou";
  const nomeMes = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(
    new Date(Date.UTC(ano, mes - 1, 1)),
  );
  const nivel1Titulo = tipo === "DESPESA" ? "Para onde foi" : "De onde veio";
  const nivel1Subtitulo =
    tipo === "DESPESA"
      ? `Despesas de ${nomeMes} por categoria`
      : `Receitas de ${nomeMes} por origem`;
  const voltarTexto = tipo === "DESPESA" ? "← Todas as categorias" : "← Todas as origens";
  const emNivel1 = pilha.length === 1 && !categoriaSelecionada;
  const nivelAtualNome = nivelAtual.tipo === "raiz" ? "" : nivelAtual.nome;

  return (
    <div>
      <div className="mb-1 text-center">
        <h3 className="font-display text-sm font-semibold text-foreground">
          {emNivel1 ? nivel1Titulo : nivelAtualNome}
        </h3>
        <p className="text-xs text-muted-foreground">
          {emNivel1 ? nivel1Subtitulo : `Subcategorias de ${nivelAtualNome}`}
        </p>
      </div>
      {podeVoltar && (
        <button
          type="button"
          onClick={resetar}
          className="mb-1 text-xs font-semibold text-primary hover:underline"
        >
          {voltarTexto}
        </button>
      )}

      {itens.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tipo === "DESPESA" ? "Nenhuma despesa registrada." : "Nenhuma receita registrada."}
        </p>
      ) : (
        <>
          <div className="relative mt-3">
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie
                  data={fatias}
                  dataKey="total"
                  nameKey="nome"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  onClick={(data) => aoClicarItem(data as unknown as ItemGrafico)}
                  cursor={emNivel1 ? "pointer" : "default"}
                >
                  {fatias.map((f) => (
                    <Cell key={f.chave} fill={f.cor} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(valor) =>
                    typeof valor === "number"
                      ? `${formatarMoeda(valor)} (${totalGeral > 0 ? ((valor / totalGeral) * 100).toFixed(0) : 0}%)`
                      : String(valor ?? "")
                  }
                  contentStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
              <span className="num text-sm font-bold text-foreground">{formatarMoeda(totalGeral)}</span>
            </div>
          </div>
          <ul className="mt-1 space-y-0.5">
            {fatias.map((f) => (
              <li
                key={f.chave}
                onClick={() => aoClicarItem(f)}
                className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-muted ${
                  f.folha && emNivel1 === false ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="inline-block size-[9px] shrink-0 rounded-full"
                    style={{ backgroundColor: f.cor }}
                  />
                  <span className="truncate text-sm text-foreground">{f.nome}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="num text-[12.5px] font-semibold text-foreground">
                    {formatarMoeda(f.total)}
                  </span>
                  <span className="w-[34px] shrink-0 text-right text-xs text-muted-foreground">
                    {((f.total / totalGeral) * 100).toFixed(0)}%
                  </span>
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
          contaIds={contaIds}
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
  contaIds?: string[];
}

function TransacoesDaCategoria({
  ano,
  mes,
  tipo,
  categoriaId,
  categoriaNome,
  contaIds,
}: TransacoesDaCategoriaProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["transacoes", "categoria", ano, mes, categoriaId, contaIds],
    queryFn: () =>
      listarTransacoesMes({
        ano,
        mes,
        categoriaIds: categoriaId ? [categoriaId] : undefined,
        contaIds,
      }),
  });

  const transacoes = (data?.dias.flatMap((d) => d.transacoes) ?? []).filter((t) => {
    if (t.tipo !== tipo) return false;
    if (categoriaId === null) return t.categoriaId === null;
    return true;
  });

  return (
    <div className="mt-4 border-t border-border pt-3">
      <h4 className="mb-2 text-[10.5px] font-bold tracking-widest text-muted-foreground uppercase">
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
