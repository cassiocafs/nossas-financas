import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useNetworkState } from '@/hooks/use-network-state';
import { useTheme } from '@/hooks/use-theme';

/**
 * Faixa fixa exibida no topo do app sempre que o dispositivo perde conexão
 * com a internet. Não renderiza nada quando está online.
 */
export function OfflineBanner() {
  const theme = useTheme();
  const { isConnected } = useNetworkState();

  if (isConnected !== false) {
    return null;
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.destructive }]}>
      <ThemedText type="smallBold" style={[styles.text, { color: theme.destructiveForeground }]}>
        Você está offline
      </ThemedText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {},
  text: {
    textAlign: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
