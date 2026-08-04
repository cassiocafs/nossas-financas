import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, apiFetch } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface Conta {
  id: string;
  nome: string;
}

type Tipo = 'DESPESA' | 'RECEITA';

export default function LancarScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data: contas, isLoading: carregandoContas } = useQuery({
    queryKey: ['contas'],
    queryFn: () => apiFetch<Conta[]>('/api/contas'),
  });

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<Tipo>('DESPESA');
  const [contaId, setContaId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const contaSelecionada = contaId ?? contas?.[0]?.id ?? null;
  const valorNumerico = Number(valor.replace(',', '.'));
  const podeEnviar =
    descricao.trim().length > 0 && valorNumerico > 0 && !!contaSelecionada && !enviando;

  async function lancar() {
    if (!contaSelecionada) return;
    setErro(null);
    setSucesso(false);
    setEnviando(true);
    try {
      await apiFetch('/api/transacoes', {
        method: 'POST',
        body: JSON.stringify({
          tipo,
          data: new Date().toISOString().slice(0, 10),
          descricao: descricao.trim(),
          contaId: contaSelecionada,
          valor: valorNumerico,
          consolidado: true,
        }),
      });
      setDescricao('');
      setValor('');
      setSucesso(true);
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Falha ao lançar gasto');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedView style={styles.field}>
            <ThemedText type="smallBold">Descrição</ThemedText>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex.: Mercado"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            />
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="smallBold">Valor</ThemedText>
            <TextInput
              value={valor}
              onChangeText={setValor}
              placeholder="0,00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            />
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="smallBold">Tipo</ThemedText>
            <ThemedView style={styles.row}>
              {(['DESPESA', 'RECEITA'] as const).map((opcao) => (
                <Pressable
                  key={opcao}
                  onPress={() => setTipo(opcao)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: tipo === opcao ? theme.text : theme.backgroundElement,
                    },
                  ]}>
                  <ThemedText
                    type="small"
                    themeColor={tipo === opcao ? 'background' : 'text'}>
                    {opcao === 'DESPESA' ? 'Despesa' : 'Receita'}
                  </ThemedText>
                </Pressable>
              ))}
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.field}>
            <ThemedText type="smallBold">Conta</ThemedText>
            {carregandoContas ? (
              <ActivityIndicator />
            ) : (
              <ThemedView style={styles.row}>
                {(contas ?? []).map((conta) => (
                  <Pressable
                    key={conta.id}
                    onPress={() => setContaId(conta.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          contaSelecionada === conta.id ? theme.text : theme.backgroundElement,
                      },
                    ]}>
                    <ThemedText
                      type="small"
                      themeColor={contaSelecionada === conta.id ? 'background' : 'text'}>
                      {conta.nome}
                    </ThemedText>
                  </Pressable>
                ))}
              </ThemedView>
            )}
          </ThemedView>

          {erro && (
            <ThemedText type="small" style={styles.erro}>
              {erro}
            </ThemedText>
          )}
          {sucesso && (
            <ThemedText type="small" style={styles.sucesso}>
              Gasto lançado com sucesso.
            </ThemedText>
          )}

          <Pressable
            onPress={lancar}
            disabled={!podeEnviar}
            style={[styles.button, { backgroundColor: theme.text, opacity: podeEnviar ? 1 : 0.5 }]}>
            {enviando ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <ThemedText type="smallBold" themeColor="background">
                Lançar
              </ThemedText>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three },
  field: { gap: Spacing.one },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  erro: { color: '#d33' },
  sucesso: { color: '#2a8f4d' },
  button: {
    marginTop: Spacing.three,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
