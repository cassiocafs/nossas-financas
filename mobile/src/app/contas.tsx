import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listarContas, type Conta } from '@/api/contas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ContaFormModal } from '@/components/contas/ContaFormModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

export default function ContasScreen() {
  const router = useRouter();
  const theme = useTheme();
  const formatarValor = useFormatarValor();

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ['contas'],
    queryFn: () => listarContas(true),
  });

  const [formVisivel, setFormVisivel] = useState(false);
  const [contaEditando, setContaEditando] = useState<Conta | null>(null);
  const [mostrarInativas, setMostrarInativas] = useState(false);

  const ativas = contas.filter((c) => c.ativa);
  const inativas = contas.filter((c) => !c.ativa);
  const saldoConsolidado = ativas.reduce((soma, c) => soma + c.saldoAtual, 0);

  function abrirCriacao() {
    setContaEditando(null);
    setFormVisivel(true);
  }

  function abrirEdicao(conta: Conta) {
    setContaEditando(conta);
    setFormVisivel(true);
  }

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ThemedView style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/perfil'))}
            hitSlop={12}
            style={styles.voltar}>
            <Feather name="chevron-left" size={22} color={theme.text} />
            <ThemedText type="default">Ajustes</ThemedText>
          </Pressable>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedText type="title">Contas</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Saldo consolidado das ativas:{' '}
            <ThemedText type="smallBold">{formatarValor(saldoConsolidado)}</ThemedText>
          </ThemedText>

          <Button title="Nova conta" icon="plus" onPress={abrirCriacao} fullWidth />

          {isLoading ? (
            <ThemedText type="small" themeColor="textSecondary">
              Carregando...
            </ThemedText>
          ) : (
            <Card padding="none">
              {ativas.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.vazio}>
                  Nenhuma conta ativa.
                </ThemedText>
              ) : (
                ativas.map((conta, i) => (
                  <Pressable
                    key={conta.id}
                    onPress={() => abrirEdicao(conta)}
                    style={[
                      styles.linha,
                      i < ativas.length - 1 && { borderBottomColor: theme.divider, borderBottomWidth: StyleSheet.hairlineWidth },
                    ]}>
                    <ThemedText type="default" style={styles.linhaNome} numberOfLines={1}>
                      {conta.nome}
                    </ThemedText>
                    <ThemedText type="smallBold" numeric>
                      {formatarValor(conta.saldoAtual)}
                    </ThemedText>
                    <Feather name="chevron-right" size={18} color={theme.textTertiary} />
                  </Pressable>
                ))
              )}
            </Card>
          )}

          {inativas.length > 0 ? (
            <View style={styles.inativas}>
              <Pressable onPress={() => setMostrarInativas((v) => !v)} hitSlop={8}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {mostrarInativas ? 'Ocultar' : 'Mostrar'} contas arquivadas ({inativas.length})
                </ThemedText>
              </Pressable>
              {mostrarInativas ? (
                <Card padding="none">
                  {inativas.map((conta, i) => (
                    <Pressable
                      key={conta.id}
                      onPress={() => abrirEdicao(conta)}
                      style={[
                        styles.linha,
                        i < inativas.length - 1 && { borderBottomColor: theme.divider, borderBottomWidth: StyleSheet.hairlineWidth },
                      ]}>
                      <ThemedText type="default" themeColor="textSecondary" style={styles.linhaNome} numberOfLines={1}>
                        {conta.nome}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" numeric>
                        {formatarValor(conta.saldoAtual)}
                      </ThemedText>
                      <Feather name="chevron-right" size={18} color={theme.textTertiary} />
                    </Pressable>
                  ))}
                </Card>
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <ContaFormModal
        visible={formVisivel}
        conta={contaEditando}
        onClose={() => setFormVisivel(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.page,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  scroll: { padding: Spacing.page, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  vazio: { padding: Spacing.four, textAlign: 'center' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  linhaNome: { flex: 1 },
  inativas: { gap: Spacing.two },
});
