import { Feather } from '@expo/vector-icons';
import { View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

export type StatTone = 'in' | 'out' | 'saved';

const ICON: Record<StatTone, keyof typeof Feather.glyphMap> = {
  in: 'arrow-down-left',
  out: 'arrow-up-right',
  saved: 'trending-up',
};

/**
 * Card compacto para a linha "Entrou / Saiu / Sobrou".
 * `out` (saída) usa **texto neutro** — despesa não é vermelha nem verde.
 */
export function StatCard({
  label,
  value,
  tone,
  style,
}: {
  label: string;
  value: number;
  tone: StatTone;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();

  const fg = tone === 'in' ? theme.income : tone === 'saved' ? theme.saved : theme.expense;
  const bg = tone === 'in' ? theme.incomeSoft : tone === 'saved' ? theme.savedSoft : theme.expenseSoft;

  return (
    <Card padding="compact" style={[{ gap: Spacing.two }, style]}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Feather name={ICON[tone]} size={14} color={fg} />
      </View>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="money" style={{ color: fg }} numberOfLines={1} adjustsFontSizeToFit>
        {formatarValor(value)}
      </ThemedText>
    </Card>
  );
}
