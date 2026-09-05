import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { listarContas } from '@/api/contas';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useSyncQueue } from '@/hooks/use-sync-queue';
import { aplicarPendenciasEmContas } from '@/lib/saldosPendentes';

interface SaldoPorContasCardProps {
  ano: number;
  mes: number;
}

export function SaldoPorContasCard({ ano, mes }: SaldoPorContasCardProps) {
  const router = useRouter();
  const formatarValor = useFormatarValor();
  const { fila } = useSyncQueue();

  const { data: contas, isLoading } = useQuery({
    queryKey: ['contas', 'ativas'],
    queryFn: () => listarContas(false),
  });

  const contasComPendencias = useMemo(
    () => aplicarPendenciasEmContas(contas, fila, new Date().toISOString().slice(0, 10)),
    [contas, fila],
  );

  return (
    <Card style={styles.card}>
      <ThemedText type="smallBold">Saldo por conta</ThemedText>

      {isLoading || !contasComPendencias ? (
        <ThemedText type="small" themeColor="textSecondary">
          Carregando...
        </ThemedText>
      ) : contasComPendencias.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nenhuma conta cadastrada.
        </ThemedText>
      ) : (
        <ThemedView style={styles.lista}>
          {contasComPendencias.map((conta) => (
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
                <ThemedText type="smallBold" numeric themeColor={conta.saldoAtual < 0 ? 'moneyAlert' : 'text'}>
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
