import { useQuery } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';

import { listarContas } from '@/api/contas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { formatarValor } from '@/lib/format';

export function SaldoPorContasCard() {
  const { data: contas, isLoading } = useQuery({
    queryKey: ['contas', 'ativas'],
    queryFn: () => listarContas(false),
  });

  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">Saldo por conta</ThemedText>

      {isLoading || !contas ? (
        <ThemedText type="small" themeColor="textSecondary">
          Carregando...
        </ThemedText>
      ) : contas.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nenhuma conta cadastrada.
        </ThemedText>
      ) : (
        <ThemedView style={styles.lista}>
          {contas.map((conta) => (
            <ThemedView key={conta.id} style={styles.linha}>
              <ThemedText type="small" style={styles.nomeConta}>
                {conta.nome}
              </ThemedText>
              <ThemedText type="smallBold" numeric themeColor={conta.saldoAtual < 0 ? 'expense' : 'text'}>
                {formatarValor(conta.saldoAtual)}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  lista: { gap: Spacing.one },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  nomeConta: { flex: 1 },
});
