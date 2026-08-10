import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet } from 'react-native';

import { listarGrupos } from '@/api/categorias';
import { categorizarLote, consolidarLote, excluirTransacoesLote } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface AcoesLoteBarProps {
  selectedIds: string[];
  onDone: () => void;
}

export function AcoesLoteBar({ selectedIds, onDone }: AcoesLoteBarProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [categoriaEmLote, setCategoriaEmLote] = useState<string | null>(null);

  const { data: gruposData } = useQuery({
    queryKey: ['categorias', 'grupos'],
    queryFn: listarGrupos,
  });

  const categoriasLista = [
    ...(gruposData?.grupos.flatMap((g) => [
      ...g.categorias,
      ...g.subgrupos.flatMap((s) => s.categorias),
    ]) ?? []),
    ...(gruposData?.semGrupo ?? []),
  ];

  function invalidarEFinalizar() {
    queryClient.invalidateQueries({ queryKey: ['transacoes'] });
    setCategoriaEmLote(null);
    onDone();
  }

  const consolidarMutation = useMutation({
    mutationFn: (consolidado: boolean) => consolidarLote(selectedIds, consolidado),
    onSuccess: invalidarEFinalizar,
  });

  const categorizarMutation = useMutation({
    mutationFn: () => categorizarLote(selectedIds, categoriaEmLote),
    onSuccess: invalidarEFinalizar,
  });

  const excluirMutation = useMutation({
    mutationFn: () => excluirTransacoesLote(selectedIds),
    onSuccess: invalidarEFinalizar,
  });

  const ocupado = consolidarMutation.isPending || categorizarMutation.isPending || excluirMutation.isPending;

  function confirmarExclusao() {
    Alert.alert(
      'Excluir transações',
      `Tem certeza que deseja excluir ${selectedIds.length} transação(ões)? Essa ação é permanente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirMutation.mutate() },
      ],
    );
  }

  if (selectedIds.length === 0) return null;

  return (
    <ThemedView type="card" style={[styles.container, { borderTopColor: theme.border }, Shadow.lift]}>
      <ThemedView style={styles.rowSpaced}>
        <ThemedText type="smallBold">{selectedIds.length} selecionada(s)</ThemedText>
        <Pressable onPress={onDone} disabled={ocupado}>
          <ThemedText type="small" themeColor="textSecondary">
            Cancelar
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.row}>
        <Button
          title="Consolidar"
          variant="secondary"
          onPress={() => consolidarMutation.mutate(true)}
          disabled={ocupado}
          style={styles.botaoFlex}
        />
        <Button
          title="Desmarcar"
          variant="secondary"
          onPress={() => consolidarMutation.mutate(false)}
          disabled={ocupado}
          style={styles.botaoFlex}
        />
      </ThemedView>

      <ThemedText type="small" themeColor="textSecondary">
        Categorizar como:
      </ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        <Chip
          label="Sem categoria"
          selected={categoriaEmLote === null}
          onPress={() => setCategoriaEmLote(null)}
        />
        {categoriasLista.map((categoria) => (
          <Chip
            key={categoria.id}
            label={categoria.nome}
            selected={categoriaEmLote === categoria.id}
            onPress={() => setCategoriaEmLote(categoria.id)}
          />
        ))}
      </ScrollView>
      <Button
        title="Categorizar"
        variant="secondary"
        onPress={() => categorizarMutation.mutate()}
        disabled={ocupado}
      />

      <Button
        title={excluirMutation.isPending ? 'Excluindo...' : 'Excluir'}
        variant="destructive"
        onPress={confirmarExclusao}
        disabled={ocupado}
        loading={excluirMutation.isPending}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: { flexDirection: 'row', gap: Spacing.two },
  rowSpaced: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  botaoFlex: { flex: 1 },
  chipsRow: { flexDirection: 'row', gap: Spacing.two, paddingVertical: Spacing.half },
});
