import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listarContas } from '@/api/contas';
import { listarTransacoesMes, type StatusFiltro } from '@/api/transacoes';
import { AcoesLoteBar } from '@/components/transacoes/AcoesLoteBar';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { FiltrosModal, type FiltrosAplicados } from '@/components/transacoes/FiltrosModal';
import { MesNavigator } from '@/components/transacoes/MesNavigator';
import { TransacaoFormModal } from '@/components/transacoes/TransacaoFormModal';
import { TransacaoItem } from '@/components/transacoes/TransacaoItem';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { formatarDataCurta } from '@/lib/format';
import { useTheme } from '@/hooks/use-theme';
import { useTransacoesComPendencias, type TransacaoComPendencia } from '@/hooks/use-transacoes-com-pendencias';

function hoje() {
  const agora = new Date();
  return { ano: agora.getFullYear(), mes: agora.getMonth() + 1 };
}

export default function TransacoesScreen() {
  const theme = useTheme();
  const formatarValor = useFormatarValor();
  const padrao = hoje();
  const params = useLocalSearchParams<{ contaId?: string; ano?: string; mes?: string; novo?: string; tipo?: string }>();
  const contaIdParam = Array.isArray(params.contaId) ? params.contaId[0] : params.contaId;
  const anoParam = Array.isArray(params.ano) ? params.ano[0] : params.ano;
  const mesParam = Array.isArray(params.mes) ? params.mes[0] : params.mes;
  const novoParam = Array.isArray(params.novo) ? params.novo[0] : params.novo;
  const tipoParam = Array.isArray(params.tipo) ? params.tipo[0] : params.tipo;
  const contaIdParamAplicado = useRef<string | undefined>(undefined);
  const periodoParamAplicado = useRef<string | undefined>(undefined);
  const novoParamAplicado = useRef<string | undefined>(undefined);

  const [ano, setAno] = useState(padrao.ano);
  const [mes, setMes] = useState(padrao.mes);
  const [status, setStatus] = useState<StatusFiltro>('todas');
  const [contaIds, setContaIds] = useState<string[]>([]);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState<string | null>(null);
  const [dataFim, setDataFim] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const [criando, setCriando] = useState(false);
  const [tipoNovo, setTipoNovo] = useState<'DESPESA' | 'RECEITA'>('DESPESA');
  const [transacaoEmEdicao, setTransacaoEmEdicao] = useState<TransacaoComPendencia | null>(null);
  const [busca, setBusca] = useState('');

  const { data: contas = [] } = useQuery({
    queryKey: ['contas'],
    queryFn: () => listarContas(true),
  });

  useEffect(() => {
    if (contaIdParam && contaIdParam !== contaIdParamAplicado.current) {
      contaIdParamAplicado.current = contaIdParam;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- aplica filtro vindo da navegação (saldo por conta)
      setContaIds([contaIdParam]);
      setSelectedIds([]);
    }
  }, [contaIdParam]);

  useEffect(() => {
    if (novoParam && novoParam !== novoParamAplicado.current) {
      novoParamAplicado.current = novoParam;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- abre o formulário vindo da navegação (ações rápidas)
      setTipoNovo(tipoParam === 'RECEITA' ? 'RECEITA' : 'DESPESA');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- abre o formulário vindo da navegação (ações rápidas)
      setCriando(true);
    }
  }, [novoParam, tipoParam]);

  useEffect(() => {
    if (!anoParam || !mesParam) return;
    const chave = `${anoParam}-${mesParam}`;
    if (chave !== periodoParamAplicado.current) {
      periodoParamAplicado.current = chave;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- aplica mês vindo da navegação (saldo por conta)
      setAno(Number(anoParam));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- aplica mês vindo da navegação (saldo por conta)
      setMes(Number(mesParam));
    }
  }, [anoParam, mesParam]);

  useEffect(() => {
    if (contas.length > 0 && contaIds.length === 0 && !contaIdParam) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- seleciona todas as contas apenas na primeira carga
      setContaIds(contas.map((c) => c.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contas]);

  const {
    data: dadosServidor,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['transacoes', { ano, mes, contaIds, categoriaIds, status, dataInicio, dataFim }],
    queryFn: () =>
      listarTransacoesMes({
        ano,
        mes,
        contaIds: contaIds.length > 0 ? contaIds : undefined,
        categoriaIds: categoriaIds.length > 0 ? categoriaIds : undefined,
        status,
        dataInicio: dataInicio ?? undefined,
        dataFim: dataFim ?? undefined,
      }),
    enabled: contaIds.length > 0,
  });

  const data = useTransacoesComPendencias(dadosServidor, contas, {
    ano,
    mes,
    contaIds: contaIds.length > 0 ? contaIds : undefined,
    categoriaIds: categoriaIds.length > 0 ? categoriaIds : undefined,
    status,
    dataInicio: dataInicio ?? undefined,
    dataFim: dataFim ?? undefined,
  });

  function mudarMes(novoAno: number, novoMes: number) {
    setAno(novoAno);
    setMes(novoMes);
    setSelectedIds([]);
    setDataInicio(null);
    setDataFim(null);
  }

  function aplicarFiltros(filtros: FiltrosAplicados) {
    setStatus(filtros.status);
    setContaIds(filtros.contaIds);
    setCategoriaIds(filtros.categoriaIds);
    setDataInicio(filtros.dataInicio);
    setDataFim(filtros.dataFim);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function aoPressionar(transacao: TransacaoComPendencia) {
    if (selectedIds.length > 0) {
      toggleSelect(transacao.id);
    } else {
      setTransacaoEmEdicao(transacao);
    }
  }

  function aoSegurar(transacao: TransacaoComPendencia) {
    if (!selectedIds.includes(transacao.id)) {
      setSelectedIds((prev) => [...prev, transacao.id]);
    }
  }

  const dias = data?.dias ?? [];

  type ItemLista =
    | { tipo: 'cabecalho'; key: string; data: string }
    | { tipo: "transacao"; key: string; transacao: TransacaoComPendencia }
    | { tipo: 'rodape'; key: string; saldoDia: number };

  const buscaNormalizada = busca.trim().toLowerCase();

  const itensLista = useMemo<ItemLista[]>(
    () =>
      (data?.dias ?? [])
        .map((dia) => ({
          ...dia,
          transacoes: buscaNormalizada
            ? dia.transacoes.filter((t) => t.descricao.toLowerCase().includes(buscaNormalizada))
            : dia.transacoes,
        }))
        .filter((dia) => dia.transacoes.length > 0)
        .flatMap((dia) => [
          { tipo: 'cabecalho' as const, key: `cabecalho-${dia.data}`, data: dia.data },
          ...dia.transacoes.map((transacao) => ({
            tipo: 'transacao' as const,
            key: transacao.id,
            transacao,
          })),
          { tipo: 'rodape' as const, key: `rodape-${dia.data}`, saldoDia: dia.saldoDia },
        ]),
    [data?.dias, buscaNormalizada],
  );

  const filtrosAtivos =
    status !== 'todas' ||
    categoriaIds.length > 0 ||
    (contas.length > 0 && contaIds.length < contas.length) ||
    Boolean(dataInicio || dataFim);

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <ThemedView style={styles.topo}>
          <ThemedText type="title">Transações</ThemedText>

          <ThemedView style={styles.topoLinha}>
            <MesNavigator ano={ano} mes={mes} onChange={mudarMes} />
            <ThemedView style={styles.topoAcoes}>
              <Pressable
                onPress={() => setFiltrosVisiveis(true)}
                style={[styles.botaoTopo, { borderColor: filtrosAtivos ? theme.primary : theme.border }]}>
                <Feather name="sliders" size={14} color={theme.text} />
                <ThemedText type="small">Filtros</ThemedText>
                {filtrosAtivos && <ThemedView style={[styles.pontoFiltro, { backgroundColor: theme.primary }]} />}
              </Pressable>
            </ThemedView>
          </ThemedView>

          {data && (
            <ThemedText type="small" themeColor="textSecondary">
              Saldo anterior: {formatarValor(data.saldoAnterior)}
            </ThemedText>
          )}

          <ThemedView style={[styles.busca, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <Feather name="search" size={15} color={theme.textTertiary} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por descrição"
              placeholderTextColor={theme.textTertiary}
              style={[styles.buscaInput, { color: theme.text }]}
            />
          </ThemedView>

          <ThemedView style={styles.statusRow}>
            <Chip label="Todas" selected={status === 'todas'} onPress={() => setStatus('todas')} />
            <Chip label="Pagas" selected={status === 'consolidadas'} onPress={() => setStatus('consolidadas')} />
            <Chip label="Pendentes" selected={status === 'pendentes'} onPress={() => setStatus('pendentes')} />
          </ThemedView>
        </ThemedView>

        {isLoading && <ActivityIndicator style={styles.centro} color={theme.primary} />}

        {!isLoading && dias.length === 0 && (
          <EmptyState mood="thinking" title="Nenhuma transação encontrada">
            Ajuste o período ou os filtros para ver outras transações.
          </EmptyState>
        )}

        <FlatList
          data={itensLista}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={theme.primary} />
          }
          renderItem={({ item }: { item: ItemLista }) => {
            if (item.tipo === 'cabecalho') {
              return (
                <ThemedView style={styles.diaHeader}>
                  <ThemedText type="smallBold">{formatarDataCurta(item.data)}</ThemedText>
                </ThemedView>
              );
            }
            if (item.tipo === 'rodape') {
              return (
                <ThemedView style={styles.diaRodape}>
                  <ThemedText type="small" themeColor="textSecondary" numeric>
                    Saldo do dia: {formatarValor(item.saldoDia)}
                  </ThemedText>
                </ThemedView>
              );
            }
            return (
              <TransacaoItem
                transacao={item.transacao}
                pendenteSync={item.transacao.pendenteSync}
                selecionado={selectedIds.includes(item.transacao.id)}
                modoSelecao={selectedIds.length > 0}
                onPress={() => aoPressionar(item.transacao)}
                onLongPress={() => aoSegurar(item.transacao)}
              />
            );
          }}
        />

        <AcoesLoteBar selectedIds={selectedIds} onDone={() => setSelectedIds([])} />
      </SafeAreaView>

      <FiltrosModal
        visible={filtrosVisiveis}
        onClose={() => setFiltrosVisiveis(false)}
        ano={ano}
        mes={mes}
        status={status}
        contaIds={contaIds}
        categoriaIds={categoriaIds}
        dataInicio={dataInicio}
        dataFim={dataFim}
        onAplicar={aplicarFiltros}
      />

      <TransacaoFormModal
        visible={criando || !!transacaoEmEdicao}
        transacao={transacaoEmEdicao}
        tipoInicial={tipoNovo}
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
  pontoFiltro: { width: 6, height: 6, borderRadius: 3 },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    height: 42,
  },
  buscaInput: { flex: 1, fontSize: 14, padding: 0 },
  statusRow: { flexDirection: 'row', gap: Spacing.two },
  centro: { marginTop: Spacing.five },
  lista: { padding: Spacing.three, gap: Spacing.two, flexGrow: 1 },
  diaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.two },
  diaRodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
});
