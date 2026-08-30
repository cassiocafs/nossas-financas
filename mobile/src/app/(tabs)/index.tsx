import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buscarResumoMensal } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FinancialCard } from '@/components/home/FinancialCard';
import { SaldoPorContasCard } from '@/components/home/SaldoPorContasCard';
import { TransacoesRecentesCard } from '@/components/home/TransacoesRecentesCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { InsightCard } from '@/components/ui/InsightCard';
import { StatCard } from '@/components/ui/StatCard';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useInsightMensal } from '@/hooks/use-insight-mensal';
import { useTheme } from '@/hooks/use-theme';

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
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
  const { ano, mes } = hoje();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['transacoes', 'resumo', ano, mes],
    queryFn: () => buscarResumoMensal(ano, mes),
  });

  const insight = useInsightMensal(ano, mes);

  const nome = nomeDeExibicao(session?.user?.email, session?.user?.user_metadata?.nome);
  const economia = data ? data.totalEntradas - data.totalSaidas : 0;

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.primary} />}>
          <AppHeader
            greeting={nome ? `Oi, ${nome} 👋` : 'Oi 👋'}
            subtitle={`Vamos olhar ${MESES[mes - 1]}?`}
          />

          {isLoading || !data ? (
            <ThemedText type="small" themeColor="textSecondary">
              Carregando...
            </ThemedText>
          ) : (
            <>
              <FinancialCard />

              <View style={styles.statRow}>
                <StatCard label="Entrou" value={data.totalEntradas} tone="in" style={styles.stat} />
                <StatCard label="Saiu" value={-Math.abs(data.totalSaidas)} tone="out" style={styles.stat} />
                <StatCard label="Sobrou" value={economia} tone="saved" style={styles.stat} />
              </View>

              {insight ? <InsightCard>{insight.texto}</InsightCard> : null}

              <TransacoesRecentesCard ano={ano} mes={mes} recentes={data.recentes} />

              <SaldoPorContasCard ano={ano} mes={mes} />
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
  scroll: { padding: Spacing.page, gap: Spacing.gap, paddingBottom: Spacing.six * 2 },
  statRow: { flexDirection: 'row', gap: Spacing.two },
  stat: { flex: 1 },
});
