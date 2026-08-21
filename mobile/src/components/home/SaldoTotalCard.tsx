import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { listarContas } from '@/api/contas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

export function SaldoTotalCard() {
  const theme = useTheme();
  const router = useRouter();
  const formatarValor = useFormatarValor();
  const { hideValues, toggleHideValues } = usePreferences();

  const { data: contas, isLoading } = useQuery({
    queryKey: ['contas', 'ativas'],
    queryFn: () => listarContas(false),
  });

  const saldoTotal = contas?.reduce((soma, conta) => soma + conta.saldoAtual, 0) ?? 0;

  function abrirNovaTransacao(tipo: 'RECEITA' | 'DESPESA') {
    router.push({ pathname: '/transacoes', params: { novo: String(Date.now()), tipo } });
  }

  return (
    <Card style={styles.card}>
      <ThemedView style={styles.linhaTitulo}>
        <ThemedText type="small" themeColor="textSecondary">
          Saldo total
        </ThemedText>
        <Pressable
          onPress={toggleHideValues}
          accessibilityLabel={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
          hitSlop={8}>
          <Feather name={hideValues ? 'eye-off' : 'eye'} size={16} color={theme.textSecondary} />
        </Pressable>
      </ThemedView>
      <ThemedText
        type="display"
        numeric
        themeColor={saldoTotal >= 0 ? 'text' : 'expense'}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {isLoading ? '···' : formatarValor(saldoTotal)}
      </ThemedText>
      {!isLoading && contas && (
        <ThemedText type="small" themeColor="textSecondary">
          {contas.length === 1 ? '1 conta ativa' : `${contas.length} contas ativas`}
        </ThemedText>
      )}
      <ThemedView style={styles.acoes}>
        <Pressable
          onPress={() => abrirNovaTransacao('RECEITA')}
          style={(state) => [styles.acaoBotao, { backgroundColor: theme.incomeSoft, opacity: state.pressed ? 0.85 : 1 }]}>
          <ThemedText type="smallBold" themeColor="income">
            + Receita
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => abrirNovaTransacao('DESPESA')}
          style={(state) => [styles.acaoBotao, { backgroundColor: theme.expenseSoft, opacity: state.pressed ? 0.85 : 1 }]}>
          <ThemedText type="smallBold" themeColor="expense">
            − Despesa
          </ThemedText>
        </Pressable>
      </ThemedView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.one },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  acoes: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  acaoBotao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.lg,
  },
});
