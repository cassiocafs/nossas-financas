import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
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
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { Select } from '@/components/ui/Select';
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

function corDoTipo(tipo: Tipo, theme: Theme) {
  if (tipo === 'RECEITA') return { cor: theme.income, corSuave: theme.incomeSoft };
  if (tipo === 'TRANSFERENCIA') return { cor: theme.transfer, corSuave: theme.transferSoft };
  return { cor: theme.expense, corSuave: theme.expenseSoft };
}

function CampoTextoRow({
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
    <ThemedView style={[styles.row, { backgroundColor: theme.surface }]}>
      <ThemedText type="default" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        editable={!disabled}
        textAlign="right"
        style={[styles.rowInput, { color: theme.text }]}
      />
    </ThemedView>
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
  const valorExibicao =
    valorCentavos == null
      ? ''
      : (valorCentavos / 100).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  const valorInputTexto = valorCentavos == null ? '' : `R$ ${valorExibicao}`;

  function handleValorChange(texto: string) {
    const digitos = texto.replace(/\D/g, '');
    setValorCentavos(digitos ? parseInt(digitos, 10) : null);
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

        if (!isConnected) {
          enqueueCriarTransferencia(payloadTransferencia);
          return;
        }
        return criarTransferencia(payloadTransferencia);
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
        const pendente = operacaoPendenteParaId(transacao!.id);
        if (pendente || !isConnected) {
          enqueueEditarTransacao(transacao!.id, payload);
          return;
        }
        return editarTransacao(transacao!.id, payload);
      }

      if (!isConnected) {
        enqueueCriarTransacao(payload);
        return;
      }
      return criarTransacao(payload);
    },
    onSuccess: (_dados, opcao) => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      if (opcao === 'novo') {
        resetarFormulario();
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
  const tipoBloqueado = bloqueado || isEdicaoTransferencia;
  const { cor: corTipo } = corDoTipo(tipo, theme);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => !bloqueado && onClose()}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">{editando ? 'Editar transação' : 'Nova transação'}</ThemedText>
            <Pressable
              onPress={onClose}
              disabled={bloqueado}
              hitSlop={8}
              style={[styles.closeButton, { backgroundColor: theme.surface, opacity: bloqueado ? 0.5 : 1 }]}
              accessibilityRole="button">
              <Feather name="x" size={18} color={theme.text} />
            </Pressable>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <ThemedView style={[styles.segmented, { backgroundColor: theme.surface }]}>
              {(['DESPESA', 'RECEITA', 'TRANSFERENCIA'] as const).map((opcao) => {
                const selecionado = tipo === opcao;
                const { cor, corSuave } = corDoTipo(opcao, theme);
                return (
                  <Pressable
                    key={opcao}
                    onPress={() => setTipo(opcao)}
                    disabled={tipoBloqueado}
                    style={[styles.segmentedItem, selecionado && { backgroundColor: corSuave }]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selecionado, disabled: tipoBloqueado }}>
                    <ThemedText type="smallBold" style={{ color: selecionado ? cor : theme.textSecondary }}>
                      {opcao === 'DESPESA' ? 'Despesa' : opcao === 'RECEITA' ? 'Receita' : 'Transf.'}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ThemedView>

            <ThemedView style={[styles.valorCard, { backgroundColor: theme.surface }]}>
              <ThemedText type="caption" themeColor="textTertiary" style={styles.valorLabel}>
                VALOR
              </ThemedText>
              <TextInput
                value={valorInputTexto}
                onChangeText={handleValorChange}
                placeholder="R$ 0,00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="number-pad"
                selection={{ start: valorInputTexto.length, end: valorInputTexto.length }}
                editable={!bloqueado}
                style={[styles.valorInput, { color: corTipo }]}
              />
            </ThemedView>

            <DateField value={data} onChange={setData} disabled={bloqueado} variant="row" label="Data" />

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
                  label="Conta origem"
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
                  label="Conta destino"
                />
              </>
            )}

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

            <CampoTextoRow
              label="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex.: Mercado"
              disabled={bloqueado}
              theme={theme}
            />

            <ThemedView style={[styles.row, { backgroundColor: theme.surface }]}>
              <ThemedText type="default" themeColor="textSecondary">
                Consolidado
              </ThemedText>
              <Switch
                value={consolidado}
                onValueChange={setConsolidado}
                trackColor={{ true: theme.primary }}
                disabled={bloqueado}
              />
            </ThemedView>

            <CampoTextoRow
              label="Nota"
              value={nota}
              onChangeText={setNota}
              placeholder="Opcional"
              disabled={bloqueado}
              theme={theme}
            />

            {erro && (
              <ThemedText type="small" themeColor="expense" style={styles.erro}>
                {erro}
              </ThemedText>
            )}

            <Button
              title={
                editando
                  ? salvarMutation.isPending
                    ? 'Salvando...'
                    : 'Salvar transação'
                  : salvarMutation.isPending && salvarMutation.variables === 'fechar'
                    ? 'Salvando...'
                    : 'Salvar transação'
              }
              onPress={() => salvarMutation.mutate('fechar')}
              disabled={!podeSalvar}
              loading={editando ? salvarMutation.isPending : salvarMutation.isPending && salvarMutation.variables === 'fechar'}
              style={styles.button}
            />

            {!editando && (
              <Button
                title={
                  salvarMutation.isPending && salvarMutation.variables === 'novo' ? 'Salvando...' : 'Salvar e criar nova'
                }
                variant="ghost"
                onPress={() => salvarMutation.mutate('novo')}
                disabled={!podeSalvar}
                loading={salvarMutation.isPending && salvarMutation.variables === 'novo'}
              />
            )}

            {editando && (
              <Button
                title={excluirMutation.isPending ? 'Excluindo...' : 'Excluir transação'}
                variant="destructive"
                onPress={confirmarExclusao}
                disabled={bloqueado}
                loading={excluirMutation.isPending}
              />
            )}
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  segmented: {
    flexDirection: 'row',
    borderRadius: Radius.sm,
    padding: 4,
    gap: 4,
    marginBottom: Spacing.two,
  },
  segmentedItem: {
    flex: 1,
    height: 40,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valorCard: {
    borderRadius: Radius.lg,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  valorLabel: { letterSpacing: 1.2 },
  valorInput: {
    fontFamily: Fonts.displayBold,
    fontSize: 36,
    lineHeight: 42,
    textAlign: 'center',
    padding: 0,
    minWidth: '100%',
  },
  row: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowInput: {
    flex: 1,
    marginLeft: Spacing.two,
    fontFamily: Fonts.bodySemi,
    fontSize: 16,
    padding: 0,
  },
  erro: { textAlign: 'center' },
  button: { marginTop: Spacing.two },
});
