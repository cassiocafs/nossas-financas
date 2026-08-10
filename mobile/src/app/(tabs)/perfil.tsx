import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function PerfilScreen() {
  const { session, signOut } = useAuth();

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedText type="title">Perfil</ThemedText>

        <Card style={styles.card}>
          <ThemedText type="small" themeColor="textSecondary">
            Conta
          </ThemedText>
          <ThemedText type="default">{session?.user?.email}</ThemedText>
        </Card>

        <Button title="Sair" variant="secondary" onPress={() => signOut()} style={styles.button} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  card: { gap: Spacing.half },
  button: { marginTop: Spacing.two },
});
