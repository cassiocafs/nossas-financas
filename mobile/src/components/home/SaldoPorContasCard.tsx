import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { listarContas } from '@/api/contas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { formatarValor } from '@/lib/format';

interface SaldoPorContasCardProps {
  ano: number;
  mes: number;
}

export function SaldoPorContasCard({ ano, mes }: SaldoPorContasCardProps) {
  const router = useRouter();

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
            <Pressable
              key={conta.id}
              onPress={() =>
                router.push({
                  pathname: '/transacoes',
                  params: { contaId: conta.id, ano: String(ano), mes: String(mes) },
                })
              }
              style={(state) => [state.pressed && styles.linhaPressionada]}>
              <ThemedView type="surface" style={styles.linha}>
                <ThemedText type="small" style={styles.nomeConta} numberOfLines={1}>
                  {conta.nome}
                </ThemedText>
                <ThemedText type="smallBold" numeric themeColor={conta.saldoAtual < 0 ? 'expense' : 'text'}>
                  {formatarValor(conta.saldoAtual)}
                </ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </ThemedView>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  lista: { gap: Spacing.two },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  nomeConta: { flex: 1 },
  linhaPressionada: { opacity: 0.6 },
});
