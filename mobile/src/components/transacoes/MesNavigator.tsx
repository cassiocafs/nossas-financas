import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Chip } from '@/components/ui/Chip';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

interface MesNavigatorProps {
  ano: number;
  mes: number;
  onChange: (ano: number, mes: number) => void;
}

export function MesNavigator({ ano, mes, onChange }: MesNavigatorProps) {
  const theme = useTheme();
  const [aberto, setAberto] = useState(false);

  function irPara(delta: number) {
    const data = new Date(Date.UTC(ano, mes - 1 + delta, 1));
    onChange(data.getUTCFullYear(), data.getUTCMonth() + 1);
  }

  function irParaHoje() {
    const agora = new Date();
    onChange(agora.getFullYear(), agora.getMonth() + 1);
  }

  const anos = Array.from({ length: 13 }, (_, i) => ano - 10 + i);

  return (
    <ThemedView style={styles.container}>
      <Pressable
        onPress={() => irPara(-1)}
        accessibilityLabel="Mês anterior"
        style={[styles.navButton, { borderColor: theme.border }]}>
        <ThemedText type="small">‹</ThemedText>
      </Pressable>

      <Pressable onPress={() => setAberto(true)} style={styles.label}>
        <ThemedText type="smallBold">
          {MESES[mes - 1]} {ano}
        </ThemedText>
      </Pressable>

      <Pressable
        onPress={() => irPara(1)}
        accessibilityLabel="Próximo mês"
        style={[styles.navButton, { borderColor: theme.border }]}>
        <ThemedText type="small">›</ThemedText>
      </Pressable>

      <Pressable onPress={irParaHoje} style={[styles.hojeButton, { borderColor: theme.border }]}>
        <ThemedText type="small">Hoje</ThemedText>
      </Pressable>

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAberto(false)}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <ThemedText type="smallBold" style={styles.modalTitle}>
              Selecionar mês
            </ThemedText>
            <ScrollView style={styles.modalSection} contentContainerStyle={styles.chipsWrap}>
              {MESES.map((nome, indice) => {
                const valor = indice + 1;
                return (
                  <Chip
                    key={nome}
                    label={nome}
                    selected={valor === mes}
                    onPress={() => {
                      onChange(ano, valor);
                      setAberto(false);
                    }}
                  />
                );
              })}
            </ScrollView>

            <ThemedText type="smallBold" style={styles.modalTitle}>
              Selecionar ano
            </ThemedText>
            <ScrollView style={styles.modalSection} contentContainerStyle={styles.chipsWrap}>
              {anos.map((a) => (
                <Chip
                  key={a}
                  label={String(a)}
                  selected={a === ano}
                  onPress={() => {
                    onChange(a, mes);
                    setAberto(false);
                  }}
                />
              ))}
            </ScrollView>

            <Pressable onPress={() => setAberto(false)} style={styles.fechar}>
              <ThemedText type="small" themeColor="textSecondary">
                Fechar
              </ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  navButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  label: { minWidth: 110, alignItems: 'center' },
  hojeButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  modalTitle: { marginTop: Spacing.two },
  modalSection: { maxHeight: 140 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, paddingVertical: Spacing.one },
  fechar: { marginTop: Spacing.three, alignItems: 'center' },
});
