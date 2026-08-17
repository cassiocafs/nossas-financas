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
  type Transacao,
} from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CategoriaSelect } from '@/components/transacoes/CategoriaSelect';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { DateField } from '@/components/ui/DateField';
import { Select } from '@/components/ui/Select';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Tipo = 'DESPESA' | 'RECEITA' | 'TRANSFERENCIA';

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface TransacaoFormModalProps {
  visible: boolean;
  transacao?: Transacao | null;
  onClose: () => void;
  onSaved: () => void;
}

function CampoLabel({ children, obrigatorio, cor }: { children: string; obrigatorio?: boolean; cor: string }) {
  return (
    <ThemedText
      type="smallBold"
      style={obrigatorio ? { color: cor, textDecorationLine: 'underline' } : undefined}>
      {children}
    </ThemedText>
  );
}

export function TransacaoFormModal({ visible, transacao, onClose, onSaved }: TransacaoFormModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const editando = !!transacao;
  const isEdicaoTransferencia = !!transacao?.transferenciaGrupoId;

  const { data: contas = [] } = useQuery({
    queryKey: ['contas'],
    queryFn: () => listarContas(false),
  });
  const { data: transferencia } = useQuery({
    queryKey: ['transferencia', transacao?.transferenciaGrupoId],
    queryFn: () => buscarTransferencia(transacao!.transferenciaGrupoId!),
    enabled: isEdicaoTransferencia,
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
  }, [visible, transacao]);

  useEffect(() => {
    if (!transferencia || contaOrigemId || contaDestinoId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preenche os campos editáveis assim que a transferência carrega
    setContaOrigemId(transferencia.contaOrigem?.id ?? null);
    setContaDestinoId(transferencia.contaDestino?.id ?? null);
  }, [transferencia, contaOrigemId, contaDestinoId]);

  function resetarFormulario() {
    setTipo('DESPESA');
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

  function handleValorChange(texto: string) {
    const digitos = texto.replace(/\D/g, '');
    setValorCentavos(digitos ? parseInt(digitos, 10) : null);
  }

  const salvarMutation = useMutation({
    mutationFn: async (opcao: 'fechar' | 'novo') => {
      if (tipo === 'TRANSFERENCIA') {
        if (editando) await excluirTransacao(transacao!.id);
        return criarTransferencia({
          data,
          descricao: descricao.trim() || undefined,
          contaOrigemId: contaOrigemId!,
          contaDestinoId: contaDestinoId!,
          valor: valorNumerico,
          consolidado,
          nota: nota || undefined,
        });
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
      return editando ? editarTransacao(transacao!.id, payload) : criarTransacao(payload);
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
    mutationFn: () => excluirTransacao(transacao!.id),
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

  const descricaoObrigatoria = tipo !== 'TRANSFERENCIA';
  const contaObrigatoria = tipo !== 'TRANSFERENCIA';
  const contasTransferenciaObrigatorias = tipo === 'TRANSFERENCIA';

  const bloqueado = salvarMutation.isPending || excluirMutation.isPending;

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
            <Pressable onPress={onClose} disabled={bloqueado}>
              <ThemedText type="small" themeColor={bloqueado ? 'textTertiary' : 'textSecondary'}>
                Fechar
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {!isEdicaoTransferencia && (
              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">Tipo</ThemedText>
                <ThemedView style={styles.row}>
                  {(['DESPESA', 'RECEITA', 'TRANSFERENCIA'] as const).map((opcao) => (
                    <Chip
                      key={opcao}
                      label={
                        opcao === 'DESPESA' ? 'Despesa' : opcao === 'RECEITA' ? 'Receita' : 'Transferência'
                      }
                      selected={tipo === opcao}
                      onPress={() => setTipo(opcao)}
                      disabled={bloqueado}
                    />
                  ))}
                </ThemedView>
              </ThemedView>
            )}

            {isEdicaoTransferencia && transacao?.tipo === 'TRANSFERENCIA' && (
              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">Tipo</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Transferência
                </ThemedText>
              </ThemedView>
            )}

            <ThemedView style={styles.field}>
              <CampoLabel obrigatorio cor={theme.expense}>Valor</CampoLabel>
              <TextInput
                value={valorExibicao}
                onChangeText={handleValorChange}
                placeholder="0,00"
                placeholderTextColor={theme.textTertiary}
                keyboardType="number-pad"
                selection={{ start: valorExibicao.length, end: valorExibicao.length }}
                editable={!bloqueado}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedView style={styles.rowSpaced}>
                <CampoLabel obrigatorio cor={theme.expense}>Data</CampoLabel>
                <Pressable onPress={() => setData(hojeISO())} disabled={bloqueado}>
                  <ThemedText type="small" themeColor={bloqueado ? 'textTertiary' : 'textSecondary'}>
                    Hoje
                  </ThemedText>
                </Pressable>
              </ThemedView>
              <DateField value={data} onChange={setData} disabled={bloqueado} />
            </ThemedView>

            <ThemedView style={styles.field}>
              <CampoLabel obrigatorio={descricaoObrigatoria} cor={theme.expense}>
                Descrição
              </CampoLabel>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Ex.: Mercado"
                placeholderTextColor={theme.textTertiary}
                editable={!bloqueado}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
            </ThemedView>

            {tipo !== 'TRANSFERENCIA' && (
              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">Categoria</ThemedText>
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
                />
              </ThemedView>
            )}

            {tipo !== 'TRANSFERENCIA' && (
              <ThemedView style={styles.field}>
                <CampoLabel obrigatorio={contaObrigatoria} cor={theme.expense}>
                  Conta
                </CampoLabel>
                <Select
                  value={contaId}
                  onChange={(v) => {
                    setContaId(v);
                    setContaTocada(true);
                  }}
                  title="Selecionar conta"
                  placeholder="Selecionar conta"
                  clearLabel="Nenhuma"
                  options={contas.map((conta) => ({ value: conta.id, label: conta.nome }))}
                  disabled={bloqueado}
                />
              </ThemedView>
            )}

            {tipo === 'TRANSFERENCIA' && (
              <>
                <ThemedView style={styles.field}>
                  <CampoLabel obrigatorio={contasTransferenciaObrigatorias} cor={theme.expense}>
                    Conta origem
                  </CampoLabel>
                  <Select
                    value={contaOrigemId}
                    onChange={setContaOrigemId}
                    title="Selecionar conta de origem"
                    placeholder="Selecionar conta"
                    clearLabel="Nenhuma"
                    options={contas.map((conta) => ({ value: conta.id, label: conta.nome }))}
                    disabled={bloqueado}
                  />
                </ThemedView>
                <ThemedView style={styles.field}>
                  <CampoLabel obrigatorio={contasTransferenciaObrigatorias} cor={theme.expense}>
                    Conta destino
                  </CampoLabel>
                  <Select
                    value={contaDestinoId}
                    onChange={setContaDestinoId}
                    title="Selecionar conta de destino"
                    placeholder="Selecionar conta"
                    clearLabel="Nenhuma"
                    options={contas.map((conta) => ({ value: conta.id, label: conta.nome }))}
                    disabled={bloqueado}
                  />
                </ThemedView>
              </>
            )}

            <ThemedView style={styles.rowSpaced}>
              <ThemedText type="smallBold">Consolidado</ThemedText>
              <Switch
                value={consolidado}
                onValueChange={setConsolidado}
                trackColor={{ true: theme.primary }}
                disabled={bloqueado}
              />
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText type="smallBold">Nota (opcional)</ThemedText>
              <TextInput
                value={nota}
                onChangeText={setNota}
                placeholder="Nota"
                placeholderTextColor={theme.textTertiary}
                editable={!bloqueado}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
            </ThemedView>

            {erro && (
              <ThemedText type="small" themeColor="expense">
                {erro}
              </ThemedText>
            )}

            {editando ? (
              <Button
                title={salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
                onPress={() => salvarMutation.mutate('fechar')}
                disabled={!podeSalvar}
                loading={salvarMutation.isPending}
                style={styles.button}
              />
            ) : (
              <ThemedView style={[styles.row, styles.button]}>
                <Button
                  title={
                    salvarMutation.isPending && salvarMutation.variables === 'fechar' ? 'Salvando...' : 'Salvar'
                  }
                  onPress={() => salvarMutation.mutate('fechar')}
                  disabled={!podeSalvar}
                  loading={salvarMutation.isPending && salvarMutation.variables === 'fechar'}
                  style={styles.flexButton}
                />
                <Button
                  title={
                    salvarMutation.isPending && salvarMutation.variables === 'novo'
                      ? 'Salvando...'
                      : 'Salvar e Novo'
                  }
                  variant="secondary"
                  onPress={() => salvarMutation.mutate('novo')}
                  disabled={!podeSalvar}
                  loading={salvarMutation.isPending && salvarMutation.variables === 'novo'}
                  style={styles.flexButton}
                />
              </ThemedView>
            )}

            {editando && (
              <Button
                title={excluirMutation.isPending ? 'Excluindo...' : 'Excluir'}
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
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  field: { gap: Spacing.one },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  rowSpaced: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  button: { marginTop: Spacing.one },
  flexButton: { flex: 1 },
});
