import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buscarMeta, removerAporte } from '@/api/metas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';
import { formatarDataCurta } from '@/lib/format';
import { formatarMesAno, noteDaMeta, toneDaMeta } from '@/lib/metas';

interface MetaDetailModalProps {
  metaId: string | null;
  onClose: () => void;
  onAportar: () => void;
  onEditar: () => void;
}

export function MetaDetailModal({ metaId, onClose, onAportar, onEditar }: MetaDetailModalProps) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();
  const queryClient = useQueryClient();

  const { data: meta, isLoading } = useQuery({
    queryKey: ['metas', metaId],
    queryFn: () => buscarMeta(metaId!),
    enabled: !!metaId,
  });

  const remover = useMutation({
    mutationFn: (aporteId: string) => removerAporte(metaId!, aporteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] });
    },
  });

  const cor = meta ? (toneDaMeta(meta.estado) === 'success' ? theme.income : theme.warning) : theme.warning;

  return (
    <Modal visible={!!metaId} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <IconButton icon="x" label="Fechar" onPress={onClose} />
            <ThemedText type="subtitle" style={styles.headerTitle} numberOfLines={1}>
              {meta ? `${meta.emoji ? `${meta.emoji} ` : ''}${meta.nome}` : 'Meta'}
            </ThemedText>
          </ThemedView>

          {isLoading || !meta ? (
            <ThemedText type="small" themeColor="textSecondary" style={styles.carregando}>
              Carregando...
            </ThemedText>
          ) : (
            <ScrollView contentContainerStyle={styles.scroll}>
              <View style={styles.progressoTopo}>
                <ThemedText type="smallBold" numeric>
                  {formatarValor(meta.valorAtual)} de {formatarValor(meta.valorAlvo)}
                </ThemedText>
                <ThemedText type="label" themeColor="textSecondary">
                  {meta.progresso.toFixed(0)}%
                </ThemedText>
              </View>
              <ProgressBar value={meta.progresso / 100} color={cor} />
              <ThemedText type="small" themeColor="textSecondary">
                {noteDaMeta(meta, formatarValor)}
              </ThemedText>
              {meta.dataAlvo ? (
                <ThemedText type="caption" themeColor="textSecondary">
                  Prazo: {formatarMesAno(meta.dataAlvo)}
                </ThemedText>
              ) : null}

              <View style={styles.acoes}>
                <Button title="Registrar aporte" size="sm" onPress={onAportar} />
                <Button title="Editar" size="sm" variant="secondary" onPress={onEditar} />
              </View>

              <View style={styles.historico}>
                <ThemedText type="smallBold">Histórico de aportes</ThemedText>
                {meta.aportes.length === 0 ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Nenhum aporte registrado ainda.
                  </ThemedText>
                ) : (
                  <View style={[styles.lista, { borderColor: theme.border }]}>
                    {meta.aportes.map((aporte, i) => (
                      <View
                        key={aporte.id}
                        style={[
                          styles.item,
                          i < meta.aportes.length - 1 && { borderBottomColor: theme.divider, borderBottomWidth: StyleSheet.hairlineWidth },
                        ]}>
                        <View style={styles.itemInfo}>
                          <ThemedText type="small" numeric>
                            <ThemedText type="smallBold">{formatarValor(aporte.valor)}</ThemedText>
                            {' · '}
                            {formatarDataCurta(aporte.data)}
                          </ThemedText>
                          {aporte.nota ? (
                            <ThemedText type="caption" themeColor="textSecondary" numberOfLines={1}>
                              {aporte.nota}
                            </ThemedText>
                          ) : null}
                        </View>
                        <Pressable
                          onPress={() => remover.mutate(aporte.id)}
                          disabled={remover.isPending}
                          hitSlop={8}
                          accessibilityLabel="Remover aporte">
                          <Feather name="trash-2" size={16} color={theme.destructive} />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
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
  carregando: { padding: Spacing.page },
  scroll: { padding: Spacing.page, gap: Spacing.two, paddingBottom: Spacing.six },
  progressoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  acoes: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  historico: { gap: Spacing.two, marginTop: Spacing.four },
  lista: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  itemInfo: { flex: 1, gap: 2 },
});
