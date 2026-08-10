import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listarContas } from '@/api/contas';
import { listarTransacoesMes, type DiaTransacoes, type StatusFiltro, type Transacao } from '@/api/transacoes';
import { AcoesLoteBar } from '@/components/transacoes/AcoesLoteBar';
import { FiltrosModal } from '@/components/transacoes/FiltrosModal';
import { MesNavigator } from '@/components/transacoes/MesNavigator';
import { TransacaoFormModal } from '@/components/transacoes/TransacaoFormModal';
import { TransacaoItem } from '@/components/transacoes/TransacaoItem';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { formatarDataCurta, formatarValor } from '@/lib/format';
import { useTheme } from '@/hooks/use-theme';

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

export default function TransacoesScreen() {
  const theme = useTheme();
  const padrao = hoje();

  const [ano, setAno] = useState(padrao.ano);
  const [mes, setMes] = useState(padrao.mes);
  const [status, setStatus] = useState<StatusFiltro>('todas');
  const [contaIds, setContaIds] = useState<string[]>([]);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [criando, setCriando] = useState(false);
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<Transacao | null>(null);

  const { data: contas = [] } = useQuery({
    queryKey: ['contas'],
    queryFn: () => listarContas(true),
  });

  useEffect(() => {
    if (contas.length > 0 && contaIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- seleciona todas as contas apenas na primeira carga
      setContaIds(contas.map((c) => c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contas]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['transacoes', { ano, mes, contaIds, categoriaIds, status }],
    queryFn: () =>
      listarTransacoesMes({
        ano,
        mes,
        contaIds: contaIds.length > 0 ? contaIds : undefined,
        categoriaIds: categoriaIds.length > 0 ? categoriaIds : undefined,
        status,
      }),
    enabled: contaIds.length > 0,
  });

  function mudarMes(novoAno: number, novoMes: number) {
    setAno(novoAno);
    setMes(novoMes);
    setSelectedIds([]);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function aoPressionar(transacao: Transacao) {
    if (selectedIds.length > 0) {
      toggleSelect(transacao.id);
    } else {
      setTransacaoEmEdicao(transacao);
    }
  }

  function aoSegurar(transacao: Transacao) {
    if (!selectedIds.includes(transacao.id)) {
      setSelectedIds((prev) => [...prev, transacao.id]);
    }
  }

  const dias = data?.dias ?? [];

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedView style={styles.topo}>
          <ThemedView style={styles.topoLinha}>
            <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
            <ThemedView style={styles.topoAcoes}>
              <Pressable
                onPress={() => setFiltrosVisiveis(true)}
                style={[styles.botaoTopo, { borderColor: theme.border }]}>
                <Feather name="sliders" size={14} color={theme.text} />
                <ThemedText type="small">Filtros</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setCriando(true)}
                accessibilityLabel="Nova transação"
                style={[styles.botaoTopo, styles.botaoAdicionar, { backgroundColor: theme.primary }]}>
                <Feather name="plus" size={16} color={theme.primaryForeground} />
              </Pressable>
            </ThemedView>
          </ThemedView>

          {data && (
            <Card variant="flat" style={styles.resumo}>
              <ThemedView style={styles.resumoItem}>
                <ThemedText type="small" themeColor="textSecondary">
                  Anterior
                </ThemedText>
                <ThemedText type="smallBold" numeric>
                  {formatarValor(data.saldoAnterior)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.resumoItem}>
                <ThemedText type="small" themeColor="textSecondary">
                  Entradas
                </ThemedText>
                <ThemedText type="smallBold" numeric themeColor="income">
                  {formatarValor(data.totalEntradas)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.resumoItem}>
                <ThemedText type="small" themeColor="textSecondary">
                  Saídas
                </ThemedText>
                <ThemedText type="smallBold" numeric themeColor="expense">
                  {formatarValor(-Math.abs(data.totalSaidas))}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.resumoItem}>
                <ThemedText type="small" themeColor="textSecondary">
                  Final
                </ThemedText>
                <ThemedText type="smallBold" numeric>
                  {formatarValor(data.saldoFinal)}
                </ThemedText>
              </ThemedView>
            </Card>
          )}
        </ThemedView>

        {isLoading && <ActivityIndicator style={styles.centro} color={theme.primary} />}

        {!isLoading && dias.length === 0 && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.centro}>
            Nenhuma transação neste período.
          </ThemedText>
        )}

        <FlatList
          data={dias}
          keyExtractor={(dia) => dia.data}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={theme.primary} />
          }
          renderItem={({ item: dia }: { item: DiaTransacoes }) => (
            <ThemedView style={styles.diaBloco}>
              <ThemedView style={styles.diaHeader}>
                <ThemedText type="smallBold">{formatarDataCurta(dia.data)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numeric>
                  Saldo do dia: {formatarValor(dia.saldoDia)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.diaItens}>
                {dia.transacoes.map((transacao) => (
                  <TransacaoItem
                    key={transacao.id}
                    transacao={transacao}
                    selecionado={selectedIds.includes(transacao.id)}
                    modoSelecao={selectedIds.length > 0}
                    onPress={() => aoPressionar(transacao)}
                    onLongPress={() => aoSegurar(transacao)}
                  />
                ))}
              </ThemedView>
            </ThemedView>
          )}
        />

        <AcoesLoteBar selectedIds={selectedIds} onDone={() => setSelectedIds([])} />
      </SafeAreaView>

      <FiltrosModal
        visible={filtrosVisiveis}
        onClose={() => setFiltrosVisiveis(false)}
        status={status}
        onStatusChange={setStatus}
        contaIds={contaIds}
        onContaIdsChange={setContaIds}
        categoriaIds={categoriaIds}
        onCategoriaIdsChange={setCategoriaIds}
      />

      <TransacaoFormModal
        visible={criando || !!transacaoEmEdicao}
        transacao={transacaoEmEdicao}
        onClose={() => {
          setCriando(false);
          setTransacaoEmEdicao(null);
        }}
        onSaved={() => {
          setCriando(false);
          setTransacaoEmEdicao(null);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  topo: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: Spacing.two },
  topoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topoAcoes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  botaoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  botaoAdicionar: {
    borderWidth: 0,
    paddingHorizontal: Spacing.three,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  resumoItem: { gap: 2 },
  centro: { marginTop: Spacing.five },
  lista: { padding: Spacing.three, gap: Spacing.three, flexGrow: 1 },
  diaBloco: { gap: Spacing.two },
  diaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  diaItens: { gap: Spacing.two },
});
