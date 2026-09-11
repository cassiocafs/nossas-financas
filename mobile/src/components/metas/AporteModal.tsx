import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { registrarAporte, type Meta } from '@/api/metas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { DateField } from '@/components/ui/DateField';
import { IconButton } from '@/components/ui/IconButton';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface AporteModalProps {
  visible: boolean;
  meta: Meta | null;
  onClose: () => void;
}

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AporteModal({ visible, meta, onClose }: AporteModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [valorCentavos, setValorCentavos] = useState<number | null>(null);
  const [data, setData] = useState(hojeISO());
  const [nota, setNota] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- semeia o formulário quando o modal abre */
  useEffect(() => {
    if (!visible) return;
    setErro(null);
    setValorCentavos(null);
    setData(hojeISO());
    setNota('');
  }, [visible]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const mutation = useMutation({
    mutationFn: () =>
      registrarAporte(meta!.id, {
        valor: (valorCentavos ?? 0) / 100,
        data,
        nota: nota.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] });
      onClose();
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Não foi possível registrar o aporte.'),
  });

  if (!meta) return null;

  const bloqueado = mutation.isPending;
  const podeSalvar = (valorCentavos ?? 0) > 0 && !bloqueado;

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
            <ThemedText type="subtitle" style={styles.headerTitle} numberOfLines={1}>
              Registrar aporte — {meta.nome}
            </ThemedText>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <ThemedText type="small" themeColor="textSecondary">
              O aporte registra seu progresso na meta. Não movimenta nenhuma conta.
            </ThemedText>

            <MoneyInput label="Valor" valorCentavos={valorCentavos} onChange={setValorCentavos} sign="none" disabled={bloqueado} />

            <View style={styles.field}>
              <ThemedText type="label" themeColor="textSecondary">
                Data
              </ThemedText>
              <DateField value={data} onChange={setData} disabled={bloqueado} />
            </View>

            <View style={styles.field}>
              <ThemedText type="label" themeColor="textSecondary">
                Nota (opcional)
              </ThemedText>
              <TextInput
                value={nota}
                onChangeText={setNota}
                maxLength={140}
                editable={!bloqueado}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.card, borderColor: theme.border },
                ]}
              />
            </View>

            {erro ? (
              <ThemedText type="small" themeColor="destructive">
                {erro}
              </ThemedText>
            ) : null}

            <Button
              title={mutation.isPending ? 'Registrando...' : 'Registrar aporte'}
              onPress={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!podeSalvar}
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
  input: {
    borderWidth: 1,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.three,
    height: 48,
    fontSize: 16,
  },
});
