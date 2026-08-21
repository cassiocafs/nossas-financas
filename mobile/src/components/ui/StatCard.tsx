import { Feather } from '@expo/vector-icons';
import { View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

export function StatCard({
  label,
  value,
  tone,
  icon,
  delta,
  style,
}: {
  label: string;
  value: number;
  tone: 'income' | 'expense';
  icon: keyof typeof Feather.glyphMap;
  /** Texto opcional exibido junto ao valor (ex.: "+8,2% vs. mês anterior"). */
  delta?: string;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();
  const fg = tone === 'income' ? theme.income : theme.expense;
  const bg = tone === 'income' ? theme.incomeSoft : theme.expenseSoft;

  return (
    <Card style={[{ gap: Spacing.two }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Feather name={icon} size={14} color={fg} />
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={{ flexShrink: 1 }}>
          {label}
        </ThemedText>
      </View>
      <ThemedText type="subtitle" numeric numberOfLines={1} adjustsFontSizeToFit>
        {formatarValor(value)}
      </ThemedText>
      {delta && (
        <ThemedText type="small" style={{ color: fg, fontWeight: '700' }}>
          {delta}
        </ThemedText>
      )}
    </Card>
  );
}
