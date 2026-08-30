import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Mascot } from '@/components/ui/Mascot';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface InsightCardProps {
  children: string;
  cta?: string;
  onPressCta?: () => void;
}

/** Card creme com o mascote e uma observação do mês. Renderizar só quando houver dado. */
export function InsightCard({ children, cta, onPressCta }: InsightCardProps) {
  const theme = useTheme();

  return (
    <Card variant="feature" style={[styles.card, { backgroundColor: theme.cream, borderColor: theme.border }]}>
      <View style={styles.row}>
        <Mascot state="thinking" size={56} />
        <ThemedText type="small" themeColor="text" style={styles.text}>
          {children}
        </ThemedText>
      </View>
      {cta ? (
        <Pressable
          onPress={onPressCta}
          style={(state) => [styles.cta, { opacity: state.pressed ? 0.7 : 1 }]}
          accessibilityRole="button">
          <ThemedText type="smallBold" themeColor="primary">
            {cta}
          </ThemedText>
          <Feather name="arrow-right" size={15} color={theme.primary} />
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  text: { flex: 1 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
});
