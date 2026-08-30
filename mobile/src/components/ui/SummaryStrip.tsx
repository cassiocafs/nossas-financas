import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

interface SummaryStripProps {
  label: string;
  value: number;
  /** Cor do valor. Padrão: texto neutro (regra de despesa). */
  valueColor?: string;
}

/** Faixa creme com um rótulo à esquerda e um valor à direita ("Saiu em agosto"). */
export function SummaryStrip({ label, value, valueColor }: SummaryStripProps) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();

  return (
    <View style={[styles.strip, { backgroundColor: theme.creamStrong }]}>
      <ThemedText type="small" themeColor="text">
        {label}
      </ThemedText>
      <ThemedText type="money" style={{ color: valueColor ?? theme.text }}>
        {formatarValor(value)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: Radius.card,
  },
});
