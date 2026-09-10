import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  criarGrupo,
  criarSubgrupo,
  editarGrupo,
  editarSubgrupo,
  excluirGrupo,
  excluirSubgrupo,
  listarGrupos,
  type Categoria,
} from '@/api/categorias';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CategoriaFormModal } from '@/components/categorias/CategoriaFormModal';
import { NomeModal } from '@/components/categorias/NomeModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/api/client';

type NomeAlvo =
  | { tipo: 'grupo-novo' }
  | { tipo: 'grupo-editar'; id: string; valor: string }
  | { tipo: 'subgrupo-novo'; grupoId: string }
  | { tipo: 'subgrupo-editar'; id: string; valor: string };

const TIPO_LABEL: Record<Categoria['tipo'], string> = {
  AMBOS: '',
  DESPESA: 'Despesa',
  RECEITA: 'Receita',
};

export default function CategoriasScreen() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['categorias', 'grupos'], queryFn: listarGrupos });

  const [formVisivel, setFormVisivel] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [presetGrupoId, setPresetGrupoId] = useState<string | null>(null);
  const [presetSubgrupoId, setPresetSubgrupoId] = useState<string | null>(null);
  const [nomeAlvo, setNomeAlvo] = useState<NomeAlvo | null>(null);

  function invalidar() {
    queryClient.invalidateQueries({ queryKey: ['categorias'] });
  }

  const nomeMutation = useMutation({
    mutationFn: async (nome: string) => {
      if (!nomeAlvo) return;
      if (nomeAlvo.tipo === 'grupo-novo') return criarGrupo(nome);
      if (nomeAlvo.tipo === 'grupo-editar') return editarGrupo(nomeAlvo.id, { nome });
      if (nomeAlvo.tipo === 'subgrupo-novo') return criarSubgrupo({ nome, grupoId: nomeAlvo.grupoId });
      return editarSubgrupo(nomeAlvo.id, { nome });
    },
    onSuccess: () => {
      invalidar();
      setNomeAlvo(null);
    },
    onError: (e) =>
      Alert.alert('Não foi possível salvar', e instanceof ApiError ? e.message : 'Tente novamente.'),
  });

  function novaCategoria(grupoId: string | null, subgrupoId: string | null) {
    setCategoriaEditando(null);
    setPresetGrupoId(grupoId);
    setPresetSubgrupoId(subgrupoId);
    setFormVisivel(true);
  }

  function editarCategoriaExistente(cat: Categoria) {
    setCategoriaEditando(cat);
    setPresetGrupoId(null);
    setPresetSubgrupoId(null);
    setFormVisivel(true);
  }

  function confirmarExcluirGrupo(id: string, nome: string) {
    Alert.alert(`Excluir grupo "${nome}"`, 'As categorias dele ficam sem grupo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          excluirGrupo(id)
            .then(invalidar)
            .catch((e) => Alert.alert('Erro', e instanceof ApiError ? e.message : 'Tente novamente.')),
      },
    ]);
  }

  function confirmarExcluirSubgrupo(id: string, nome: string) {
    Alert.alert(`Excluir subgrupo "${nome}"`, 'As categorias dele ficam direto no grupo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () =>
          excluirSubgrupo(id)
            .then(invalidar)
            .catch((e) => Alert.alert('Erro', e instanceof ApiError ? e.message : 'Tente novamente.')),
      },
    ]);
  }

  function LinhaCategoria({ cat, nivel }: { cat: Categoria; nivel: number }) {
    return (
      <Pressable
        onPress={() => editarCategoriaExistente(cat)}
        style={[styles.linha, { paddingLeft: Spacing.four + nivel * Spacing.three }]}>
        <ThemedText
          type="default"
          themeColor={cat.ativa ? 'text' : 'textTertiary'}
          style={styles.flex}
          numberOfLines={1}>
          {cat.nome}
        </ThemedText>
        {TIPO_LABEL[cat.tipo] ? (
          <ThemedText type="caption" themeColor="textTertiary">
            {TIPO_LABEL[cat.tipo]}
          </ThemedText>
        ) : null}
        <Feather name="chevron-right" size={18} color={theme.textTertiary} />
      </Pressable>
    );
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
          <ThemedText type="title">Categorias e subcategorias</ThemedText>

          <View style={styles.acoesTopo}>
            <Button title="Nova categoria" icon="plus" onPress={() => novaCategoria(null, null)} />
            <Button
              title="Novo grupo"
              icon="folder-plus"
              variant="secondary"
              onPress={() => setNomeAlvo({ tipo: 'grupo-novo' })}
            />
          </View>

          {isLoading || !data ? (
            <ThemedText type="small" themeColor="textSecondary">
              Carregando...
            </ThemedText>
          ) : (
            <>
              {data.grupos.map((grupo) => (
                <Card key={grupo.id} padding="none" style={styles.grupoCard}>
                  <View style={[styles.grupoHeader, { borderBottomColor: theme.divider }]}>
                    <ThemedText type="smallBold" style={styles.flex} numberOfLines={1}>
                      {grupo.nome}
                    </ThemedText>
                    <Pressable
                      hitSlop={8}
                      onPress={() => setNomeAlvo({ tipo: 'grupo-editar', id: grupo.id, valor: grupo.nome })}>
                      <Feather name="edit-2" size={15} color={theme.textSecondary} />
                    </Pressable>
                    <Pressable hitSlop={8} onPress={() => confirmarExcluirGrupo(grupo.id, grupo.nome)}>
                      <Feather name="trash-2" size={15} color={theme.textSecondary} />
                    </Pressable>
                  </View>

                  {grupo.subgrupos.map((sub) => (
                    <View key={sub.id}>
                      <View style={[styles.subHeader, { borderBottomColor: theme.divider }]}>
                        <ThemedText type="label" themeColor="textSecondary" style={styles.flex} numberOfLines={1}>
                          {sub.nome}
                        </ThemedText>
                        <Pressable
                          hitSlop={8}
                          onPress={() => setNomeAlvo({ tipo: 'subgrupo-editar', id: sub.id, valor: sub.nome })}>
                          <Feather name="edit-2" size={14} color={theme.textTertiary} />
                        </Pressable>
                        <Pressable hitSlop={8} onPress={() => confirmarExcluirSubgrupo(sub.id, sub.nome)}>
                          <Feather name="trash-2" size={14} color={theme.textTertiary} />
                        </Pressable>
                      </View>
                      {sub.categorias.map((cat) => (
                        <LinhaCategoria key={cat.id} cat={cat} nivel={2} />
                      ))}
                      <Pressable
                        onPress={() => novaCategoria(grupo.id, sub.id)}
                        style={[styles.addLinha, { paddingLeft: Spacing.four + 2 * Spacing.three }]}>
                        <Feather name="plus" size={14} color={theme.primary} />
                        <ThemedText type="small" themeColor="primary">
                          Categoria
                        </ThemedText>
                      </Pressable>
                    </View>
                  ))}

                  {grupo.categorias.map((cat) => (
                    <LinhaCategoria key={cat.id} cat={cat} nivel={1} />
                  ))}

                  <View style={styles.grupoRodape}>
                    <Pressable
                      onPress={() => novaCategoria(grupo.id, null)}
                      style={styles.addLinha}>
                      <Feather name="plus" size={14} color={theme.primary} />
                      <ThemedText type="small" themeColor="primary">
                        Categoria
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => setNomeAlvo({ tipo: 'subgrupo-novo', grupoId: grupo.id })}
                      style={styles.addLinha}>
                      <Feather name="plus" size={14} color={theme.primary} />
                      <ThemedText type="small" themeColor="primary">
                        Subgrupo
                      </ThemedText>
                    </Pressable>
                  </View>
                </Card>
              ))}

              {data.semGrupo.length > 0 ? (
                <Card padding="none" style={styles.grupoCard}>
                  <View style={[styles.grupoHeader, { borderBottomColor: theme.divider }]}>
                    <ThemedText type="smallBold" themeColor="textSecondary">
                      Sem grupo
                    </ThemedText>
                  </View>
                  {data.semGrupo.map((cat) => (
                    <LinhaCategoria key={cat.id} cat={cat} nivel={0} />
                  ))}
                </Card>
              ) : null}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <CategoriaFormModal
        visible={formVisivel}
        categoria={categoriaEditando}
        grupoIdInicial={presetGrupoId}
        subgrupoIdInicial={presetSubgrupoId}
        onClose={() => setFormVisivel(false)}
      />

      <NomeModal
        visible={!!nomeAlvo}
        title={
          nomeAlvo?.tipo === 'grupo-novo'
            ? 'Novo grupo'
            : nomeAlvo?.tipo === 'grupo-editar'
              ? 'Renomear grupo'
              : nomeAlvo?.tipo === 'subgrupo-novo'
                ? 'Novo subgrupo'
                : 'Renomear subgrupo'
        }
        valorInicial={
          nomeAlvo && (nomeAlvo.tipo === 'grupo-editar' || nomeAlvo.tipo === 'subgrupo-editar')
            ? nomeAlvo.valor
            : ''
        }
        salvando={nomeMutation.isPending}
        onClose={() => setNomeAlvo(null)}
        onSubmit={(nome) => nomeMutation.mutate(nome)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.page,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  scroll: { padding: Spacing.page, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  acoesTopo: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  grupoCard: { overflow: 'hidden' },
  grupoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingLeft: Spacing.four + Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingRight: Spacing.four,
    paddingVertical: Spacing.three,
  },
  addLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  grupoRodape: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
});
