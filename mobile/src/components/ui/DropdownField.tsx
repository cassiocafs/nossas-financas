import { Feather } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface DropdownFieldProps {
  label: string;
  title: string;
  children: ReactNode;
}

export function DropdownField({ label, title, children }: DropdownFieldProps) {
  const theme = useTheme();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setAberto(true)}
        style={[styles.input, { borderColor: theme.border }]}
        accessibilityRole="button">
        <ThemedText type="default" numberOfLines={1} style={styles.inputText}>
          {label}
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
              <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {children}
              </ScrollView>
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
  list: { paddingHorizontal: Spacing.four },
  listContent: { paddingBottom: Spacing.four, gap: Spacing.two },
});
