import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setErro(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Nossas Finanças
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Entrar na conta
        </ThemedText>

        <ThemedView style={styles.field}>
          <ThemedText type="smallBold">E-mail</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            placeholderTextColor={theme.textSecondary}
          />
        </ThemedView>

        <ThemedView style={styles.field}>
          <ThemedText type="smallBold">Senha</ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            placeholderTextColor={theme.textSecondary}
          />
        </ThemedView>

        {erro && (
          <ThemedText type="small" style={styles.erro}>
            {erro}
          </ThemedText>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={loading || !email || !password}
          style={[styles.button, { backgroundColor: theme.text, opacity: loading ? 0.6 : 1 }]}>
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <ThemedText type="smallBold" themeColor="background">
              Entrar
            </ThemedText>
          )}
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  title: {
    marginBottom: Spacing.one,
  },
  field: {
    gap: Spacing.one,
    marginTop: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  erro: {
    color: '#d33',
    marginTop: Spacing.two,
  },
  button: {
    marginTop: Spacing.four,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
