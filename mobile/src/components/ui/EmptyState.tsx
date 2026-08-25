import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

const MASCOT: Record<Mood, ImageSourcePropType> = {
  happy: require('../../../assets/images/mascot/happy.png'),
  encouraging: require('../../../assets/images/mascot/encouraging.png'),
  thinking: require('../../../assets/images/mascot/thinking.png'),
  welcome: require('../../../assets/images/mascot/welcome.png'),
  standing: require('../../../assets/images/mascot/standing.png'),
};

type Mood = 'happy' | 'encouraging' | 'thinking' | 'welcome' | 'standing';

export type EmptyStateProps = {
  mood?: Mood;
  title: string;
  children?: string;
};

/** Estado vazio com o mascote do Poupeu — use só para "nada aqui ainda", nunca como decoração. */
export function EmptyState({ mood = 'thinking', title, children }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Image source={MASCOT[mood]} style={styles.mascote} resizeMode="contain" />
      <ThemedText type="smallBold" style={styles.titulo}>
        {title}
      </ThemedText>
      {children && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.descricao}>
          {children}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six },
  mascote: { width: 80, height: 80 },
  titulo: { textAlign: 'center' },
  descricao: { textAlign: 'center', maxWidth: 260 },
});
