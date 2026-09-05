import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, NetworkError } from '@/api/client';
import { listarContas } from '@/api/contas';
import { sugerirTransacao } from '@/api/regras';
import {
  buscarTransferencia,
  criarTransacao,
  criarTransferencia,
  editarTransacao,
  excluirTransacao,
} from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CategoriaSelect } from '@/components/transacoes/CategoriaSelect';
import { AppSwitch } from '@/components/ui/AppSwitch';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { IconButton } from '@/components/ui/IconButton';
import { MascotMessage } from '@/components/ui/MascotMessage';
import { MoneyInput, type MoneySign } from '@/components/ui/MoneyInput';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useNetworkState } from '@/hooks/use-network-state';
import { useTheme } from '@/hooks/use-theme';
import type { TransacaoComPendencia } from '@/hooks/use-transacoes-com-pendencias';
import {
  atualizarTransferenciaPendente,
  enqueueCriarTransacao,
  enqueueCriarTransferencia,
  enqueueEditarTransacao,
  enqueueExcluirTransacao,
  operacaoPendenteParaId,
  removerTransferenciaPendente,
  transferenciaPendente,
} from '@/lib/syncQueue';

type Tipo = 'DESPESA' | 'RECEITA' | 'TRANSFERENCIA';
type Theme = ReturnType<typeof useTheme>;

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface TransacaoFormModalProps {
  visible: boolean;
  transacao?: TransacaoComPendencia | null;
  /** Tipo pré-selecionado ao abrir o formulário para uma nova transação (ignorado em edição). */
  tipoInicial?: 'DESPESA' | 'RECEITA';
  onClose: () => void;
  onSaved: () => void;
}

const TIPO_TABS: { value: Tipo; label: string }[] = [
  { value: 'DESPESA', label: 'Saiu' },
  { value: 'RECEITA', label: 'Entrou' },
  { value: 'TRANSFERENCIA', label: 'Transferir' },
];

function hintValor(tipo: Tipo): string {
  if (tipo === 'TRANSFERENCIA') return 'Move dinheiro entre suas contas, sem contar como receita nem despesa.';
  if (tipo === 'RECEITA') return 'Uma entrada nova no mês.';
  return 'Gastar não é erro — é só registrar.';
}

function dicaMascote(tipo: Tipo): string {
  if (tipo === 'TRANSFERENCIA') return 'Transferências só mudam seu dinheiro de lugar — não mexem no total.';
  if (tipo === 'RECEITA') return 'Boa! Toda entrada registrada deixa seu mês mais claro.';
  return 'Cada gasto registrado deixa seu mês mais claro. Você está indo bem.';
}

