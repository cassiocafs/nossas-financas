import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { traduzirErroAuth } from '@/lib/authErrors';

export default function LoginScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const theme = useTheme();
  const { erroGoogle } = useLocalSearchParams<{ erroGoogle?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(erroGoogle ?? null);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  async function handleSubmit() {
    setErro(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setErro(traduzirErroAuth(err, 'Falha ao entrar'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setErro(null);
    setLoadingGoogle(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setErro(traduzirErroAuth(err, 'Falha ao entrar com Google'));
    } finally {
      setLoadingGoogle(false);
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
            </ThemedView>

            <ThemedView style={styles.ctaNovaConta}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.ctaFrase}>
                Organize suas finanças e alcance seus objetivos. Comece agora, é grátis.
              </ThemedText>
              <Link href="/cadastro" asChild>
                <Pressable
                  style={(state) => [
                    styles.ctaBadge,
                    { backgroundColor: theme.primarySoft, opacity: state.pressed ? 0.7 : 1 },
                  ]}
                >
                  <ThemedText type="linkPrimary" themeColor="primary">
                    Criar conta grátis
                  </ThemedText>
                  <Feather name="arrow-right" size={14} color={theme.primary} />
                </Pressable>
              </Link>
            </ThemedView>

            <Card style={styles.card}>
              <ThemedText type="h3" style={styles.cardTitle}>
                Entrar na conta
              </ThemedText>

              <ThemedView style={styles.field}>
                <ThemedText type="label">E-mail</ThemedText>
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
                <ThemedText type="label">Senha</ThemedText>
                <ThemedView style={styles.passwordRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!mostrarSenha}
                    style={[
                      styles.input,
                      styles.inputPassword,
                      { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface },
                    ]}
                    placeholderTextColor={theme.textTertiary}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    onPress={() => setMostrarSenha((v) => !v)}
                    hitSlop={8}
                    style={styles.togglePassword}
                  >
                    <Feather name={mostrarSenha ? 'eye-off' : 'eye'} size={18} color={theme.textTertiary} />
                  </Pressable>
                </ThemedView>
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

            <ThemedView style={styles.divider}>
              <ThemedView style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <ThemedText type="small" themeColor="textTertiary">
                ou
              </ThemedText>
              <ThemedView style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </ThemedView>

            <GoogleButton
              title={loadingGoogle ? 'Redirecionando...' : 'Continuar com Google'}
              onPress={handleGoogle}
              loading={loadingGoogle}
            />

            <Link href="/privacidade" style={styles.privacidadeLink}>
              <ThemedText type="small" themeColor="textTertiary" style={styles.privacidadeTexto}>
                Política de Privacidade
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
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  logo: { height: 48, width: 192 },
  ctaNovaConta: {
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  ctaFrase: {
    textAlign: 'center',
  },
  ctaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  card: {
    gap: Spacing.three,
  },
  cardTitle: {
    marginBottom: Spacing.one,
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
  passwordRow: {
    justifyContent: 'center',
  },
  inputPassword: {
    paddingRight: Spacing.five,
  },
  togglePassword: {
    position: 'absolute',
    right: Spacing.three,
    padding: Spacing.one,
  },
  erro: {
    marginTop: -Spacing.one,
  },
  button: {
    marginTop: Spacing.one,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  privacidadeLink: {
    alignSelf: 'center',
    marginTop: Spacing.three,
  },
  privacidadeTexto: {
    textDecorationLine: 'underline',
  },
});
