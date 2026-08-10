import { StyleSheet } from 'react-native';

import type { ItemCategoriaResumo } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatarValor } from '@/lib/format';

interface RelatorioCategoriaCardProps {
  titulo: string;
  dados: ItemCategoriaResumo[];
  tipo: 'income' | 'expense';
}

const MAX_ITENS = 8;

export function RelatorioCategoriaCard({ titulo, dados, tipo }: RelatorioCategoriaCardProps) {
  const theme = useTheme();
  const cor = theme[tipo];
  const corFundo = theme[tipo === 'income' ? 'incomeSoft' : 'expenseSoft'];

  const ordenado = [...dados]
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, MAX_ITENS);
  const maior = ordenado[0]?.total ?? 0;

  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">{titulo}</ThemedText>

      {ordenado.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nada neste mês.
        </ThemedText>
      ) : (
        <ThemedView style={styles.lista}>
          {ordenado.map((item) => (
            <ThemedView key={item.categoriaId ?? 'sem-categoria'} style={styles.linha}>
              <ThemedView style={styles.linhaTopo}>
                <ThemedText type="small" style={styles.nome} numberOfLines={1}>
                  {item.categoriaNome}
                </ThemedText>
                <ThemedText type="small" numeric themeColor="textSecondary">
                  {formatarValor(item.total)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={[styles.barraFundo, { backgroundColor: corFundo }]}>
                <ThemedView
                  style={[
                    styles.barraPreenchida,
                    { backgroundColor: cor, width: `${maior > 0 ? (item.total / maior) * 100 : 0}%` },
                  ]}
                />
              </ThemedView>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two, flex: 1 },
  lista: { gap: Spacing.two },
  linha: { gap: 4 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  nome: { flex: 1 },
  barraFundo: { height: 6, borderRadius: Radius.sm, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: Radius.sm },
});
