import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useNetworkState } from '@/hooks/use-network-state';
import { useSyncQueue } from '@/hooks/use-sync-queue';
import { useTheme } from '@/hooks/use-theme';
import { processarFila } from '@/lib/syncQueue';

/**
 * Faixa fixa no topo do app: avisa quando está offline, quando está
 * sincronizando, ou quando há alterações pendentes esperando conexão
 * (tocável, dispara `processarFila()` manualmente). Não renderiza nada
 * quando está tudo em dia.
 */
export function SyncStatusBar() {
  const theme = useTheme();
  const { isConnected } = useNetworkState();
  const { fila, sincronizando } = useSyncQueue();

  if (isConnected === false) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.destructive }]}>
        <ThemedText type="smallBold" style={[styles.text, { color: theme.destructiveForeground }]}>
          Você está offline
        </ThemedText>
      </SafeAreaView>
    );
  }

  if (sincronizando) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.primary }]}>
        <ThemedView style={styles.linha}>
          <ActivityIndicator size="small" color={theme.primaryForeground} />
          <ThemedText type="smallBold" style={{ color: theme.primaryForeground }}>
            Sincronizando…
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (fila.length > 0) {
    return (
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.warning }]}>
        <Pressable onPress={() => processarFila()} style={styles.linha}>
          <ThemedText type="smallBold" style={[styles.text, { color: theme.warningForeground }]}>
            {fila.length === 1
              ? '1 alteração pendente — toque para sincronizar'
              : `${fila.length} alterações pendentes — toque para sincronizar`}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: {},
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  text: {
    textAlign: 'center',
  },
});
