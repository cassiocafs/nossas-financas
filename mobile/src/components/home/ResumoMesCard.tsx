import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { formatarValor } from '@/lib/format';

interface ResumoMesCardProps {
  saldoAnterior: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
}

export function ResumoMesCard({
  saldoAnterior,
  totalEntradas,
  totalSaidas,
  saldoFinal,
}: ResumoMesCardProps) {
  const positivo = saldoFinal >= 0;

  return (
    <Card style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        Saldo do mês
      </ThemedText>
      <ThemedText type="display" numeric themeColor={positivo ? 'text' : 'expense'}>
        {formatarValor(saldoFinal)}
      </ThemedText>

      <ThemedView style={styles.linhas}>
        <ThemedView type="surface" style={styles.item}>
          <ThemedText type="small" themeColor="textSecondary">
            Saldo anterior
          </ThemedText>
          <ThemedText type="smallBold" numeric>
            {formatarValor(saldoAnterior)}
          </ThemedText>
        </ThemedView>
        <ThemedView type="surface" style={styles.item}>
          <ThemedText type="small" themeColor="textSecondary">
            Entradas
          </ThemedText>
          <ThemedText type="smallBold" numeric themeColor="income">
            {formatarValor(totalEntradas)}
          </ThemedText>
        </ThemedView>
        <ThemedView type="surface" style={styles.item}>
          <ThemedText type="small" themeColor="textSecondary">
            Saídas
          </ThemedText>
          <ThemedText type="smallBold" numeric themeColor="expense">
            {formatarValor(-Math.abs(totalSaidas))}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.one },
  linhas: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  item: { minWidth: 100, gap: 2, borderRadius: Radius.sm, padding: Spacing.two },
});
