import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { excluirRegra, listarRegras, type RegraTransacao } from '@/api/regras';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { RegraFormModal } from './RegraFormModal';

export function RegrasModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: regras = [], isLoading } = useQuery({
    queryKey: ['regras'],
    queryFn: listarRegras,
    enabled: visible,
  });

  const [formAberto, setFormAberto] = useState(false);
  const [regraEditando, setRegraEditando] = useState<RegraTransacao | null>(null);

  const excluirMutation = useMutation({
    mutationFn: (id: string) => excluirRegra(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras'] });
    },
    onError: (err) => {
      Alert.alert('Erro', err instanceof ApiError ? err.message : 'Falha ao excluir regra');
    },
  });

  function abrirCriacao() {
    setRegraEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(regra: RegraTransacao) {
    setRegraEditando(regra);
    setFormAberto(true);
  }

  function confirmarExclusao(regra: RegraTransacao) {
    Alert.alert('Excluir regra', `Tem certeza que deseja excluir a regra "${regra.descricao}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirMutation.mutate(regra.id) },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Regras de inserção</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText type="small" themeColor="textSecondary">
                Fechar
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary" style={styles.descricao}>
            Quando a descrição de uma nova transação bater com uma regra, a conta e a categoria são
            preenchidas automaticamente. Regras também são aprendidas sozinhas conforme você registra
            transações.
          </ThemedText>

          <FlatList
            data={regras}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshing={isLoading}
            onRefresh={() => queryClient.invalidateQueries({ queryKey: ['regras'] })}
            ListEmptyComponent={
              !isLoading ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.vazio}>
                  Nenhuma regra cadastrada ainda.
                </ThemedText>
              ) : null
            }
            renderItem={({ item }) => (
              <ThemedView type="card" style={[styles.item, { borderColor: theme.border }]}>
                <View style={styles.itemInfo}>
                  <ThemedText type="default" numberOfLines={1}>
                    {item.descricao}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                    {item.conta.nome}
                    {item.categoria ? ` · ${item.categoria.nome}` : ''}
                  </ThemedText>
                </View>
                <View style={styles.itemActions}>
                  <Pressable onPress={() => abrirEdicao(item)} hitSlop={8} style={styles.itemActionButton}>
                    <Feather name="edit-2" size={18} color={theme.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => confirmarExclusao(item)} hitSlop={8} style={styles.itemActionButton}>
                    <Feather name="trash-2" size={18} color={theme.destructive} />
                  </Pressable>
                </View>
              </ThemedView>
            )}
          />

          <Pressable
            accessibilityRole="button"
            onPress={abrirCriacao}
            style={[styles.fab, { backgroundColor: theme.primary }]}>
            <Feather name="plus" size={24} color={theme.primaryForeground} />
          </Pressable>
        </SafeAreaView>

        <RegraFormModal visible={formAberto} regra={regraEditando} onClose={() => setFormAberto(false)} />
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
  descricao: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three },
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two },
  vazio: { textAlign: 'center', paddingVertical: Spacing.six },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  itemInfo: { flex: 1, gap: Spacing.half },
  itemActions: { flexDirection: 'row', gap: Spacing.three },
  itemActionButton: { padding: Spacing.one },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
});
