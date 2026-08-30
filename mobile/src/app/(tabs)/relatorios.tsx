import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buscarEvolucaoSaldo, buscarResumoMensal, type ItemCategoriaResumo, type PeriodoMes } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CategoriaDrilldownChart } from '@/components/relatorios/CategoriaDrilldownChart';
import { EvolucaoSaldoChart } from '@/components/relatorios/EvolucaoSaldoChart';
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

  const [ano, setAno] = useState(padrao.ano);
  const [mes, setMes] = useState(padrao.mes);
  const [contaIds, setContaIds] = useState<string[]>([]);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);

  const [evolucaoFim, setEvolucaoFim] = useState<PeriodoMes>({ ano, mes });
  const [evolucaoInicio, setEvolucaoInicio] = useState<PeriodoMes>(() => subtrairMeses({ ano, mes }, 5));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reancora o período de evolução sempre que o mês principal muda
    setEvolucaoFim({ ano, mes });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reancora o período de evolução sempre que o mês principal muda
    setEvolucaoInicio(subtrairMeses({ ano, mes }, 5));
  }, [ano, mes]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['transacoes', 'resumo', ano, mes, contaIds],
    queryFn: () => buscarResumoMensal(ano, mes, contaIds.length > 0 ? contaIds : undefined),
  });

  const { data: evolucaoSaldo } = useQuery({
    queryKey: [
      'transacoes',
      'evolucao-saldo',
      evolucaoInicio.ano,
      evolucaoInicio.mes,
      evolucaoFim.ano,
      evolucaoFim.mes,
      contaIds,
    ],
    queryFn: () => buscarEvolucaoSaldo(evolucaoInicio, evolucaoFim, contaIds.length > 0 ? contaIds : undefined),
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
              <CategoriaDrilldownChart
                titulo="Despesas por categoria"
                dados={filtrarPorCategoria(data.despesasPorCategoria, categoriaIds)}
                tipo="DESPESA"
                ano={ano}
                mes={mes}
              />

              <CategoriaDrilldownChart
                titulo="Receitas por categoria"
                dados={filtrarPorCategoria(data.receitasPorCategoria, categoriaIds)}
                tipo="RECEITA"
                ano={ano}
                mes={mes}
              />

              {evolucaoSaldo && (
                <EvolucaoSaldoChart
                  dados={evolucaoSaldo}
                  inicio={evolucaoInicio}
                  fim={evolucaoFim}
                  onChangeInicio={(novoAno, novoMes) => setEvolucaoInicio({ ano: novoAno, mes: novoMes })}
                  onChangeFim={(novoAno, novoMes) => setEvolucaoFim({ ano: novoAno, mes: novoMes })}
                />
              )}
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
