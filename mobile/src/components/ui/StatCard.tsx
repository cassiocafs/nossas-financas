import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatarValor } from '@/lib/format';

export function StatCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: 'income' | 'expense';
  icon: keyof typeof Feather.glyphMap;
}) {
  const theme = useTheme();
  const fg = tone === 'income' ? theme.income : theme.expense;
  const bg = tone === 'income' ? theme.incomeSoft : theme.expenseSoft;

  return (
    <Card style={{ flex: 1, gap: Spacing.two }}>
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
    </Card>
  );
}
