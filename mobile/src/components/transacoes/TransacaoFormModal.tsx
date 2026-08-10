import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { listarContas } from '@/api/contas';
import { listarGrupos } from '@/api/categorias';
import {
  criarTransacao,
  editarTransacao,
  excluirTransacao,
  type Transacao,
} from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Tipo = 'DESPESA' | 'RECEITA';

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface TransacaoFormModalProps {
  visible: boolean;
  transacao?: Transacao | null;
  onClose: () => void;
  onSaved: () => void;
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
  const { data: gruposData } = useQuery({
    queryKey: ['categorias', 'grupos'],
    queryFn: listarGrupos,
  });

  const [tipo, setTipo] = useState<Tipo>('DESPESA');
  const [data, setData] = useState(hojeISO());
  const [descricao, setDescricao] = useState('');
  const [contaId, setContaId] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);
  const [valor, setValor] = useState('');
  const [consolidado, setConsolidado] = useState(true);
  const [nota, setNota] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (transacao) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicializa o formulário sempre que o modal abre ou a transação alvo muda
      setTipo(transacao.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA');
      setData(transacao.data);
      setDescricao(transacao.descricao);
      setContaId(transacao.contaId);
      setCategoriaId(transacao.categoriaId);
      setValor(String(Math.abs(transacao.valor)).replace('.', ','));
      setConsolidado(transacao.consolidado);
      setNota(transacao.nota ?? '');
    } else {
      setTipo('DESPESA');
      setData(hojeISO());
      setDescricao('');
      setContaId(null);
      setCategoriaId(null);
      setValor('');
      setConsolidado(true);
      setNota('');
    }
    setErro(null);
  }, [visible, transacao]);

  const contaSelecionada = contaId ?? contas[0]?.id ?? null;
  const valorNumerico = Number(valor.replace(',', '.'));

  const categoriasLista = [
    ...(gruposData?.grupos.flatMap((g) => [
      ...g.categorias,
      ...g.subgrupos.flatMap((s) => s.categorias),
    ]) ?? []),
    ...(gruposData?.semGrupo ?? []),
  ];

  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (isEdicaoTransferencia) {
        return editarTransacao(transacao!.id, { data, descricao, nota, consolidado });
      }
      const payload = {
        tipo,
        data,
        descricao: descricao.trim(),
        contaId: contaSelecionada!,
        categoriaId: categoriaId || null,
        valor: valorNumerico,
        consolidado,
        nota: nota || undefined,
      };
      return editando ? editarTransacao(transacao!.id, payload) : criarTransacao(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      onSaved();
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
    isEdicaoTransferencia
      ? descricao.trim().length > 0 && data.length > 0 && !salvarMutation.isPending
      : descricao.trim().length > 0 &&
        valorNumerico > 0 &&
        !!contaSelecionada &&
        data.length > 0 &&
        !salvarMutation.isPending;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">{editando ? 'Editar transação' : 'Nova transação'}</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText type="small" themeColor="textSecondary">
                Fechar
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {isEdicaoTransferencia && (
              <ThemedView type="surface" style={styles.avisoBox}>
                <ThemedText type="small" themeColor="textSecondary">
                  Esta transação faz parte de uma transferência. Só é possível alterar data,
                  descrição, nota e consolidação.
                </ThemedText>
              </ThemedView>
            )}

            {!isEdicaoTransferencia && (
              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">Tipo</ThemedText>
                <ThemedView style={styles.row}>
                  {(['DESPESA', 'RECEITA'] as const).map((opcao) => (
                    <Chip
                      key={opcao}
                      label={opcao === 'DESPESA' ? 'Despesa' : 'Receita'}
                      selected={tipo === opcao}
                      onPress={() => setTipo(opcao)}
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
              <ThemedView style={styles.rowSpaced}>
                <ThemedText type="smallBold">Data</ThemedText>
                <Pressable onPress={() => setData(hojeISO())}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Hoje
                  </ThemedText>
                </Pressable>
              </ThemedView>
              <TextInput
                value={data}
                onChangeText={setData}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText type="smallBold">Descrição</ThemedText>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Ex.: Mercado"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
            </ThemedView>

            {!isEdicaoTransferencia && (
              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">Valor</ThemedText>
                <TextInput
                  value={valor}
                  onChangeText={setValor}
                  placeholder="0,00"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="decimal-pad"
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                />
              </ThemedView>
            )}

            {!isEdicaoTransferencia && (
              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">Categoria</ThemedText>
                <ThemedView style={styles.row}>
                  <Chip label="Sem categoria" selected={!categoriaId} onPress={() => setCategoriaId(null)} />
                  {categoriasLista.map((categoria) => (
                    <Chip
                      key={categoria.id}
                      label={categoria.nome}
                      selected={categoriaId === categoria.id}
                      onPress={() => setCategoriaId(categoria.id)}
                    />
                  ))}
                </ThemedView>
              </ThemedView>
            )}

            {!isEdicaoTransferencia && (
              <ThemedView style={styles.field}>
                <ThemedText type="smallBold">Conta</ThemedText>
                <ThemedView style={styles.row}>
                  {contas.map((conta) => (
                    <Chip
                      key={conta.id}
                      label={conta.nome}
                      selected={contaSelecionada === conta.id}
                      onPress={() => setContaId(conta.id)}
                    />
                  ))}
                </ThemedView>
              </ThemedView>
            )}

            <ThemedView style={styles.rowSpaced}>
              <ThemedText type="smallBold">Consolidado</ThemedText>
              <Switch
                value={consolidado}
                onValueChange={setConsolidado}
                trackColor={{ true: theme.primary }}
              />
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText type="smallBold">Nota (opcional)</ThemedText>
              <TextInput
                value={nota}
                onChangeText={setNota}
                placeholder="Nota"
                placeholderTextColor={theme.textTertiary}
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              />
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

            {editando && (
              <Button
                title={excluirMutation.isPending ? 'Excluindo...' : 'Excluir'}
                variant="destructive"
                onPress={confirmarExclusao}
                disabled={excluirMutation.isPending}
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
  avisoBox: { borderRadius: Radius.md, padding: Spacing.three },
  button: { marginTop: Spacing.one },
});
