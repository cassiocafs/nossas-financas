import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DiagnosticoModal } from '@/components/perfil/DiagnosticoModal';
import { RegrasModal } from '@/components/perfil/RegrasModal';
import { SincronizacaoCard } from '@/components/perfil/SincronizacaoCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences, type ColorSchemeOverride } from '@/contexts/PreferencesContext';
import { useTheme } from '@/hooks/use-theme';

const OPCOES_TEMA: { valor: ColorSchemeOverride; label: string }[] = [
  { valor: 'system', label: 'Sistema' },
  { valor: 'light', label: 'Claro' },
  { valor: 'dark', label: 'Escuro' },
];

function nomeDeExibicao(email: string | undefined, nomeCompleto: unknown): string {
  if (typeof nomeCompleto === 'string' && nomeCompleto.trim()) return nomeCompleto.trim();
  return email ?? '';
}

export default function PerfilScreen() {
  const theme = useTheme();
  const { session, signOut } = useAuth();
  const { colorSchemeOverride, setColorSchemeOverride, hideValues, setHideValues } = usePreferences();
  const [diagnosticoAberto, setDiagnosticoAberto] = useState(false);
  const [regrasAberto, setRegrasAberto] = useState(false);
  const podeVerDiagnostico = session?.user?.email === 'esteyceecassio@gmail.com';

  const nome = nomeDeExibicao(session?.user?.email, session?.user?.user_metadata?.nome);
  const inicial = (nome || '?').slice(0, 1).toUpperCase();

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">Ajustes</ThemedText>

          <Card style={styles.perfilCard}>
            <ThemedView style={[styles.avatar, { backgroundColor: theme.surface }]}>
              <ThemedText type="subtitle" themeColor="primary">
                {inicial}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.perfilTextos}>
              <ThemedText type="smallBold" numberOfLines={1}>
                {nome}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                {session?.user?.email}
              </ThemedText>
            </ThemedView>
          </Card>

          <Card style={styles.preferenciasCard}>
            <ThemedText type="smallBold">Preferências</ThemedText>

            <ThemedView style={styles.preferenciaLinha}>
              <ThemedView style={styles.preferenciaTextos}>
                <ThemedText type="small">Tema do app</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Escuro, claro ou o mesmo do sistema
                </ThemedText>
              </ThemedView>
            </ThemedView>
            <ThemedView style={[styles.segmentado, { backgroundColor: theme.surface }]}>
              {OPCOES_TEMA.map((opcao) => {
                const ativo = colorSchemeOverride === opcao.valor;
                return (
                  <Pressable
                    key={opcao.valor}
                    onPress={() => setColorSchemeOverride(opcao.valor)}
                    style={[styles.segmentoBotao, ativo && { backgroundColor: theme.card }]}>
                    <ThemedText type="small" themeColor={ativo ? 'text' : 'textSecondary'} style={ativo ? { fontWeight: '700' } : undefined}>
                      {opcao.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>

            <ThemedView style={[styles.preferenciaLinha, styles.preferenciaLinhaComBorda, { borderTopColor: theme.border }]}>
              <ThemedView style={styles.preferenciaTextos}>
                <ThemedText type="small">Ocultar valores</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Esconde saldos e valores em locais públicos
                </ThemedText>
              </ThemedView>
              <Switch value={hideValues} onValueChange={setHideValues} trackColor={{ true: theme.primary }} />
            </ThemedView>
          </Card>

          <Card padded={false} style={styles.acoesCard}>
            <Pressable
              onPress={() => setRegrasAberto(true)}
              style={[styles.acaoLinha, { borderBottomColor: theme.border }]}>
              <ThemedView style={[styles.acaoIcone, { backgroundColor: theme.surface }]}>
                <Feather name="sliders" size={16} color={theme.primary} />
              </ThemedView>
              <ThemedText type="default" style={styles.acaoTexto}>
                Regras de inserção
              </ThemedText>
              <Feather name="chevron-right" size={18} color={theme.textTertiary} />
            </Pressable>

            {podeVerDiagnostico && (
              <Pressable
                onPress={() => setDiagnosticoAberto(true)}
                style={[styles.acaoLinha, { borderBottomColor: theme.border }]}>
                <ThemedView style={[styles.acaoIcone, { backgroundColor: theme.surface }]}>
                  <Feather name="terminal" size={16} color={theme.primary} />
                </ThemedView>
                <ThemedText type="default" style={styles.acaoTexto}>
                  Logs de diagnóstico
                </ThemedText>
                <Feather name="chevron-right" size={18} color={theme.textTertiary} />
              </Pressable>
            )}

            <Pressable onPress={() => signOut()} style={styles.acaoLinha}>
              <ThemedView style={[styles.acaoIcone, { backgroundColor: theme.expenseSoft }]}>
                <Feather name="log-out" size={16} color={theme.expense} />
              </ThemedView>
              <ThemedText type="default" themeColor="expense" style={styles.acaoTexto}>
                Sair
              </ThemedText>
            </Pressable>
          </Card>

          <SincronizacaoCard />
        </ScrollView>
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
  safeArea: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  perfilCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  perfilTextos: { flex: 1, gap: 2 },
  preferenciasCard: { gap: Spacing.two },
  preferenciaLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  preferenciaLinhaComBorda: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three, marginTop: Spacing.one },
  preferenciaTextos: { flex: 1, gap: 2 },
  segmentado: { flexDirection: 'row', borderRadius: Radius.md, padding: 3, gap: 3 },
  segmentoBotao: { flex: 1, alignItems: 'center', paddingVertical: Spacing.two, borderRadius: Radius.sm },
  acoesCard: { overflow: 'hidden' },
  acaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  acaoIcone: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  acaoTexto: { flex: 1 },
});
