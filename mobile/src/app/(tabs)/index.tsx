import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buscarResumoMensal } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SaldoPorContasCard } from '@/components/home/SaldoPorContasCard';
import { SaldoTotalCard } from '@/components/home/SaldoTotalCard';
import { TransacoesRecentesCard } from '@/components/home/TransacoesRecentesCard';
import { MesNavigator } from '@/components/transacoes/MesNavigator';
import { StatCard } from '@/components/ui/StatCard';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

function nomeDeExibicao(email: string | undefined, nomeCompleto: unknown): string {
  if (typeof nomeCompleto === 'string' && nomeCompleto.trim()) return nomeCompleto.trim().split(' ')[0];
  return email?.split('@')[0] ?? '';
}

export default function InicioScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const padrao = hoje();

  const [ano, setAno] = useState(padrao.ano);
  const [mes, setMes] = useState(padrao.mes);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['transacoes', 'resumo', ano, mes],
    queryFn: () => buscarResumoMensal(ano, mes),
  });

  function mudarMes(novoAno: number, novoMes: number) {
    setAno(novoAno);
    setMes(novoMes);
  }

  const nome = nomeDeExibicao(session?.user?.email, session?.user?.user_metadata?.nome);
  const inicial = (nome || '?').slice(0, 1).toUpperCase();
  const economia = data ? data.totalEntradas - data.totalSaidas : 0;

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.primary} />}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerLinha}>
              <ThemedView style={[styles.avatar, { backgroundColor: theme.surface }]}>
                <ThemedText type="smallBold" themeColor="primary">
                  {inicial}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.headerTextos}>
                {nome ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Olá, {nome}
                  </ThemedText>
                ) : null}
                <ThemedText type="smallBold">
                  {MESES[mes - 1]} de {ano}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
          </ThemedView>

          {isLoading || !data ? (
            <ThemedText type="small" themeColor="textSecondary">
              Carregando...
            </ThemedText>
          ) : (
            <>
              <SaldoTotalCard />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiRow}>
                <StatCard label="Entradas" value={data.totalEntradas} tone="income" icon="arrow-down-left" style={styles.kpiCard} />
                <StatCard
                  label="Saídas"
                  value={-Math.abs(data.totalSaidas)}
                  tone="expense"
                  icon="arrow-up-right"
                  style={styles.kpiCard}
                />
                <StatCard
                  label="Economia"
                  value={economia}
                  tone={economia >= 0 ? 'income' : 'expense'}
                  icon="trending-up"
                  style={styles.kpiCard}
                />
              </ScrollView>

              <SaldoPorContasCard ano={ano} mes={mes} />

              <TransacoesRecentesCard ano={ano} mes={mes} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  header: { gap: Spacing.three },
  headerLinha: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  headerTextos: { gap: 2 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiRow: { gap: Spacing.two, paddingRight: Spacing.two },
  kpiCard: { width: 158 },
});
