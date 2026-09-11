import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { editarMeta, excluirMeta, listarMetas, type Meta } from '@/api/metas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AporteModal } from '@/components/metas/AporteModal';
import { MetaCard } from '@/components/metas/MetaCard';
import { MetaDetailModal } from '@/components/metas/MetaDetailModal';
import { MetaFormModal } from '@/components/metas/MetaFormModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function MetasScreen() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ nova?: string }>();
  const novaParam = Array.isArray(params.nova) ? params.nova[0] : params.nova;
  const novaParamAplicado = useRef<string | undefined>(undefined);

  const [incluirArquivadas, setIncluirArquivadas] = useState(false);
  const [formVisivel, setFormVisivel] = useState(false);
  const [metaEditando, setMetaEditando] = useState<Meta | null>(null);
  const [metaAportando, setMetaAportando] = useState<Meta | null>(null);
  const [metaDetalheId, setMetaDetalheId] = useState<string | null>(null);

  const { data: metas = [], isLoading } = useQuery({
    queryKey: ['metas', incluirArquivadas],
    queryFn: () => listarMetas(incluirArquivadas),
  });

  useEffect(() => {
    if (novaParam && novaParam !== novaParamAplicado.current) {
      novaParamAplicado.current = novaParam;
      setMetaEditando(null);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- abre o formulário vindo da navegação (Home)
      setFormVisivel(true);
    }
  }, [novaParam]);

  const arquivarMutation = useMutation({
    mutationFn: (meta: Meta) => editarMeta(meta.id, { arquivada: !meta.arquivada }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['metas'] }),
    onError: (e) => Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível atualizar a meta.'),
  });

  const excluirMutation = useMutation({
    mutationFn: ({ meta, confirmar }: { meta: Meta; confirmar: boolean }) => excluirMeta(meta.id, confirmar),
    onSuccess: (_data, { meta }) => {
      queryClient.invalidateQueries({ queryKey: ['metas'] });
      if (metaDetalheId === meta.id) setMetaDetalheId(null);
    },
    onError: (e, { meta }) => {
      if (e instanceof ApiError && e.status === 409) {
        Alert.alert(
          `Excluir "${meta.nome}"`,
          'Esta meta tem aportes registrados. Excluir vai apagar a meta e todo o histórico de aportes. Essa ação não pode ser desfeita.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Excluir mesmo assim',
              style: 'destructive',
              onPress: () => excluirMutation.mutate({ meta, confirmar: true }),
            },
          ],
        );
        return;
      }
      Alert.alert('Erro', e instanceof ApiError ? e.message : 'Não foi possível excluir a meta.');
    },
  });

  function abrirCriacao() {
    setMetaEditando(null);
    setFormVisivel(true);
  }

  function abrirEdicao(meta: Meta) {
    setMetaEditando(meta);
    setFormVisivel(true);
  }

  function confirmarExclusao(meta: Meta) {
    Alert.alert(`Excluir "${meta.nome}"`, 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirMutation.mutate({ meta, confirmar: false }) },
    ]);
  }

  const metaDetalhe = metas.find((m) => m.id === metaDetalheId) ?? null;

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ThemedView style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            hitSlop={12}
            style={styles.voltar}>
            <Feather name="chevron-left" size={22} color={theme.text} />
            <ThemedText type="default">Início</ThemedText>
          </Pressable>
        </ThemedView>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.titulo}>
            <ThemedText type="title">Metas</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Objetivos de economia e o progresso de cada um.
            </ThemedText>
          </View>

          <Button title="Nova meta" icon="plus" onPress={abrirCriacao} fullWidth />

          {isLoading ? (
            <ThemedText type="small" themeColor="textSecondary">
              Carregando...
            </ThemedText>
          ) : metas.length === 0 && !incluirArquivadas ? (
            <EmptyState mood="welcome" title="Nenhuma meta ainda">
              Crie sua primeira meta e comece a poupar com objetivo.
            </EmptyState>
          ) : (
            <View style={styles.lista}>
              {metas.map((meta) => (
                <MetaCard
                  key={meta.id}
                  meta={meta}
                  onAbrir={() => setMetaDetalheId(meta.id)}
                  onEditar={() => abrirEdicao(meta)}
                  onAportar={() => setMetaAportando(meta)}
                  onArquivar={() => arquivarMutation.mutate(meta)}
                  onExcluir={() => confirmarExclusao(meta)}
                />
              ))}
              {metas.length === 0 ? (
                <ThemedText type="small" themeColor="textSecondary">
                  Nenhuma meta arquivada.
                </ThemedText>
              ) : null}
            </View>
          )}

          <Pressable onPress={() => setIncluirArquivadas((v) => !v)} hitSlop={8}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {incluirArquivadas ? 'Ocultar' : 'Mostrar'} metas arquivadas
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <MetaFormModal visible={formVisivel} meta={metaEditando} onClose={() => setFormVisivel(false)} />

      <AporteModal visible={!!metaAportando} meta={metaAportando} onClose={() => setMetaAportando(null)} />

      <MetaDetailModal
        metaId={metaDetalheId}
        onClose={() => setMetaDetalheId(null)}
        onAportar={() => {
          if (metaDetalhe) setMetaAportando(metaDetalhe);
        }}
        onEditar={() => {
          if (metaDetalhe) abrirEdicao(metaDetalhe);
        }}
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
  titulo: { gap: 2 },
  lista: { gap: Spacing.three },
});
