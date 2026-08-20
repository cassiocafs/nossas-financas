import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { FlatList, Modal, Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { baseUrl } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useLogs } from '@/hooks/use-logs';
import { useNetworkState } from '@/hooks/use-network-state';
import { useTheme } from '@/hooks/use-theme';
import { clearLogs, type LogEntry } from '@/lib/logStore';

const LEVEL_LABEL: Record<LogEntry['level'], string> = {
  info: 'INFO',
  warn: 'AVISO',
  error: 'ERRO',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour12: false });
}

function buildReport(logs: LogEntry[], meta: Record<string, string>) {
  const header = Object.entries(meta)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const body = logs
    .slice()
    .reverse()
    .map((entry) => `[${entry.timestamp}] ${LEVEL_LABEL[entry.level]} ${entry.message}${entry.detail ? `\n${entry.detail}` : ''}`)
    .join('\n\n');

  return `Diagnóstico — Nossas Finanças\n${header}\n\n----- LOGS (${logs.length}) -----\n\n${body || '(sem registros)'}`;
}

export function DiagnosticoModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const logs = useLogs();
  const { isConnected } = useNetworkState();
  const { session } = useAuth();

  const meta: Record<string, string> = {
    'API base URL': baseUrl,
    Conectividade: isConnected ? 'online' : 'offline',
    Sessão: session?.user?.email ?? '(sem sessão)',
    Plataforma: `${Platform.OS} ${Platform.Version}`,
    'Versão do app': `${Constants.expoConfig?.version ?? '?'} (build ${Constants.expoConfig?.android?.versionCode ?? Constants.nativeBuildVersion ?? '?'})`,
  };

  async function handleShare() {
    await Share.share({ message: buildReport(logs, meta) });
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <ThemedText type="title">Logs de diagnóstico</ThemedText>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} hitSlop={12}>
            <Feather name="x" size={24} color={theme.text} />
          </Pressable>
        </View>

        <Card variant="flat" style={styles.metaCard}>
          {Object.entries(meta).map(([key, value]) => (
            <View key={key} style={styles.metaRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {key}
              </ThemedText>
              <ThemedText type="small" style={styles.metaValue} numberOfLines={1}>
                {value}
              </ThemedText>
            </View>
          ))}
        </Card>

        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Nenhum evento registrado ainda. Use o app normalmente (ex.: puxe para atualizar a Home) e volte aqui para
              ver o que aconteceu nas chamadas ao servidor.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const color = item.level === 'error' ? theme.destructive : item.level === 'warn' ? theme.transfer : theme.textSecondary;
            return (
              <View style={[styles.logRow, { borderBottomColor: theme.border }]}>
                <View style={styles.logHeader}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatTime(item.timestamp)}
                  </ThemedText>
                  <ThemedText type="smallBold" style={{ color }}>
                    {LEVEL_LABEL[item.level]}
                  </ThemedText>
                </View>
                <ThemedText type="small">{item.message}</ThemedText>
                {item.detail ? (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.detail}>
                    {item.detail}
                  </ThemedText>
                ) : null}
              </View>
            );
          }}
        />

        <View style={styles.actions}>
          <Button title="Compartilhar" icon="share" variant="secondary" onPress={handleShare} style={styles.actionButton} />
          <Button title="Limpar" icon="trash-2" variant="destructive" onPress={clearLogs} style={styles.actionButton} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  metaCard: { marginHorizontal: Spacing.four, marginBottom: Spacing.two, gap: Spacing.one },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  metaValue: { flexShrink: 1, textAlign: 'right' },
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four, gap: Spacing.two },
  empty: { paddingVertical: Spacing.five, textAlign: 'center' },
  logRow: { paddingVertical: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth, gap: Spacing.half },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  detail: { fontFamily: Fonts.mono },
  actions: { flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.four, paddingTop: Spacing.two },
  actionButton: { flex: 1 },
});
