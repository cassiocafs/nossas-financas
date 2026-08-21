import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import type { Transacao } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransacaoItem } from '@/components/transacoes/TransacaoItem';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';

const LIMITE = 5;

interface TransacoesRecentesCardProps {
  ano: number;
  mes: number;
  recentes: Transacao[];
}

export function TransacoesRecentesCard({ ano, mes, recentes: todasRecentes }: TransacoesRecentesCardProps) {
  const router = useRouter();
  const recentes = todasRecentes.slice(0, LIMITE);

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

      {recentes.length === 0 ? (
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
