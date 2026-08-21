import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { listarTransacoesMes } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransacaoItem } from '@/components/transacoes/TransacaoItem';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';

const LIMITE = 5;

export function TransacoesRecentesCard({ ano, mes }: { ano: number; mes: number }) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['transacoes', { ano, mes, status: 'todas' as const }, 'recentes'],
    queryFn: () => listarTransacoesMes({ ano, mes, status: 'todas' }),
  });

  const recentes = (data?.dias ?? [])
    .flatMap((dia) => dia.transacoes)
    .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
    .slice(0, LIMITE);

  return (
    <Card style={styles.card}>
      <ThemedView style={styles.linhaTitulo}>
        <ThemedText type="smallBold">Transações recentes</ThemedText>
        <Pressable onPress={() => router.push({ pathname: '/transacoes', params: { ano: String(ano), mes: String(mes) } })}>
          <ThemedText type="small" themeColor="primary">
            Ver todas
          </ThemedText>
        </Pressable>
      </ThemedView>

      {isLoading ? (
        <ThemedText type="small" themeColor="textSecondary">
          Carregando...
        </ThemedText>
      ) : recentes.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Nenhuma transação neste período.
        </ThemedText>
      ) : (
        <ThemedView style={styles.lista}>
          {recentes.map((transacao) => (
            <TransacaoItem
              key={transacao.id}
              transacao={transacao}
              selecionado={false}
              modoSelecao={false}
              onPress={() =>
                router.push({ pathname: '/transacoes', params: { ano: String(ano), mes: String(mes) } })
              }
              onLongPress={() => {}}
            />
          ))}
        </ThemedView>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three, padding: Spacing.two },
  linhaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.one,
  },
  lista: { gap: Spacing.two },
});
