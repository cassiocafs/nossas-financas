import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import {
  buscarImpactoExclusaoCategoria,
  criarCategoria,
  criarGrupo,
  criarSubgrupo,
  editarCategoria,
  excluirCategoria,
  listarGrupos,
  type Categoria,
  type TipoCategoria,
} from '@/api/categorias';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppSwitch } from '@/components/ui/AppSwitch';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const NOVO = '__novo__';

const TIPO_TABS: { value: TipoCategoria; label: string }[] = [
  { value: 'AMBOS', label: 'Ambos' },
  { value: 'DESPESA', label: 'Despesa' },
  { value: 'RECEITA', label: 'Receita' },
];

interface CategoriaFormModalProps {
  visible: boolean;
  categoria?: Categoria | null;
  grupoIdInicial?: string | null;
  subgrupoIdInicial?: string | null;
  onClose: () => void;
}

export function CategoriaFormModal({
  visible,
  categoria,
  grupoIdInicial,
  subgrupoIdInicial,
  onClose,
}: CategoriaFormModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const editando = !!categoria;

  const { data } = useQuery({ queryKey: ['categorias', 'grupos'], queryFn: listarGrupos, enabled: visible });

  const [nome, setNome] = useState('');
  const [grupoSel, setGrupoSel] = useState<string>('');
  const [novoGrupoNome, setNovoGrupoNome] = useState('');
  const [subgrupoSel, setSubgrupoSel] = useState<string>('');
  const [novoSubgrupoNome, setNovoSubgrupoNome] = useState('');
  const [tipo, setTipo] = useState<TipoCategoria>('AMBOS');
  const [ativa, setAtiva] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- semeia o formulário quando o modal abre */
  useEffect(() => {
    if (!visible) return;
    setErro(null);
    setNome(categoria?.nome ?? '');
    setGrupoSel(categoria?.grupoId ?? grupoIdInicial ?? '');
    setSubgrupoSel(categoria?.subgrupoId ?? subgrupoIdInicial ?? '');
    setNovoGrupoNome('');
    setNovoSubgrupoNome('');
    setTipo(categoria?.tipo ?? 'AMBOS');
    setAtiva(categoria ? categoria.ativa : true);
  }, [visible, categoria, grupoIdInicial, subgrupoIdInicial]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const gruposOpts = useMemo(
    () => [
      ...(data?.grupos ?? []).map((g) => ({ value: g.id, label: g.nome })),
      { value: NOVO, label: '+ Novo grupo' },
    ],
    [data],
  );

  const subgruposOpts = useMemo(() => {
    const grupo = data?.grupos.find((g) => g.id === grupoSel);
    return [
      ...(grupo?.subgrupos ?? []).map((s) => ({ value: s.id, label: s.nome })),
      { value: NOVO, label: '+ Novo subgrupo' },
    ];
  }, [data, grupoSel]);

  const salvarMutation = useMutation({
    mutationFn: async () => {
      let grupoId: string | null = grupoSel === '' ? null : grupoSel;
      let subgrupoId: string | null = null;

      if (grupoSel === NOVO) {
        grupoId = (await criarGrupo(novoGrupoNome.trim())).id;
      } else if (grupoId && subgrupoSel === NOVO) {
        subgrupoId = (await criarSubgrupo({ nome: novoSubgrupoNome.trim(), grupoId })).id;
      } else if (grupoId && subgrupoSel !== '') {
        subgrupoId = subgrupoSel;
      }

      const input = { nome: nome.trim(), grupoId, subgrupoId, tipo };
      return editando ? editarCategoria(categoria!.id, { ...input, ativa }) : criarCategoria(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      onClose();
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Não foi possível salvar.'),
  });

  const excluirMutation = useMutation({
    mutationFn: () => excluirCategoria(categoria!.id, { estrategia: 'semCategoria' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      onClose();
    },
    onError: (e) =>
      Alert.alert('Não foi possível excluir', e instanceof ApiError ? e.message : 'Tente novamente.'),
  });

  async function confirmarExclusao() {
    if (!categoria) return;
    let vinc = 0;
    try {
      const imp = await buscarImpactoExclusaoCategoria(categoria.id);
      vinc = imp.transacoesVinculadas + imp.orcamentoItensVinculados;
    } catch {
      // aviso genérico
    }
    Alert.alert(
      `Excluir "${categoria.nome}"`,
      vinc > 0
        ? `${vinc} lançamento(s)/item(ns) de orçamento ficam sem categoria. Você pode arquivar em vez de excluir.`
        : 'Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Arquivar',
          onPress: () =>
            editarCategoria(categoria.id, { ativa: false }).then(() => {
              queryClient.invalidateQueries({ queryKey: ['categorias'] });
              onClose();
            }),
        },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirMutation.mutate() },
      ],
    );
  }

  const bloqueado = salvarMutation.isPending || excluirMutation.isPending;
  const grupoValido = grupoSel !== NOVO || novoGrupoNome.trim().length > 0;
  const subgrupoValido = subgrupoSel !== NOVO || novoSubgrupoNome.trim().length > 0;
  const podeSalvar = nome.trim().length > 0 && grupoValido && subgrupoValido && !bloqueado;

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
              {editando ? 'Editar categoria' : 'Nova categoria'}
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
                placeholder="Ex.: Mercado, Salário, Farmácia"
                placeholderTextColor={theme.textTertiary}
                editable={!bloqueado}
                style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="label" themeColor="textSecondary">
                Grupo
              </ThemedText>
              <Select
                value={grupoSel || null}
                options={gruposOpts}
                clearLabel="Sem grupo"
                placeholder="Sem grupo"
                title="Escolher grupo"
                onChange={(v) => {
                  setGrupoSel(v ?? '');
                  setSubgrupoSel('');
                }}
                disabled={bloqueado}
              />
              {grupoSel === NOVO ? (
                <TextInput
                  value={novoGrupoNome}
                  onChangeText={setNovoGrupoNome}
                  placeholder="Nome do novo grupo"
                  placeholderTextColor={theme.textTertiary}
                  editable={!bloqueado}
                  style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                />
              ) : null}
            </View>

            {grupoSel !== '' && grupoSel !== NOVO ? (
              <View style={styles.field}>
                <ThemedText type="label" themeColor="textSecondary">
                  Subgrupo
                </ThemedText>
                <Select
                  value={subgrupoSel || null}
                  options={subgruposOpts}
                  clearLabel="Sem subgrupo"
                  placeholder="Sem subgrupo"
                  title="Escolher subgrupo"
                  onChange={(v) => setSubgrupoSel(v ?? '')}
                  disabled={bloqueado}
                />
                {subgrupoSel === NOVO ? (
                  <TextInput
                    value={novoSubgrupoNome}
                    onChangeText={setNovoSubgrupoNome}
                    placeholder="Nome do novo subgrupo"
                    placeholderTextColor={theme.textTertiary}
                    editable={!bloqueado}
                    style={[styles.input, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                  />
                ) : null}
              </View>
            ) : null}

            <View style={styles.field}>
              <ThemedText type="label" themeColor="textSecondary">
                Tipo
              </ThemedText>
              <Tabs items={TIPO_TABS} value={tipo} onChange={setTipo} disabled={bloqueado} />
            </View>

            {editando ? (
              <AppSwitch
                value={ativa}
                onValueChange={setAtiva}
                label="Categoria ativa"
                hint="Arquivadas não aparecem nos seletores."
                disabled={bloqueado}
              />
            ) : null}

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
                title="Excluir categoria"
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
