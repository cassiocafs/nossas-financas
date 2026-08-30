import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Transacao } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { Radius, Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';
import { formatarDataCurta } from '@/lib/format';

interface TransacaoItemProps {
  transacao: Transacao;
  selecionado: boolean;
  modoSelecao: boolean;
  onPress: () => void;
  onLongPress: () => void;
  /** Preenchido quando a transação tem uma alteração offline ainda não sincronizada. */
  pendenteSync?: 'criar' | 'editar' | 'excluir';
  /** Esconde a data (quando já agrupado por dia). */
  ocultarData?: boolean;
}

/** Linha de transação. Sem borda própria — vive dentro de um Card compacto. */
export function TransacaoItem({
  transacao,
  selecionado,
  modoSelecao,
  onPress,
  onLongPress,
  pendenteSync,
  ocultarData,
}: TransacaoItemProps) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();

  const ehTransferencia = transacao.tipo === 'TRANSFERENCIA';
  const corValor =
    transacao.tipo === 'RECEITA' ? theme.income : ehTransferencia ? theme.transfer : theme.expense;

  const legenda = ehTransferencia
    ? 'Transferência'
    : transacao.categoria
      ? transacao.categoria.nome
      : 'Sem categoria';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={(state) => [
        styles.item,
        selecionado && { backgroundColor: theme.primarySoft, borderRadius: Radius.md },
        state.pressed && !selecionado && { opacity: 0.6 },
        pendenteSync === 'excluir' && styles.pendenteExclusao,
      ]}>
      {modoSelecao ? (
        <View
          style={[
            styles.marcador,
            {
              borderColor: selecionado ? theme.primary : theme.border,
              backgroundColor: selecionado ? theme.primary : 'transparent',
            },
          ]}>
          {selecionado ? <Feather name="check" size={14} color={theme.primaryForeground} /> : null}
        </View>
      ) : ehTransferencia ? (
        <View style={[styles.icone, { backgroundColor: theme.transferSoft }]}>
          <Feather
            name={transacao.valor < 0 ? 'arrow-up-right' : 'arrow-down-left'}
            size={18}
            color={theme.transfer}
          />
        </View>
      ) : (
        <CategoryIcon categoriaId={transacao.categoriaId} size={40} />
      )}

      <View style={styles.conteudo}>
        <View style={styles.linha1}>
          <ThemedText type="label" style={styles.titulo} numberOfLines={1}>
            {transacao.descricao}
          </ThemedText>
          <ThemedText type="money" style={[styles.valor, { color: corValor }]} numberOfLines={1}>
            {formatarValor(transacao.valor)}
          </ThemedText>
        </View>
        <View style={styles.linha2}>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.legenda}>
            {legenda}
            {transacao.conta?.nome ? ` · ${transacao.conta.nome}` : ''}
            {!transacao.consolidado ? ' · pendente' : ''}
          </ThemedText>
          {pendenteSync ? (
            <Feather
              name={pendenteSync === 'excluir' ? 'trash-2' : 'refresh-cw'}
              size={12}
              color={theme.textTertiary}
            />
          ) : !ocultarData ? (
            <ThemedText type="caption" themeColor="textTertiary" style={styles.data}>
              {formatarDataCurta(transacao.data)}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  pendenteExclusao: { opacity: 0.5 },
  marcador: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: { flex: 1, gap: 2 },
  linha1: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  titulo: { flexShrink: 1 },
  valor: { flexShrink: 0 },
  linha2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  legenda: { flexShrink: 1 },
  data: { flexShrink: 0, letterSpacing: 0.4 },
});