function CampoTexto({
  label,
  value,
  onChangeText,
  placeholder,
  disabled,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
  disabled?: boolean;
  theme: Theme;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="label" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        editable={!disabled}
        style={[styles.fieldInput, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
      />
    </View>
  );
}

export function TransacaoFormModal({ visible, transacao, tipoInicial, onClose, onSaved }: TransacaoFormModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { isConnected } = useNetworkState();
  const editando = !!transacao;
  const isEdicaoTransferencia = !!transacao?.transferenciaGrupoId;
  // Transferência ainda não sincronizada (criada offline): não existe no servidor
  // ainda, então as contas de origem/destino vêm da própria fila, não de uma busca.
  const transferenciaAindaPendente =
    isEdicaoTransferencia && transacao?.pendenteSync === 'criar'
      ? transferenciaPendente(transacao.transferenciaGrupoId!)
      : undefined;

  const { data: contas = [] } = useQuery({
    queryKey: ['contas'],
    queryFn: () => listarContas(false),
  });
  const { data: transferencia } = useQuery({
    queryKey: ['transferencia', transacao?.transferenciaGrupoId],
    queryFn: () => buscarTransferencia(transacao!.transferenciaGrupoId!),
    enabled: isEdicaoTransferencia && !transferenciaAindaPendente,
  });
  const [tipo, setTipo] = useState<Tipo>('DESPESA');
  const [data, setData] = useState(hojeISO());
  const [descricao, setDescricao] = useState('');
  const [contaId, setContaId] = useState<string | null>(null);
  const [contaOrigemId, setContaOrigemId] = useState<string | null>(null);
  const [contaDestinoId, setContaDestinoId] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [valorCentavos, setValorCentavos] = useState<number | null>(null);
  const [consolidado, setConsolidado] = useState(true);
  const [nota, setNota] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [contaTocada, setContaTocada] = useState(false);
  const [categoriaTocada, setCategoriaTocada] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (transacao) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicializa o formulário sempre que o modal abre ou a transação alvo muda
      setTipo(transacao.tipo === 'RECEITA' ? 'RECEITA' : transacao.tipo === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'DESPESA');
      setData(transacao.data);
      setDescricao(transacao.descricao);
      setContaId(transacao.contaId);
      setContaOrigemId(null);
      setContaDestinoId(null);
      setCategoriaId(transacao.categoriaId);
      setValorCentavos(Math.round(Math.abs(transacao.valor) * 100));
      setConsolidado(transacao.consolidado);
      setNota(transacao.nota ?? '');
      setContaTocada(true);
      setCategoriaTocada(true);
      setErro(null);
    } else {
      resetarFormulario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tipoInicial só deve reaplicar quando o modal reabre
  }, [visible, transacao]);

  useEffect(() => {
    if (contaOrigemId || contaDestinoId) return;
    if (transferenciaAindaPendente) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preenche os campos editáveis a partir da fila pendente
      setContaOrigemId(transferenciaAindaPendente.payload.contaOrigemId);
      setContaDestinoId(transferenciaAindaPendente.payload.contaDestinoId);
      return;
    }
    if (!transferencia) return;
    setContaOrigemId(transferencia.contaOrigem?.id ?? null);
    setContaDestinoId(transferencia.contaDestino?.id ?? null);
  }, [transferencia, transferenciaAindaPendente, contaOrigemId, contaDestinoId]);

  function resetarFormulario() {
    setTipo(tipoInicial ?? 'DESPESA');
    setData(hojeISO());
    setDescricao('');
    setContaId(null);
    setContaOrigemId(null);
    setContaDestinoId(null);
    setCategoriaId(null);
    setValorCentavos(null);
    setConsolidado(true);
    setNota('');
    setContaTocada(false);
    setCategoriaTocada(false);
    setErro(null);
  }

  /**
   * Limpa apenas os campos específicos da transação recém-criada, mantendo
   * tipo, data, conta e categoria para agilizar o lançamento em sequência.
   */
  function resetarParaNovaTransacao() {
    setDescricao('');
    setValorCentavos(null);
    setConsolidado(true);
    setNota('');
    setErro(null);
    // Conta e categoria são reaproveitadas: marca como "tocadas" para que a
    // sugestão automática por descrição não as sobrescreva.
    setContaTocada(true);
    setCategoriaTocada(true);
  }

  useEffect(() => {
    if (!visible || editando || tipo === 'TRANSFERENCIA') return;
    if (contaTocada && categoriaTocada) return;
    if (!descricao.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const regra = await sugerirTransacao(descricao.trim());
        if (regra.contaId && !contaTocada) {
          setContaId(regra.contaId);
        }
        if (regra.categoriaId && !categoriaTocada) {
          setCategoriaId(regra.categoriaId);
        }
      } catch {
        // sugestão é best-effort, ignora falha
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descricao, visible, editando, tipo]);

  const valorNumerico = (valorCentavos ?? 0) / 100;

  async function criarTransacaoComFallbackOffline(payload: Parameters<typeof criarTransacao>[0]) {
    if (!isConnected) {
      enqueueCriarTransacao(payload);
      return;
    }
    try {
      return await criarTransacao(payload);
    } catch (err) {
      if (err instanceof NetworkError) {
        enqueueCriarTransacao(payload);
        return;
      }
      throw err;
    }
  }

  async function criarTransferenciaComFallbackOffline(payload: Parameters<typeof criarTransferencia>[0]) {
    if (!isConnected) {
      enqueueCriarTransferencia(payload);
      return;
    }
    try {
      return await criarTransferencia(payload);
    } catch (err) {
      if (err instanceof NetworkError) {
        enqueueCriarTransferencia(payload);
        return;
      }
      throw err;
    }
  }

  const salvarMutation = useMutation({
    mutationFn: async (opcao: 'fechar' | 'novo') => {
      if (tipo === 'TRANSFERENCIA') {
        const payloadTransferencia = {
          data,
          descricao: descricao.trim() || undefined,
          contaOrigemId: contaOrigemId!,
          contaDestinoId: contaDestinoId!,
          valor: valorNumerico,
          consolidado,
          nota: nota || undefined,
        };

        if (editando) {
          if (transferenciaAindaPendente) {
            // Nunca chegou ao servidor: só atualiza o payload em fila, sem excluir/recriar nada remotamente.
            atualizarTransferenciaPendente(transferenciaAindaPendente.grupoId, payloadTransferencia);
            return;
          }
          // Já sincronizada: editar uma transferência é excluir a antiga e criar uma nova (mesmo fluxo online de sempre).
          if (!isConnected) {
            enqueueExcluirTransacao(transacao!.id);
          } else {
            await excluirTransacao(transacao!.id);
          }
        }

        return criarTransferenciaComFallbackOffline(payloadTransferencia);
      }

      const payload = {
        tipo,
        data,
        descricao: descricao.trim(),
        contaId: contaId!,
        categoriaId: categoriaId || null,
        valor: valorNumerico,
        consolidado,
        nota: nota || undefined,
      };

      if (editando) {
        if (isEdicaoTransferencia) {
          // Transação estava vinculada a uma transferência: converter para despesa/receita
          // exige excluir as duas pernas vinculadas e criar um registro novo e independente.
          if (transferenciaAindaPendente) {
            removerTransferenciaPendente(transferenciaAindaPendente.grupoId);
          } else if (!isConnected) {
            enqueueExcluirTransacao(transacao!.id);
          } else {
            await excluirTransacao(transacao!.id);
          }

          if (!isConnected) {
            enqueueCriarTransacao(payload);
            return;
          }
          return criarTransacao(payload);
        }

        const pendente = operacaoPendenteParaId(transacao!.id);
        if (pendente || !isConnected) {
          enqueueEditarTransacao(transacao!.id, payload);
          return;
        }
        return editarTransacao(transacao!.id, payload);
      }

      return criarTransacaoComFallbackOffline(payload);
    },
    onSuccess: (_dados, opcao) => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      if (opcao === 'novo') {
        resetarParaNovaTransacao();
      } else {
        onSaved();
      }
    },
    onError: (err) => {
      setErro(err instanceof ApiError ? err.message : 'Falha ao salvar transação');
    },
  });

  const excluirMutation = useMutation({
    mutationFn: async () => {
      if (transferenciaAindaPendente) {
        removerTransferenciaPendente(transferenciaAindaPendente.grupoId);
        return;
      }
      const pendente = operacaoPendenteParaId(transacao!.id);
      if (pendente || !isConnected) {
        enqueueExcluirTransacao(transacao!.id);
        return;
      }
      return excluirTransacao(transacao!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['contas'] });
      onSaved();
    },
    onError: (err) => {
      setErro(err instanceof ApiError ? err.message : 'Falha ao excluir transação');
    },
  });

  function confirmarExclusao() {
    Alert.alert('Excluir transação', 'Tem certeza que deseja excluir essa transação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirMutation.mutate() },
    ]);
  }

  const podeSalvar =
    tipo === 'TRANSFERENCIA'
      ? !!contaOrigemId &&
        !!contaDestinoId &&
        contaOrigemId !== contaDestinoId &&
        valorNumerico > 0 &&
        data.length > 0 &&
        !salvarMutation.isPending
      : descricao.trim().length > 0 &&
        valorNumerico > 0 &&
        !!contaId &&
        data.length > 0 &&
        !salvarMutation.isPending;

  const bloqueado = salvarMutation.isPending || excluirMutation.isPending;
  const sign: MoneySign = tipo === 'RECEITA' ? 'in' : tipo === 'TRANSFERENCIA' ? 'none' : 'out';

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
              {editando ? 'Editar transação' : 'Nova transação'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.tabsWrap}>
            <Tabs items={TIPO_TABS} value={tipo} onChange={setTipo} disabled={bloqueado} />
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <MoneyInput
              label="Quanto foi?"
              valorCentavos={valorCentavos}
              onChange={setValorCentavos}
              sign={sign}
              hint={hintValor(tipo)}
              disabled={bloqueado}
            />

            <CampoTexto
              label="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex.: mercado da esquina"
              disabled={bloqueado}
              theme={theme}
            />

            {tipo !== 'TRANSFERENCIA' && (
              <CategoriaSelect
                value={categoriaId}
                onChange={(v) => {
                  setCategoriaId(v);
                  setCategoriaTocada(true);
                }}
                title="Selecionar categoria"
                placeholder="Sem categoria"
                clearLabel="Sem categoria"
                disabled={bloqueado}
                variant="row"
                label="Categoria"
              />
            )}

            {tipo !== 'TRANSFERENCIA' && (
              <Select
                value={contaId}
                onChange={(v) => {
                  setContaId(v);
                  setContaTocada(true);
                }}
                title="Selecionar conta"
                placeholder="Selecionar"
                clearLabel="Nenhuma"
                options={contas.map((conta) => ({ value: conta.id, label: conta.nome }))}
                disabled={bloqueado}
                variant="row"
                label="Conta"
              />
            )}

            {tipo === 'TRANSFERENCIA' && (
              <>
                <Select
                  value={contaOrigemId}
                  onChange={setContaOrigemId}
                  title="Selecionar conta de origem"
                  placeholder="Selecionar"
                  clearLabel="Nenhuma"
                  options={contas
                    .filter((conta) => conta.id !== contaDestinoId)
                    .map((conta) => ({ value: conta.id, label: conta.nome }))}
                  disabled={bloqueado}
                  variant="row"
                  label="De"
                />
                <Select
                  value={contaDestinoId}
                  onChange={setContaDestinoId}
                  title="Selecionar conta de destino"
                  placeholder="Selecionar"
                  clearLabel="Nenhuma"
                  options={contas
                    .filter((conta) => conta.id !== contaOrigemId)
                    .map((conta) => ({ value: conta.id, label: conta.nome }))}
                  disabled={bloqueado}
                  variant="row"
                  label="Para"
                />
              </>
            )}

            <DateField value={data} onChange={setData} disabled={bloqueado} variant="row" label="Data" />

            <ThemedView style={[styles.switchCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <AppSwitch value={consolidado} onValueChange={setConsolidado} label="Já foi pago" disabled={bloqueado} />
            </ThemedView>

            <CampoTexto
              label="Nota"
              value={nota}
              onChangeText={setNota}
              placeholder="Opcional"
              disabled={bloqueado}
              theme={theme}
            />

            <MascotMessage>{dicaMascote(tipo)}</MascotMessage>

            {erro ? (
              <ThemedText type="small" themeColor="destructive" style={styles.erro}>
                {erro}
              </ThemedText>
            ) : null}

            {editando ? (
              <Button
                title={excluirMutation.isPending ? 'Excluindo...' : 'Excluir transação'}
                variant="destructive"
                onPress={confirmarExclusao}
                disabled={bloqueado}
                loading={excluirMutation.isPending}
                style={styles.deleteButton}
              />
            ) : null}
          </ScrollView>

          <ThemedView style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.divider }]}>
            <Button
              title={
                salvarMutation.isPending && (editando || salvarMutation.variables === 'fechar')
                  ? 'Salvando...'
                  : 'Salvar transação'
              }
              size="lg"
              fullWidth
              onPress={() => salvarMutation.mutate('fechar')}
              disabled={!podeSalvar}
              loading={editando ? salvarMutation.isPending : salvarMutation.isPending && salvarMutation.variables === 'fechar'}
            />
            {!editando ? (
              <Button
                title={
                  salvarMutation.isPending && salvarMutation.variables === 'novo' ? 'Salvando...' : 'Salvar e criar nova'
                }
                variant="tertiary"
                size="sm"
                fullWidth
                onPress={() => salvarMutation.mutate('novo')}
                disabled={!podeSalvar}
                loading={salvarMutation.isPending && salvarMutation.variables === 'novo'}
              />
            ) : (
              <Button title="Cancelar" variant="tertiary" size="sm" fullWidth onPress={onClose} disabled={bloqueado} />
            )}
          </ThemedView>
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
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerTitle: { flex: 1 },
  tabsWrap: { paddingHorizontal: Spacing.page, paddingBottom: Spacing.three },
  scroll: { paddingHorizontal: Spacing.page, paddingTop: Spacing.one, paddingBottom: Spacing.six * 2, gap: Spacing.gap },
  field: { gap: Spacing.one },
  fieldInput: {
    borderWidth: 1,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.three,
    height: 48,
    fontFamily: Fonts.body,
    fontSize: 16,
  },
  switchCard: {
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: 18,
    paddingVertical: Spacing.two,
  },
  erro: { textAlign: 'center' },
  deleteButton: { marginTop: Spacing.two },
  footer: {
    paddingHorizontal: Spacing.page,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
  },
});
