import { useQuery } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';

import { listarContas } from '@/api/contas';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { formatarValor } from '@/lib/format';

export function SaldoTotalCard() {
  const { data: contas, isLoading } = useQuery({
    queryKey: ['contas', 'ativas'],
    queryFn: () => listarContas(false),
  });

  const saldoTotal = contas?.reduce((soma, conta) => soma + conta.saldoAtual, 0) ?? 0;

  return (
    <Card style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        Saldo total
      </ThemedText>
      <ThemedText
        type="display"
        numeric
        themeColor={saldoTotal >= 0 ? 'text' : 'expense'}
        numberOfLines={1}
        adjustsFontSizeToFit>
        {isLoading ? '···' : formatarValor(saldoTotal)}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.one },
});
