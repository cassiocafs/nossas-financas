import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiagnosticoModal } from '@/components/perfil/DiagnosticoModal';
import { RegrasModal } from '@/components/perfil/RegrasModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function PerfilScreen() {
  const { session, signOut } = useAuth();
  const [diagnosticoAberto, setDiagnosticoAberto] = useState(false);
  const [regrasAberto, setRegrasAberto] = useState(false);
  const podeVerDiagnostico = session?.user?.email === 'esteyceecassio@gmail.com';

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

        <Button
          title="Regras de inserção"
          icon="sliders"
          variant="secondary"
          onPress={() => setRegrasAberto(true)}
          style={styles.button}
        />

        {podeVerDiagnostico ? (
          <Button
            title="Logs de diagnóstico"
            icon="terminal"
            variant="secondary"
            onPress={() => setDiagnosticoAberto(true)}
            style={styles.button}
          />
        ) : null}

        <Button title="Sair" icon="log-out" variant="secondary" onPress={() => signOut()} style={styles.button} />
      </SafeAreaView>

      <RegrasModal visible={regrasAberto} onClose={() => setRegrasAberto(false)} />
      {podeVerDiagnostico ? (
        <DiagnosticoModal visible={diagnosticoAberto} onClose={() => setDiagnosticoAberto(false)} />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  card: { gap: Spacing.half },
  button: { marginTop: Spacing.two },
});
