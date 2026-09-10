import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import {
  buscarImpactoExclusaoConta,
  criarConta,
  editarConta,
  excluirConta,
  type Conta,
} from '@/api/contas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppSwitch } from '@/components/ui/AppSwitch';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ContaFormModalProps {
  visible: boolean;
  conta?: Conta | null;
  onClose: () => void;
}

function centavosDe(valor: number): number {
  return Math.round(Math.abs(valor) * 100);
}

export function ContaFormModal({ visible, conta, onClose }: ContaFormModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const editando = !!conta;

  const [nome, setNome] = useState('');
  const [valorCentavos, setValorCentavos] = useState<number | null>(null);
  const [negativo, setNegativo] = useState(false);
  const [ativa, setAtiva] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- semeia o formulário quando o modal abre */
  useEffect(() => {
    if (!visible) return;
    setErro(null);
    setNome(conta?.nome ?? '');
    setValorCentavos(conta ? centavosDe(conta.saldoInicial) : null);
    setNegativo(conta ? conta.saldoInicial < 0 : false);
    setAtiva(conta ? conta.ativa : true);
  }, [visible, conta]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ['contas'] });
  }

  const salvarMutation = useMutation({
    mutationFn: () => {
      const saldoInicial = ((negativo ? -1 : 1) * (valorCentavos ?? 0)) / 100;
      const input = { nome: nome.trim(), saldoInicial, ativa };
      return editando ? editarConta(conta!.id, input) : criarConta(input);
    },
    onSuccess: () => {
      invalidar();
      onClose();
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Não foi possível salvar a conta.'),
  });

  const excluirMutation = useMutation({
    mutationFn: (estrategia?: 'excluirTransacoes') =>
      excluirConta(conta!.id, estrategia ? { estrategia } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      onClose();
    },
    onError: (e) =>
      Alert.alert('Não foi possível excluir', e instanceof ApiError ? e.message : 'Tente novamente.'),
  });

  async function confirmarExclusao() {
    if (!conta) return;
    let vinculadas = 0;
    try {
      vinculadas = (await buscarImpactoExclusaoConta(conta.id)).transacoesVinculadas;
    } catch {
      // segue com o aviso genérico
    }

    if (vinculadas > 0) {
      Alert.alert(
        `Excluir "${conta.nome}"`,
        `Esta conta tem ${vinculadas} transação(ões). Para manter o histórico, arquive a conta em vez de excluir. Excluir apaga a conta e todas as transações dela.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Arquivar',
            onPress: () => {
              setAtiva(false);
              editarConta(conta.id, { ativa: false }).then(() => {
                queryClient.invalidateQueries({ queryKey: ['contas'] });
                onClose();
              });
            },
          },
          {
            text: 'Excluir tudo',
            style: 'destructive',
            onPress: () => excluirMutation.mutate('excluirTransacoes'),
          },
        ],
      );
      return;
    }

    Alert.alert(`Excluir "${conta.nome}"`, 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirMutation.mutate(undefined) },
    ]);
  }

  const bloqueado = salvarMutation.isPending || excluirMutation.isPending;
  const podeSalvar = nome.trim().length > 0 && !bloqueado;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => !bloqueado && onClose()}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <IconButton icon="x" label="Fechar" onPress={onClose} disabled={bloqueado} />
            <ThemedText type="subtitle" style={styles.headerTitle}>
              {editando ? 'Editar conta' : 'Nova conta'}
            </ThemedText>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.field}>
              <ThemedText type="label" themeColor="textSecondary">
                Nome
              </ThemedText>
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Nubank, Carteira, Poupança"
                placeholderTextColor={theme.textTertiary}
                editable={!bloqueado}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.card, borderColor: theme.border },
                ]}
              />
            </View>

            <MoneyInput
              label="Saldo inicial"
              valorCentavos={valorCentavos}
              onChange={setValorCentavos}
              sign={negativo ? 'out' : 'none'}
              hint="Quanto havia nesta conta quando você começou a registrar."
              disabled={bloqueado}
            />

            <AppSwitch
              value={negativo}
              onValueChange={setNegativo}
              label="Começa no negativo"
              hint="Ative para cartões de crédito ou contas no vermelho."
              disabled={bloqueado}
            />

            <AppSwitch
              value={ativa}
              onValueChange={setAtiva}
              label="Conta ativa"
              hint="Contas arquivadas não aparecem nos seletores nem no saldo."
              disabled={bloqueado}
            />

            {erro ? (
              <ThemedText type="small" themeColor="destructive">
                {erro}
              </ThemedText>
            ) : null}

            <Button
              title={salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
              onPress={() => salvarMutation.mutate()}
              loading={salvarMutation.isPending}
              disabled={!podeSalvar}
              fullWidth
            />

            {editando ? (
              <Button
                title="Excluir conta"
                variant="destructive"
                onPress={confirmarExclusao}
                disabled={bloqueado}
                fullWidth
              />
            ) : null}
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
    gap: Spacing.two,
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: { flex: 1 },
  scroll: { padding: Spacing.page, gap: Spacing.four, paddingBottom: Spacing.six },
  field: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.three,
    height: 48,
    fontSize: 16,
  },
});
