import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Overlay, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface NomeModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  valorInicial?: string;
  salvando?: boolean;
  onClose: () => void;
  onSubmit: (nome: string) => void;
}

/** Modal mínimo de um campo de texto — criar/renomear grupo ou subgrupo. */
export function NomeModal({
  visible,
  title,
  placeholder = 'Nome',
  valorInicial = '',
  salvando,
  onClose,
  onSubmit,
}: NomeModalProps) {
  const theme = useTheme();
  const [nome, setNome] = useState(valorInicial);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- semeia o campo quando o modal abre
    if (visible) setNome(valorInicial);
  }, [visible, valorInicial]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <ThemedView type="card" style={styles.sheet}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.inner}>
              <ThemedText type="subtitle">{title}</ThemedText>
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder={placeholder}
                placeholderTextColor={theme.textTertiary}
                autoFocus
                editable={!salvando}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                ]}
              />
              <View style={styles.acoes}>
                <Button title="Cancelar" variant="ghost" onPress={onClose} disabled={salvando} />
                <Button
                  title={salvando ? 'Salvando...' : 'Salvar'}
                  onPress={() => onSubmit(nome.trim())}
                  loading={salvando}
                  disabled={!nome.trim() || salvando}
                />
              </View>
            </View>
          </SafeAreaView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Overlay },
  sheet: { borderTopLeftRadius: Radius.sheet, borderTopRightRadius: Radius.sheet },
  inner: { padding: Spacing.four, gap: Spacing.three },
  input: {
    borderWidth: 1,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.three,
    height: 48,
    fontSize: 16,
  },
  acoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two },
});
