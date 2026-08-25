import { useState } from 'react';
import { Link } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
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
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedView style={styles.header}>
              <Image
                source={require('../../../assets/images/logo-horizontal.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <ThemedText type="default" themeColor="textSecondary">
                Entrar na conta
              </ThemedText>
            </ThemedView>

            <Card style={styles.card}>
              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">E-mail</ThemedText>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
                  placeholderTextColor={theme.textTertiary}
                />
              </ThemedView>

              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">Senha</ThemedText>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
                  placeholderTextColor={theme.textTertiary}
                />
              </ThemedView>

              {erro && (
                <ThemedText type="small" themeColor="destructive" style={styles.erro}>
                  {erro}
                </ThemedText>
              )}

              <Button
                title={loading ? 'Entrando...' : 'Entrar'}
                onPress={handleSubmit}
                disabled={!email || !password}
                loading={loading}
                style={styles.button}
              />
            </Card>

            <Link href="/cadastro" style={styles.link}>
              <ThemedText type="link" themeColor="textSecondary">
                Não tem conta? <ThemedText type="linkPrimary">Criar conta</ThemedText>
              </ThemedText>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  header: {
    gap: Spacing.half,
    marginBottom: Spacing.five,
  },
  logo: { height: 32, width: 128 },
  card: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  erro: {
    marginTop: -Spacing.one,
  },
  button: {
    marginTop: Spacing.one,
  },
  link: {
    alignSelf: 'center',
    marginTop: Spacing.four,
  },
});
