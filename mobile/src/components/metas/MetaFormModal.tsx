import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { criarMeta, editarMeta, type Meta } from '@/api/metas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MesNavigator } from '@/components/transacoes/MesNavigator';
import { AppSwitch } from '@/components/ui/AppSwitch';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface MetaFormModalProps {
  visible: boolean;
  meta?: Meta | null;
  onClose: () => void;
}

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

export function MetaFormModal({ visible, meta, onClose }: MetaFormModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const editando = !!meta;
  const padrao = hoje();

  const [emoji, setEmoji] = useState('');
  const [nome, setNome] = useState('');
  const [valorCentavos, setValorCentavos] = useState<number | null>(null);
  const [temPrazo, setTemPrazo] = useState(false);
  const [prazoAno, setPrazoAno] = useState(padrao.ano);
  const [prazoMes, setPrazoMes] = useState(padrao.mes);
  const [erro, setErro] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect -- semeia o formulário quando o modal abre */
  useEffect(() => {
    if (!visible) return;
    setErro(null);
    setEmoji(meta?.emoji ?? '');
    setNome(meta?.nome ?? '');
    setValorCentavos(meta ? Math.round(meta.valorAlvo * 100) : null);
    if (meta?.dataAlvo) {
      const [ano, mes] = meta.dataAlvo.split('-').map(Number);
      setTemPrazo(true);
      setPrazoAno(ano);
      setPrazoMes(mes);
    } else {
      const agora = hoje();
      setTemPrazo(false);
      setPrazoAno(agora.ano);
      setPrazoMes(agora.mes);
    }
  }, [visible, meta]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        nome: nome.trim(),
        emoji: emoji.trim() || undefined,
        valorAlvo: (valorCentavos ?? 0) / 100,
        dataAlvo: temPrazo ? `${prazoAno}-${String(prazoMes).padStart(2, '0')}-01` : undefined,
      };
      return editando
        ? editarMeta(meta!.id, { ...payload, arquivada: meta!.arquivada })
        : criarMeta(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] });
      onClose();
    },
    onError: (e) => setErro(e instanceof ApiError ? e.message : 'Não foi possível salvar a meta.'),
  });

  const bloqueado = mutation.isPending;
  const podeSalvar = nome.trim().length > 0 && (valorCentavos ?? 0) > 0 && !bloqueado;

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
              {editando ? 'Editar meta' : 'Nova meta'}
            </ThemedText>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.linhaTopo}>
              <View style={styles.campoEmoji}>
                <ThemedText type="label" themeColor="textSecondary">
                  Ícone
                </ThemedText>
                <TextInput
                  value={emoji}
                  onChangeText={setEmoji}
                  placeholder="🎯"
                  maxLength={8}
                  editable={!bloqueado}
                  style={[
                    styles.inputEmoji,
                    { color: theme.text, backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                />
              </View>
              <View style={styles.campoNome}>
                <ThemedText type="label" themeColor="textSecondary">
                  Nome
                </ThemedText>
                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Ex.: Viagem, Reserva de emergência"
                  placeholderTextColor={theme.textTertiary}
                  editable={!bloqueado}
                  style={[
                    styles.input,
                    { color: theme.text, backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                />
              </View>
            </View>

            <MoneyInput
              label="Valor-alvo"
              valorCentavos={valorCentavos}
              onChange={setValorCentavos}
              sign="none"
              disabled={bloqueado}
            />

            <AppSwitch
              value={temPrazo}
              onValueChange={setTemPrazo}
              label="Definir prazo"
              hint="Opcional — usado para sugerir um aporte mensal."
              disabled={bloqueado}
            />

            {temPrazo ? (
              <MesNavigator
                ano={prazoAno}
                mes={prazoMes}
                onChange={(ano, mes) => {
                  setPrazoAno(ano);
                  setPrazoMes(mes);
                }}
              />
            ) : null}

            {erro ? (
              <ThemedText type="small" themeColor="destructive">
                {erro}
              </ThemedText>
            ) : null}

            <Button
              title={mutation.isPending ? 'Salvando...' : 'Salvar'}
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
  linhaTopo: { flexDirection: 'row', gap: Spacing.three },
  campoEmoji: { width: 72, gap: Spacing.two },
  campoNome: { flex: 1, gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.three,
    height: 48,
    fontSize: 16,
  },
  inputEmoji: {
    borderWidth: 1,
    borderRadius: Radius.input,
    height: 48,
    fontSize: 20,
    textAlign: 'center',
  },
});
