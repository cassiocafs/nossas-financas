import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiFetch } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

interface TransacaoDTO {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  conta: { nome: string };
  categoria: { nome: string } | null;
}

interface DiaTransacoes {
  data: string;
  transacoes: TransacaoDTO[];
}

interface ListaTransacoesResponse {
  dias: DiaTransacoes[];
}

function formatarValor(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function TransacoesScreen() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['transacoes', ano, mes],
    queryFn: () =>
      apiFetch<ListaTransacoesResponse>(`/api/transacoes?ano=${ano}&mes=${mes}`),
  });

  const transacoes = (data?.dias ?? []).flatMap((dia) => dia.transacoes).reverse();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        {isLoading && <ActivityIndicator style={styles.centro} />}
        {isError && (
          <ThemedText type="small" style={styles.erro}>
            Não foi possível carregar as transações.
          </ThemedText>
        )}
        {!isLoading && !isError && transacoes.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centro}>
            Nenhuma transação neste mês.
          </ThemedText>
        )}
        <FlatList
          data={transacoes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.item}>
              <ThemedView style={styles.itemLinha}>
                <ThemedText type="smallBold">{item.descricao}</ThemedText>
                <ThemedText
                  type="smallBold"
                  style={item.valor < 0 ? styles.negativo : styles.positivo}>
                  {formatarValor(item.valor)}
                </ThemedText>
              </ThemedView>
              <ThemedText type="small" themeColor="textSecondary">
                {item.conta.nome}
                {item.categoria ? ` · ${item.categoria.nome}` : ''} · {item.data}
              </ThemedText>
            </ThemedView>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centro: { marginTop: Spacing.five },
  erro: { marginTop: Spacing.five, textAlign: 'center', color: '#d33' },
  lista: { padding: Spacing.three, gap: Spacing.two },
  item: { borderRadius: Spacing.two, padding: Spacing.three, gap: Spacing.half },
  itemLinha: { flexDirection: 'row', justifyContent: 'space-between' },
  negativo: { color: '#d33' },
  positivo: { color: '#2a8f4d' },
});
