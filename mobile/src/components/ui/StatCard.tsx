import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

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
 * Card compacto da linha "Entrou / Saiu / Sobrou" da Home. Espelha as infos da versão web:
 * ícone + rótulo (com o mês), número e a legenda de variação numa pílula.
 * `out` (saída) usa **número neutro** — despesa não é vermelha nem verde.
 */
export function StatCard({
  label,
  value,
  tone,
  caption,
  style,
  onPress,
}: {
  label: string;
  value: number;
  tone: StatTone;
  /** Legenda de variação (ex.: "+8,2% · +R$ 950" ou "12,3% do que entrou"). */
  caption?: string;
  style?: ViewStyle;
  /** Torna o card tocável — ex.: leva ao gráfico correspondente em Relatórios. */
  onPress?: () => void;
}) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();

  const fg = tone === 'in' ? theme.income : tone === 'saved' ? theme.saved : theme.expense;
  const bg = tone === 'in' ? theme.incomeSoft : tone === 'saved' ? theme.savedSoft : theme.expenseSoft;

  const conteudo = (
    <>
      <View style={styles.topRow}>
        <View style={[styles.chip, { backgroundColor: bg }]}>
          <Feather name={ICON[tone]} size={12} color={fg} />
        </View>
        <ThemedText type="small" themeColor="textSecondary" style={styles.label} numberOfLines={2}>
          {label}
        </ThemedText>
        {onPress ? <Feather name="chevron-right" size={16} color={theme.textTertiary} /> : null}
      </View>

      <ThemedText type="money" style={{ color: fg }} numberOfLines={1} adjustsFontSizeToFit>
        {formatarValor(value)}
      </ThemedText>

      {caption ? (
        <View style={[styles.pill, { backgroundColor: bg }]}>
          <ThemedText style={[styles.pillText, { color: fg }]} numberOfLines={2}>
            {caption}
          </ThemedText>
        </View>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={(state) => [{ opacity: state.pressed ? 0.7 : 1 }, style]}>
        <Card padding="compact" style={styles.card}>
          {conteudo}
        </Card>
      </Pressable>
    );
  }

  return (
    <Card padding="compact" style={[styles.card, style]}>
      {conteudo}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  chip: { width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, lineHeight: 15 },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: { fontSize: 11, lineHeight: 14, fontWeight: '600' },
});
