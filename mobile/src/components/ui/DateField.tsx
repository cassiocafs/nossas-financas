import { Feather } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Fonts, Overlay, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** 'row' renderiza como linha com rótulo à esquerda e valor à direita, sem borda. */
  variant?: 'input' | 'row';
  label?: string;
}

function paraDate(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano || 1970, (mes || 1) - 1, dia || 1);
}

function paraISO(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function paraBR(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

export function DateField({ value, onChange, disabled, variant = 'input', label }: DateFieldProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const [aberto, setAberto] = useState(false);
  const isRow = variant === 'row';

  function aoConfirmarAndroid(event: DateTimePickerEvent, selecionada?: Date) {
    setAberto(false);
    if (event.type === 'set' && selecionada) {
      onChange(paraISO(selecionada));
    }
  }

  if (Platform.OS === 'web') {
    return (
      <TextInput
        value={paraBR(value)}
        onChangeText={(texto) => {
          const [dia, mes, ano] = texto.split('/');
          if (dia?.length === 2 && mes?.length === 2 && ano?.length === 4) {
            onChange(`${ano}-${mes}-${dia}`);
          }
        }}
        placeholder="DD/MM/AAAA"
        placeholderTextColor={theme.textTertiary}
        editable={!disabled}
        style={[styles.input, { borderColor: theme.border, color: theme.text }, disabled && styles.desabilitado]}
      />
    );
  }

  return (
    <>
      <Pressable
        onPress={() => !disabled && setAberto(true)}
        disabled={disabled}
        style={[
          isRow ? styles.row : styles.input,
          isRow ? { backgroundColor: theme.surface } : { borderColor: theme.border },
          disabled && styles.desabilitado,
        ]}
        accessibilityRole="button">
        {isRow && label && (
          <ThemedText type="label" themeColor="textSecondary">
            {label}
          </ThemedText>
        )}
        <ThemedText type="default" style={isRow ? styles.rowValue : styles.inputText}>
          {paraBR(value)}
        </ThemedText>
        {!isRow && <Feather name="calendar" size={18} color={theme.textSecondary} />}
      </Pressable>

      {Platform.OS === 'android' && aberto && (
        <DateTimePicker value={paraDate(value)} mode="date" display="default" onChange={aoConfirmarAndroid} />
      )}

      {Platform.OS !== 'android' && (
        <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
          <ThemedView style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setAberto(false)} />
            <ThemedView type="card" style={styles.sheet}>
              <SafeAreaView edges={['bottom']}>
                <ThemedView type="card" style={styles.sheetHeader}>
                  <ThemedText type="subtitle">Selecionar data</ThemedText>
                  <Pressable onPress={() => setAberto(false)}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Fechar
                    </ThemedText>
                  </Pressable>
                </ThemedView>
                <DateTimePicker
                  value={paraDate(value)}
                  mode="date"
                  display="inline"
                  themeVariant={scheme === 'dark' ? 'dark' : 'light'}
                  onChange={(_event, selecionada) => {
                    if (selecionada) onChange(paraISO(selecionada));
                  }}
                />
                <Button title="Confirmar" onPress={() => setAberto(false)} style={styles.confirmar} />
              </SafeAreaView>
            </ThemedView>
          </ThemedView>
        </Modal>
      )}
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
  row: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowValue: { fontFamily: Fonts.bodySemi, textAlign: 'right' },
  desabilitado: { opacity: 0.5 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Overlay },
  sheet: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  confirmar: { marginHorizontal: Spacing.four, marginTop: Spacing.two, marginBottom: Spacing.four },
});
