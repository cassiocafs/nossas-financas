import { Feather } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import type { ItemCategoriaResumo } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { ChartColors, Radius, Spacing } from '@/constants/theme';
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

  const ordenado = [...dados]
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, MAX_ITENS);
  const maior = ordenado[0]?.total ?? 0;

  return (
    <Card style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedView
          style={[styles.headerIcone, { backgroundColor: theme[tipo === 'income' ? 'incomeSoft' : 'expenseSoft'] }]}>
          <Feather name={tipo === 'income' ? 'arrow-down-left' : 'arrow-up-right'} size={13} color={theme[tipo]} />
        </ThemedView>
        <ThemedText type="smallBold">{titulo}</ThemedText>
      </ThemedView>

      {ordenado.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nada neste mês.
        </ThemedText>
      ) : (
        <ThemedView style={styles.lista}>
          {ordenado.map((item, indice) => (
            <ThemedView key={item.categoriaId ?? 'sem-categoria'} style={styles.linha}>
              <ThemedView style={styles.linhaTopo}>
                <ThemedText type="small" style={styles.nome} numberOfLines={1}>
                  {item.categoriaNome}
                </ThemedText>
                <ThemedText type="small" numeric themeColor="textSecondary">
                  {formatarValor(item.total)}
                </ThemedText>
              </ThemedView>
              <ThemedView type="surface" style={styles.barraFundo}>
                <ThemedView
                  style={[
                    styles.barraPreenchida,
                    {
                      backgroundColor: ChartColors[indice % ChartColors.length],
                      width: `${maior > 0 ? (item.total / maior) * 100 : 0}%`,
                    },
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
  card: { gap: Spacing.three, flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  headerIcone: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lista: { gap: Spacing.three },
  linha: { gap: 6 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  nome: { flex: 1 },
  barraFundo: { height: 8, borderRadius: Radius.pill, overflow: 'hidden' },
  barraPreenchida: { height: '100%', borderRadius: Radius.pill },
});
