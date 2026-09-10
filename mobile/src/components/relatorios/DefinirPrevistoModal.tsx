import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { definirPrevisto } from '@/api/orcamento';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CategoriaSelect } from '@/components/transacoes/CategoriaSelect';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Tabs } from '@/components/ui/Tabs';
import { Spacing } from '@/constants/theme';

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

type ModoPrevisto = 'mesmoValorTodosMeses' | 'porMes';

interface DefinirPrevistoModalProps {
  visible: boolean;
  orcamentoId: string;
  categoriaIdInicial?: string | null;
  onClose: () => void;
}

export function DefinirPrevistoModal({
  visible,
  orcamentoId,
  categoriaIdInicial,
  onClose,
}: DefinirPrevistoModalProps) {
  const queryClient = useQueryClient();
  const [categoriaId, setCategoriaId] = useState<string | null>(categoriaIdInicial ?? null);
  const [modo, setModo] = useState<ModoPrevisto>('mesmoValorTodosMeses');
  const [unicoCentavos, setUnicoCentavos] = useState<number | null>(null);
  const [porMesCentavos, setPorMesCentavos] = useState<(number | null)[]>(new Array(12).fill(null));
  const [erro, setErro] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- semeia o formulário quando o modal abre */
  useEffect(() => {
    if (!visible) return;
    setCategoriaId(categoriaIdInicial ?? null);
    setModo('mesmoValorTodosMeses');
    setUnicoCentavos(null);
    setPorMesCentavos(new Array(12).fill(null));
    setErro(null);
  }, [visible, categoriaIdInicial]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const mutation = useMutation({
    mutationFn: () => {
      if (!categoriaId) throw new Error('Escolha uma categoria.');
      return definirPrevisto(
        orcamentoId,
        modo === 'mesmoValorTodosMeses'
          ? { categoriaId, modo, valor: (unicoCentavos ?? 0) / 100 }
          : { categoriaId, modo, valoresPorMes: porMesCentavos.map((c) => (c ?? 0) / 100) },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamento'] });
      onClose();
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : (e as Error).message),
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => !mutation.isPending && onClose()}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <IconButton icon="x" label="Fechar" onPress={onClose} disabled={mutation.isPending} />
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Definir previsto
            </ThemedText>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {!categoriaIdInicial ? (
              <View style={styles.field}>
                <ThemedText type="label" themeColor="textSecondary">
                  Categoria
                </ThemedText>
                <CategoriaSelect
                  value={categoriaId}
                  onChange={setCategoriaId}
                  placeholder="Escolher categoria"
                  clearLabel="Nenhuma"
                />
              </View>
            ) : null}

            <Tabs
              items={[
                { value: 'mesmoValorTodosMeses', label: 'Todo mês igual' },
                { value: 'porMes', label: 'Por mês' },
              ]}
              value={modo}
              onChange={(v) => setModo(v as ModoPrevisto)}
              disabled={mutation.isPending}
            />

            {modo === 'mesmoValorTodosMeses' ? (
              <MoneyInput
                label="Valor previsto por mês"
                valorCentavos={unicoCentavos}
                onChange={setUnicoCentavos}
                sign="none"
                disabled={mutation.isPending}
              />
            ) : (
              porMesCentavos.map((c, i) => (
                <MoneyInput
                  key={MESES_ABREV[i]}
                  label={MESES_ABREV[i]}
                  valorCentavos={c}
                  onChange={(v) => setPorMesCentavos((prev) => prev.map((p, idx) => (idx === i ? v : p)))}
                  sign="none"
                  disabled={mutation.isPending}
                />
              ))
            )}

            {erro ? (
              <ThemedText type="small" themeColor="destructive">
                {erro}
              </ThemedText>
            ) : null}

            <Button
              title={mutation.isPending ? 'Salvando...' : 'Salvar'}
              onPress={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!categoriaId || mutation.isPending}
              fullWidth
            />
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
});
