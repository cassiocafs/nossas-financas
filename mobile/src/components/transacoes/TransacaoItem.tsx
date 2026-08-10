import { Pressable, StyleSheet } from 'react-native';

import type { Transacao } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Amount } from '@/components/ui/Amount';
import { TypeIcon } from '@/components/ui/TypeIcon';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TransacaoItemProps {
  transacao: Transacao;
  selecionado: boolean;
  modoSelecao: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function TransacaoItem({
  transacao,
  selecionado,
  modoSelecao,
  onPress,
  onLongPress,
}: TransacaoItemProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <ThemedView
        type="card"
        style={[
          styles.item,
          { borderColor: selecionado ? theme.primary : theme.border, borderWidth: selecionado ? 1.5 : StyleSheet.hairlineWidth },
        ]}>
        {modoSelecao ? (
          <ThemedView
            style={[
              styles.marcador,
              {
                borderColor: selecionado ? theme.primary : theme.border,
                backgroundColor: selecionado ? theme.primary : 'transparent',
              },
            ]}>
            {selecionado && (
              <ThemedText type="small" themeColor="primaryForeground" style={styles.marcadorCheck}>
                ✓
              </ThemedText>
            )}
          </ThemedView>
        ) : (
          <TypeIcon tipo={transacao.tipo} />
        )}
        <ThemedView style={styles.conteudo}>
          <ThemedView style={styles.linha}>
            <ThemedView style={styles.descricaoRow}>
              <ThemedText type={transacao.consolidado ? 'small' : 'smallBold'} style={styles.descricao} numberOfLines={1}>
                {transacao.descricao}
              </ThemedText>
              {transacao.tipo === 'TRANSFERENCIA' && (
                <ThemedView type="transferSoft" style={styles.tag}>
                  <ThemedText type="small" themeColor="transfer" style={styles.tagTexto}>
                    Transf.
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
            <Amount tipo={transacao.tipo} valor={transacao.valor} />
          </ThemedView>
          <ThemedText type="small" themeColor="textSecondary">
            {transacao.conta.nome}
            {transacao.categoria ? ` · ${transacao.categoria.nome}` : ' · Sem categoria'}
            {!transacao.consolidado ? ' · Pendente' : ''}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  marcador: {
    width: 18,
    height: 18,
    borderRadius: Radius.sm - 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcadorCheck: { fontSize: 11, lineHeight: 14 },
  conteudo: { flex: 1, gap: Spacing.half },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  descricaoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexShrink: 1 },
  descricao: { flexShrink: 1 },
  tag: { paddingHorizontal: Spacing.two, paddingVertical: 1, borderRadius: Radius.pill },
  tagTexto: { fontSize: 11, lineHeight: 14 },
});
