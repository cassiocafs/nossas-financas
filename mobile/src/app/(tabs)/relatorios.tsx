import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buscarRelatorio } from '@/api/relatorios';
import { buscarResumoMensal, type ItemCategoriaResumo, type PeriodoMes } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CategoriaDrilldownChart } from '@/components/relatorios/CategoriaDrilldownChart';
import { PrevistoRealizadoChart } from '@/components/relatorios/PrevistoRealizadoChart';
import { ReceitaDespesaChart } from '@/components/relatorios/ReceitaDespesaChart';
import { RelatoriosFiltrosModal } from '@/components/relatorios/RelatoriosFiltrosModal';
import { MesNavigator } from '@/components/transacoes/MesNavigator';
import { AppHeader } from '@/components/ui/AppHeader';
import { IconButton } from '@/components/ui/IconButton';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { subtrairMeses } from '@/lib/date';

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

function filtrarPorCategoria(dados: ItemCategoriaResumo[] | undefined, categoriaIds: string[]) {
  if (!dados) return [];
  if (categoriaIds.length === 0) return dados;
  return dados.filter((d) => d.categoriaId !== null && categoriaIds.includes(d.categoriaId));
}

export default function RelatoriosScreen() {
  const theme = useTheme();
  const padrao = hoje();

  const params = useLocalSearchParams<{ ano?: string; mes?: string; foco?: string }>();
  const anoParam = Array.isArray(params.ano) ? params.ano[0] : params.ano;
  const mesParam = Array.isArray(params.mes) ? params.mes[0] : params.mes;
  const focoParam = Array.isArray(params.foco) ? params.foco[0] : params.foco;
  const periodoParamAplicado = useRef<string | undefined>(undefined);
  const focoAplicado = useRef<string | undefined>(undefined);
  const scrollRef = useRef<ScrollView>(null);
  const posicoesSecoes = useRef<Record<string, number>>({});

  const [ano, setAno] = useState(padrao.ano);
  const [mes, setMes] = useState(padrao.mes);
  const [contaIds, setContaIds] = useState<string[]>([]);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  useEffect(() => {
    if (!anoParam || !mesParam) return;
    const chave = `${anoParam}-${mesParam}`;
    if (chave !== periodoParamAplicado.current) {
      periodoParamAplicado.current = chave;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- aplica mês vindo da navegação (cards da Home)
      setAno(Number(anoParam));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- aplica mês vindo da navegação (cards da Home)
      setMes(Number(mesParam));
    }
  }, [anoParam, mesParam]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['transacoes', 'resumo', ano, mes, contaIds],
    queryFn: () => buscarResumoMensal(ano, mes, contaIds.length > 0 ? contaIds : undefined),
  });

  useEffect(() => {
    if (!focoParam || focoParam === focoAplicado.current || isLoading || !data) return;
    focoAplicado.current = focoParam;
    requestAnimationFrame(() => {
      const y = posicoesSecoes.current[focoParam];
      if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(y - Spacing.page, 0), animated: true });
    });
  }, [focoParam, isLoading, data]);

  const relatorioInicio = useMemo<PeriodoMes>(() => subtrairMeses({ ano, mes }, 35), [ano, mes]);
  const { data: relatorio } = useQuery({
    queryKey: ['transacoes', 'relatorio', relatorioInicio.ano, relatorioInicio.mes, ano, mes, contaIds],
    queryFn: () =>
      buscarRelatorio(relatorioInicio, { ano, mes }, {
        contaIds: contaIds.length > 0 ? contaIds : undefined,
      }),
  });

  function mudarMes(novoAno: number, novoMes: number) {
    setAno(novoAno);
    setMes(novoMes);
  }

  const filtrosAtivos = contaIds.length > 0 || categoriaIds.length > 0;

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.primary} />}>
          <ThemedView style={styles.header}>
            <AppHeader variant="title" title="Relatórios" />
            <ThemedView style={styles.headerLinha}>
              <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
              <ThemedView>
                <IconButton
                  icon="sliders"
                  label={filtrosAtivos ? 'Filtros ativos' : 'Filtros'}
                  onPress={() => setFiltrosVisiveis(true)}
                  color={filtrosAtivos ? theme.primary : theme.text}
                />
                {filtrosAtivos ? <ThemedView style={[styles.pontoFiltro, { backgroundColor: theme.primary }]} /> : null}
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {isLoading || !data ? (
            <ThemedText type="small" themeColor="textSecondary">
              Carregando...
            </ThemedText>
          ) : (
            <>
              <ThemedView onLayout={(e) => { posicoesSecoes.current.despesas = e.nativeEvent.layout.y; }}>
                <CategoriaDrilldownChart
                  titulo="Despesas por categoria"
                  dados={filtrarPorCategoria(data.despesasPorCategoria, categoriaIds)}
                  tipo="DESPESA"
                  ano={ano}
                  mes={mes}
                />
              </ThemedView>

              <ThemedView onLayout={(e) => { posicoesSecoes.current.receitas = e.nativeEvent.layout.y; }}>
                <CategoriaDrilldownChart
                  titulo="Receitas por categoria"
                  dados={filtrarPorCategoria(data.receitasPorCategoria, categoriaIds)}
                  tipo="RECEITA"
                  ano={ano}
                  mes={mes}
                />
              </ThemedView>

              {relatorio && (
                <ThemedView onLayout={(e) => { posicoesSecoes.current.comparativo = e.nativeEvent.layout.y; }}>
                  <ReceitaDespesaChart meses={relatorio.meses} />
                </ThemedView>
              )}

              <PrevistoRealizadoChart ano={ano} mes={mes} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <RelatoriosFiltrosModal
        visible={filtrosVisiveis}
        onClose={() => setFiltrosVisiveis(false)}
        contaIds={contaIds}
        categoriaIds={categoriaIds}
        onAplicar={(filtros) => {
          setContaIds(filtros.contaIds);
          setCategoriaIds(filtros.categoriaIds);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { padding: Spacing.page, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  header: { gap: Spacing.two },
  headerLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  pontoFiltro: { position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3 },
});
