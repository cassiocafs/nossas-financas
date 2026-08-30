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

export default function CadastroScreen() {
  const { signUp } = useAuth();
  const theme = useTheme();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setErro(null);

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await signUp(nome.trim(), email.trim(), senha);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Falha ao criar conta');
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
                Criar conta
              </ThemedText>
            </ThemedView>

            <Card style={styles.card}>
              <ThemedView style={styles.field}>
                <ThemedText type="label">Nome</ThemedText>
                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
                  placeholderTextColor={theme.textTertiary}
                />
              </ThemedView>

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
                <TextInput
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
                  placeholderTextColor={theme.textTertiary}
                />
              </ThemedView>

              <ThemedView style={styles.field}>
                <ThemedText type="label">Confirmar senha</ThemedText>
                <TextInput
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
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
                title={loading ? 'Criando...' : 'Criar conta'}
                onPress={handleSubmit}
                disabled={!nome || !email || !senha || !confirmarSenha}
                loading={loading}
                style={styles.button}
              />
            </Card>

            <Link href="/login" style={styles.link}>
              <ThemedText type="link" themeColor="textSecondary">
                Já tem conta? <ThemedText type="linkPrimary">Entrar</ThemedText>
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
