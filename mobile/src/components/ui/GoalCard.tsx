import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Radius, Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

interface GoalCardProps {
  name: string;
  icon?: keyof typeof Feather.glyphMap;
  current: number;
  target: number;
  note?: string;
}

/**
 * Card de meta: ícone + nome + progresso amarelo + nota.
 * Ainda não plugado a nenhuma tela (não há backend de metas) — pronto para uso futuro.
 */
export function GoalCard({ name, icon = 'target', current, target, note }: GoalCardProps) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();
  const progresso = target > 0 ? current / target : 0;

  return (
    <Card variant="feature" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: theme.creamStrong }]}>
          <Feather name={icon} size={18} color={theme.warning} />
        </View>
        <View style={styles.headerTexts}>
          <ThemedText type="smallBold">{name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numeric>
            {formatarValor(current)} de {formatarValor(target)}
          </ThemedText>
        </View>
        <ThemedText type="label" themeColor="textSecondary">
          {Math.round(progresso * 100)}%
        </ThemedText>
      </View>

      <ProgressBar value={progresso} accessibilityLabel={`Progresso da meta ${name}`} />

      {note ? (
        <ThemedText type="small" themeColor="textSecondary">
          {note}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: { flex: 1, gap: 1 },
});
