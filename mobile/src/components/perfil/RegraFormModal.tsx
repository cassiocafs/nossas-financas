import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { listarContas } from '@/api/contas';
import { criarRegra, editarRegra, type RegraTransacao } from '@/api/regras';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CategoriaSelect } from '@/components/transacoes/CategoriaSelect';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface RegraFormModalProps {
  visible: boolean;
  regra?: RegraTransacao | null;
  onClose: () => void;
}

export function RegraFormModal({ visible, regra, onClose }: RegraFormModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const editando = !!regra;

  const { data: contas = [] } = useQuery({
    queryKey: ['contas'],
    queryFn: () => listarContas(false),
    enabled: visible,
  });

  const [descricao, setDescricao] = useState('');
  const [contaId, setContaId] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicializa o formulário sempre que o modal abre ou a regra alvo muda
    setDescricao(regra?.descricao ?? '');
    setContaId(regra?.contaId ?? null);
    setCategoriaId(regra?.categoriaId ?? null);
    setErro(null);
  }, [visible, regra]);

  const salvarMutation = useMutation({
    mutationFn: () => {
      const input = { descricao: descricao.trim(), contaId: contaId!, categoriaId };
      return editando ? editarRegra(regra!.id, input) : criarRegra(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras'] });
      onClose();
    },
    onError: (err) => {
      setErro(err instanceof ApiError ? err.message : 'Falha ao salvar regra');
    },
  });

  const podeSalvar = descricao.trim().length > 0 && !!contaId && !salvarMutation.isPending;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">{editando ? 'Editar regra' : 'Nova regra'}</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText type="small" themeColor="textSecondary">
                Fechar
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <ThemedView style={styles.field}>
              <ThemedText type="smallBold" style={{ color: theme.expense, textDecorationLine: 'underline' }}>
                Descrição
              </ThemedText>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Ex.: Uber"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
              <ThemedText type="small" themeColor="textSecondary">
                Quando a descrição de uma transação for igual a esta, a conta e a categoria serão
                preenchidas automaticamente.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText type="smallBold" style={{ color: theme.expense, textDecorationLine: 'underline' }}>
                Conta
              </ThemedText>
              <Select
                value={contaId}
                onChange={setContaId}
                title="Selecionar conta"
                placeholder="Selecionar conta"
                clearLabel="Nenhuma"
                options={contas.map((conta) => ({ value: conta.id, label: conta.nome }))}
              />
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText type="smallBold">Categoria</ThemedText>
              <CategoriaSelect value={categoriaId} onChange={setCategoriaId} />
            </ThemedView>

            {erro && (
              <ThemedText type="small" themeColor="expense">
                {erro}
              </ThemedText>
            )}

            <Button
              title={salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
              onPress={() => salvarMutation.mutate()}
              disabled={!podeSalvar}
              loading={salvarMutation.isPending}
              style={styles.button}
            />
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  field: { gap: Spacing.one },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  button: { marginTop: Spacing.one },
});
