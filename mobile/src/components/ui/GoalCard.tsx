import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Radius, Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

export type GoalCardTone = 'default' | 'success' | 'warning';

interface GoalCardProps {
  name: string;
  icon?: keyof typeof Feather.glyphMap;
  /** Emoji livre escolhido pelo usuário. Ignorado quando `icon` é passado. */
  emoji?: string | null;
  current: number;
  target: number;
  note?: string;
  /** Cor da barra de progresso — `success` (verde, concluída) ou `warning` (amarelo, atrasada). */
  tone?: GoalCardTone;
  /** Torna o card tocável — ex.: abre o detalhe da meta. */
  onPress?: () => void;
  /** Conteúdo no canto direito do cabeçalho (ex.: menu de ações). */
  action?: ReactNode;
}

/** Card de meta: ícone/emoji + nome + progresso + nota. */
export function GoalCard({ name, icon, emoji, current, target, note, tone = 'default', onPress, action }: GoalCardProps) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();
  const progresso = target > 0 ? current / target : 0;
  const cor = tone === 'success' ? theme.income : theme.warning;

  const conteudo = (
    <>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: theme.creamStrong }]}>
          {icon ? (
            <Feather name={icon} size={18} color={theme.warning} />
          ) : emoji ? (
            <ThemedText style={styles.emoji}>{emoji}</ThemedText>
          ) : (
            <Feather name="target" size={18} color={theme.warning} />
          )}
        </View>
        <View style={styles.headerTexts}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {name}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numeric>
            {formatarValor(current)} de {formatarValor(target)}
          </ThemedText>
        </View>
        <ThemedText type="label" themeColor="textSecondary">
          {Math.round(progresso * 100)}%
        </ThemedText>
        {action}
      </View>

      <ProgressBar value={progresso} color={cor} accessibilityLabel={`Progresso da meta ${name}`} />

      {note ? (
        <ThemedText type="small" themeColor="textSecondary">
          {note}
        </ThemedText>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={(state) => ({ opacity: state.pressed ? 0.85 : 1 })}>
        <Card variant="feature" style={styles.card}>
          {conteudo}
        </Card>
      </Pressable>
    );
  }

  return (
    <Card variant="feature" style={styles.card}>
      {conteudo}
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
  emoji: { fontSize: 18, lineHeight: 21 },
  headerTexts: { flex: 1, gap: 1 },
});
