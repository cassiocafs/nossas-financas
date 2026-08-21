import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { listarTransacoesMes, type ItemCategoriaResumo } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { DonutChart } from '@/components/ui/DonutChart';
import { ChartColors, Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';
import { formatarData } from '@/lib/format';

type Nivel =
  | { tipo: 'raiz' }
  | { tipo: 'grupo'; id: string; nome: string }
  | { tipo: 'subgrupo'; grupoId: string; id: string; nome: string }
  | { tipo: 'outros'; nome: string; itens: ItemGrafico[] };

interface ItemGrafico {
  chave: string;
  nome: string;
  total: number;
  folha: boolean;
  categoriaId?: string | null;
  proximoNivel?: Nivel;
}

function itensDoNivel(dados: ItemCategoriaResumo[], nivel: Nivel): ItemGrafico[] {
  if (nivel.tipo === 'outros') {
    return nivel.itens;
  }

  if (nivel.tipo === 'raiz') {
    const porGrupo = new Map<string, { nome: string; total: number }>();
    const soltos: ItemGrafico[] = [];
    for (const item of dados) {
      if (item.grupoId) {
        const atual = porGrupo.get(item.grupoId) ?? { nome: item.grupoNome ?? '', total: 0 };
        atual.total += item.total;
        porGrupo.set(item.grupoId, atual);
      } else {
        soltos.push({
          chave: item.categoriaId ?? 'sem-categoria',
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
      proximoNivel: { tipo: 'grupo', id, nome: v.nome },
    }));
    return [...grupos, ...soltos];
  }

  if (nivel.tipo === 'grupo') {
    const doGrupo = dados.filter((d) => d.grupoId === nivel.id);
    const porSubgrupo = new Map<string, { nome: string; total: number }>();
    const soltos: ItemGrafico[] = [];
    for (const item of doGrupo) {
      if (item.subgrupoId) {
        const atual = porSubgrupo.get(item.subgrupoId) ?? { nome: item.subgrupoNome ?? '', total: 0 };
        atual.total += item.total;
        porSubgrupo.set(item.subgrupoId, atual);
      } else {
        soltos.push({
          chave: item.categoriaId ?? 'sem-categoria',
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
      proximoNivel: { tipo: 'subgrupo', grupoId: nivel.id, id, nome: v.nome },
    }));
    return [...subgrupos, ...soltos];
  }

  return dados
    .filter((d) => d.subgrupoId === nivel.id)
    .map((item) => ({
      chave: item.categoriaId ?? 'sem-categoria',
      nome: item.categoriaNome,
      total: item.total,
      folha: true,
      categoriaId: item.categoriaId,
    }));
}

interface CategoriaDrilldownChartProps {
  titulo: string;
  dados: ItemCategoriaResumo[];
  tipo: 'DESPESA' | 'RECEITA';
  ano: number;
  mes: number;
}

const LIMITE_FATIAS = 8;

export function CategoriaDrilldownChart({ titulo, dados, tipo, ano, mes }: CategoriaDrilldownChartProps) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();
  const [pilha, setPilha] = useState<Nivel[]>([{ tipo: 'raiz' }]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<{ id: string | null; nome: string } | null>(
    null,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta a navegação do drill-down ao trocar de mês
    setPilha([{ tipo: 'raiz' }]);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta a navegação do drill-down ao trocar de mês
    setCategoriaSelecionada(null);
  }, [ano, mes]);

  const nivelAtual = pilha[pilha.length - 1];
  const itens = itensDoNivel(dados, nivelAtual);

  const semCategoria = itens.find((i) => i.categoriaId === null);
  const demais = itens.filter((i) => i !== semCategoria);

  const ordenado = [...demais].sort((a, b) => b.total - a.total);
  const principais = ordenado.slice(0, LIMITE_FATIAS);
  const resto = ordenado.slice(LIMITE_FATIAS);
  const totalOutros = resto.reduce((soma, d) => soma + d.total, 0);

  const fatias = [
    ...principais.map((d, i) => ({ ...d, cor: ChartColors[i % ChartColors.length] })),
    ...(totalOutros > 0
      ? [
          {
            chave: 'outros',
            nome: 'Outros',
            total: totalOutros,
            folha: false,
            cor: theme.textTertiary,
          } satisfies ItemGrafico & { cor: string },
        ]
      : []),
    ...(semCategoria ? [{ ...semCategoria, cor: theme.textTertiary }] : []),
  ];

  const totalGeral = fatias.reduce((soma, f) => soma + f.total, 0);

  function aoClicarItem(item: ItemGrafico) {
    if (item.chave === 'outros') {
      setPilha((p) => [...p, { tipo: 'outros', nome: 'Outros', itens: resto }]);
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

  function aoClicarChave(chave: string) {
    const item = fatias.find((f) => f.chave === chave);
    if (item) aoClicarItem(item);
  }

  function voltar() {
    if (categoriaSelecionada) {
      setCategoriaSelecionada(null);
      return;
    }
    setPilha((p) => (p.length > 1 ? p.slice(0, -1) : p));
  }

  function resetar() {
    setPilha([{ tipo: 'raiz' }]);
    setCategoriaSelecionada(null);
  }

  const podeVoltar = pilha.length > 1 || categoriaSelecionada !== null;
  const caminho = pilha
    .slice(1)
    .map((n) => (n.tipo === 'raiz' ? '' : n.nome))
    .join(' › ');

  return (
    <Card style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerTexto}>
          <ThemedText type="smallBold">{titulo}</ThemedText>
          {caminho !== '' && (
            <ThemedText type="small" themeColor="textSecondary">
              {caminho}
            </ThemedText>
          )}
        </ThemedView>
        {podeVoltar && (
          <ThemedView style={styles.headerAcoes}>
            <Pressable onPress={voltar} style={[styles.botao, { borderColor: theme.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                ← Voltar
              </ThemedText>
            </Pressable>
            <Pressable onPress={resetar} style={[styles.botao, { borderColor: theme.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Resetar
              </ThemedText>
            </Pressable>
          </ThemedView>
        )}
      </ThemedView>

      {itens.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.vazio}>
          {tipo === 'DESPESA' ? 'Nenhuma despesa registrada.' : 'Nenhuma receita registrada.'}
        </ThemedText>
      ) : (
        <>
          <ThemedView style={styles.grafico}>
            <DonutChart
              size={200}
              fatias={fatias.map((f) => ({ chave: f.chave, valor: f.total, cor: f.cor }))}
              onPressFatia={aoClicarChave}
            />
            <ThemedView style={styles.centro} pointerEvents="none">
              <ThemedText type="smallBold" numeric>
                {formatarValor(totalGeral)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.legenda}>
            {fatias.map((f) => (
              <Pressable key={f.chave} onPress={() => aoClicarItem(f)} style={styles.legendaLinha}>
                <ThemedView style={styles.legendaNome}>
                  <ThemedView style={[styles.legendaCor, { backgroundColor: f.cor }]} />
                  <ThemedText type="small" style={styles.legendaTexto} numberOfLines={1}>
                    {f.nome}
                    {!f.folha ? ' ›' : ''}
                  </ThemedText>
                </ThemedView>
                <ThemedText type="small" numeric themeColor="textSecondary">
                  {formatarValor(f.total)} ({totalGeral > 0 ? ((f.total / totalGeral) * 100).toFixed(0) : 0}%)
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
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
    </Card>
  );
}

interface TransacoesDaCategoriaProps {
  ano: number;
  mes: number;
  tipo: 'DESPESA' | 'RECEITA';
  categoriaId: string | null;
  categoriaNome: string;
}

function TransacoesDaCategoria({ ano, mes, tipo, categoriaId, categoriaNome }: TransacoesDaCategoriaProps) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();
  const { data, isLoading } = useQuery({
    queryKey: ['transacoes', 'categoria', ano, mes, categoriaId],
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
    <ThemedView style={[styles.transacoes, { borderTopColor: theme.border }]}>
      <ThemedText type="caption" themeColor="textSecondary">
        Transações · {categoriaNome}
      </ThemedText>
      {isLoading ? (
        <ThemedText type="small" themeColor="textSecondary">
          Carregando...
        </ThemedText>
      ) : transacoes.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nenhuma transação encontrada.
        </ThemedText>
      ) : (
        <ThemedView style={styles.transacoesLista}>
          {transacoes.map((t) => (
            <ThemedView key={t.id} type="surface" style={styles.transacaoLinha}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.transacaoDescricao} numberOfLines={1}>
                {formatarData(t.data)} · {t.descricao}
              </ThemedText>
              <ThemedText type="smallBold" numeric>
                {formatarValor(t.valor)}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  headerTexto: { flex: 1, gap: 2 },
  headerAcoes: { flexDirection: 'row', gap: Spacing.two, flexShrink: 0 },
  botao: { borderWidth: 1, borderRadius: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: 4 },
  vazio: { paddingVertical: Spacing.four, textAlign: 'center' },
  grafico: { alignItems: 'center', justifyContent: 'center' },
  centro: { position: 'absolute', alignItems: 'center' },
  legenda: { gap: Spacing.one },
  legendaLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, paddingVertical: 2 },
  legendaNome: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaCor: { width: 8, height: 8, borderRadius: 4 },
  legendaTexto: { flex: 1 },
  transacoes: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three, gap: Spacing.two },
  transacoesLista: { gap: Spacing.one },
  transacaoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, borderRadius: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: Spacing.two },
  transacaoDescricao: { flex: 1 },
});
