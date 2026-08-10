import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { formatarValor } from '@/lib/format';

interface ResumoMesCardProps {
  saldoAnterior: number;
  saldoFinal: number;
}

export function ResumoMesCard({ saldoAnterior, saldoFinal }: ResumoMesCardProps) {
  const positivo = saldoFinal >= 0;

  return (
    <Card style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        Saldo do mês
      </ThemedText>
      <ThemedText type="display" numeric themeColor={positivo ? 'text' : 'expense'}>
        {formatarValor(saldoFinal)}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Saldo anterior: <ThemedText type="smallBold" numeric themeColor="textSecondary">{formatarValor(saldoAnterior)}</ThemedText>
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.one },
});
