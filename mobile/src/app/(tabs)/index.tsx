import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buscarResumoMensal } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RelatorioCategoriaCard } from '@/components/home/RelatorioCategoriaCard';
import { ResumoMesCard } from '@/components/home/ResumoMesCard';
import { SaldoPorContasCard } from '@/components/home/SaldoPorContasCard';
import { MesNavigator } from '@/components/transacoes/MesNavigator';
import { TransacaoFormModal } from '@/components/transacoes/TransacaoFormModal';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

export default function InicioScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const padrao = hoje();

  const [ano, setAno] = useState(padrao.ano);
  const [mes, setMes] = useState(padrao.mes);
  const [lancando, setLancando] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['transacoes', 'resumo', ano, mes],
    queryFn: () => buscarResumoMensal(ano, mes),
  });

  function aoSalvarLancamento() {
    setLancando(false);
    queryClient.invalidateQueries({ queryKey: ['transacoes'] });
    queryClient.invalidateQueries({ queryKey: ['contas'] });
  }

  function mudarMes(novoAno: number, novoMes: number) {
    setAno(novoAno);
    setMes(novoMes);
  }

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.primary} />}>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Início</ThemedText>
            <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
          </ThemedView>

          {isLoading || !data ? (
            <ThemedText type="small" themeColor="textSecondary">
              Carregando...
            </ThemedText>
          ) : (
            <>
              <ResumoMesCard
                saldoAnterior={data.saldoAnterior}
                totalEntradas={data.totalEntradas}
                totalSaidas={data.totalSaidas}
                saldoFinal={data.saldoFinal}
              />

              <SaldoPorContasCard />

              <RelatorioCategoriaCard
                titulo="Despesas por categoria"
                dados={data.despesasPorCategoria}
                tipo="expense"
              />

              <RelatorioCategoriaCard
                titulo="Receitas por categoria"
                dados={data.receitasPorCategoria}
                tipo="income"
              />
            </>
          )}
        </ScrollView>

        <Pressable
          onPress={() => setLancando(true)}
          accessibilityLabel="Lançar transação"
          style={(state) => [
            styles.fab,
            { backgroundColor: theme.primary, opacity: state.pressed ? 0.9 : 1 },
            Shadow.lift,
          ]}>
          <ThemedText type="title" themeColor="primaryForeground" style={styles.fabIcone}>
            +
          </ThemedText>
        </Pressable>
      </SafeAreaView>

      <TransacaoFormModal
        visible={lancando}
        transacao={null}
        onClose={() => setLancando(false)}
        onSaved={aoSalvarLancamento}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  header: { gap: Spacing.two },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcone: { fontSize: 28, lineHeight: 32 },
});
