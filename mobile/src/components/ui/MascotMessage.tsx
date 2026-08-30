import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Mascot, type MascotState } from '@/components/ui/Mascot';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface MascotMessageProps {
  children: string;
  state?: MascotState;
}

/** Mascote pequeno + balão de texto. Usado em momentos de incentivo (ex.: rodapé do form). */
export function MascotMessage({ children, state = 'encouraging' }: MascotMessageProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.cream }]}>
      <Mascot state={state} size={48} />
      <ThemedText type="small" themeColor="text" style={styles.text}>
        {children}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
  },
  text: { flex: 1 },
});
