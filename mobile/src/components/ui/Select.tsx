import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string | null;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  onChange: (value: string | null) => void;
  clearLabel?: string;
}

export function Select({ value, options, placeholder = 'Selecionar', title = 'Selecionar', onChange, clearLabel = 'Sem categoria' }: SelectProps) {
  const theme = useTheme();
  const [aberto, setAberto] = useState(false);
  const selecionada = options.find((opcao) => opcao.value === value);

  const lista = [{ value: '', label: clearLabel }, ...options];

  return (
    <>
      <Pressable
        onPress={() => setAberto(true)}
        style={[styles.input, { borderColor: theme.border }]}
        accessibilityRole="button">
        <ThemedText
          type="default"
          themeColor={selecionada ? 'text' : 'textTertiary'}
          numberOfLines={1}
          style={styles.inputText}>
          {selecionada?.label ?? placeholder}
        </ThemedText>
        <Feather name="chevron-down" size={18} color={theme.textSecondary} />
      </Pressable>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <ThemedView style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAberto(false)} />
          <ThemedView type="card" style={styles.sheet}>
            <SafeAreaView edges={['bottom']}>
              <ThemedView type="card" style={styles.sheetHeader}>
                <ThemedText type="subtitle">{title}</ThemedText>
                <Pressable onPress={() => setAberto(false)}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Fechar
                  </ThemedText>
                </Pressable>
              </ThemedView>
              <FlatList
                data={lista}
                keyExtractor={(item) => item.value}
                style={styles.list}
                renderItem={({ item }) => {
                  const selecionado = item.value === (value ?? '');
                  return (
                    <Pressable
                      style={[styles.option, selecionado && { backgroundColor: theme.surface }]}
                      onPress={() => {
                        onChange(item.value || null);
                        setAberto(false);
                      }}>
                      <ThemedText type="default">{item.label}</ThemedText>
                      {selecionado && <Feather name="check" size={18} color={theme.primary} />}
                    </Pressable>
                  );
                }}
              />
            </SafeAreaView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: Radius.card,
    borderTopRightRadius: Radius.card,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
  },
});
