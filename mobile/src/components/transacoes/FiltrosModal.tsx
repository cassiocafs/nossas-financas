import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listarContas } from '@/api/contas';
import { listarGrupos } from '@/api/categorias';
import type { StatusFiltro } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { DateField } from '@/components/ui/DateField';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const OPCOES_STATUS: { valor: StatusFiltro; label: string }[] = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'consolidadas', label: 'Consolidadas' },
  { valor: 'pendentes', label: 'Pendentes' },
];

export interface FiltrosAplicados {
  status: StatusFiltro;
  contaIds: string[];
  categoriaIds: string[];
  dataInicio: string | null;
  dataFim: string | null;
}

interface FiltrosModalProps {
  visible: boolean;
  onClose: () => void;
  ano: number;
  mes: number;
  status: StatusFiltro;
  contaIds: string[];
  categoriaIds: string[];
  dataInicio: string | null;
  dataFim: string | null;
  onAplicar: (filtros: FiltrosAplicados) => void;
}

function primeiroDiaDoMes(ano: number, mes: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}-01`;
}

function ultimoDiaDoMes(ano: number, mes: number): string {
  const ultimoDia = new Date(ano, mes, 0).getDate();
  return `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
}

function Marcador({ marcado }: { marcado: boolean }) {
  const theme = useTheme();
  return (
    <ThemedView
      style={[
        styles.marcador,
        {
          borderColor: marcado ? theme.primary : theme.border,
          backgroundColor: marcado ? theme.primary : 'transparent',
        },
      ]}>
      {marcado && (
        <ThemedText type="small" themeColor="primaryForeground" style={styles.marcadorCheck}>
          ✓
        </ThemedText>
      )}
    </ThemedView>
  );
}

export function FiltrosModal({
  visible,
  onClose,
  ano,
  mes,
  status,
  contaIds,
  categoriaIds,
  dataInicio,
  dataFim,
  onAplicar,
}: FiltrosModalProps) {
  const theme = useTheme();
  const [gruposExpandidos, setGruposExpandidos] = useState<Record<string, boolean>>({});

  const [statusDraft, setStatusDraft] = useState(status);
  const [contaIdsDraft, setContaIdsDraft] = useState(contaIds);
  const [categoriaIdsDraft, setCategoriaIdsDraft] = useState(categoriaIds);
  const [periodoPersonalizado, setPeriodoPersonalizado] = useState(Boolean(dataInicio || dataFim));
  const [dataInicioDraft, setDataInicioDraft] = useState(dataInicio ?? primeiroDiaDoMes(ano, mes));
  const [dataFimDraft, setDataFimDraft] = useState(dataFim ?? ultimoDiaDoMes(ano, mes));

  // Sincroniza o rascunho com os filtros aplicados sempre que o modal reabre,
  // ajustado durante a renderização (em vez de um efeito) para evitar re-render em cascata.
  const [visibleAnterior, setVisibleAnterior] = useState(visible);
  if (visible !== visibleAnterior) {
    setVisibleAnterior(visible);
    if (visible) {
      setStatusDraft(status);
      setContaIdsDraft(contaIds);
      setCategoriaIdsDraft(categoriaIds);
      setPeriodoPersonalizado(Boolean(dataInicio || dataFim));
      setDataInicioDraft(dataInicio ?? primeiroDiaDoMes(ano, mes));
      setDataFimDraft(dataFim ?? ultimoDiaDoMes(ano, mes));
    }
  }

  const { data: contas = [] } = useQuery({
    queryKey: ['contas'],
    queryFn: () => listarContas(true),
  });
  const contasOrdenadas = useMemo(
    () => [...contas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [contas],
  );

  const { data: gruposData } = useQuery({
    queryKey: ['categorias', 'grupos'],
    queryFn: listarGrupos,
  });

  function alternarConta(id: string) {
    setContaIdsDraft((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function alternarTodasContas() {
    setContaIdsDraft((prev) =>
      prev.length === contasOrdenadas.length ? [] : contasOrdenadas.map((c) => c.id),
    );
  }

  function alternarCategoria(id: string) {
    setCategoriaIdsDraft((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  function grupoExpandido(id: string) {
    return gruposExpandidos[id] ?? false;
  }

  function alternarGrupo(id: string) {
    setGruposExpandidos((prev) => ({ ...prev, [id]: !grupoExpandido(id) }));
  }

  function mudarDataInicio(valor: string) {
    setDataInicioDraft(valor);
    if (valor > dataFimDraft) setDataFimDraft(valor);
  }

  function mudarDataFim(valor: string) {
    setDataFimDraft(valor);
    if (valor < dataInicioDraft) setDataInicioDraft(valor);
  }

  function limpar() {
    setStatusDraft('todas');
    setContaIdsDraft(contasOrdenadas.map((c) => c.id));
    setCategoriaIdsDraft([]);
    setPeriodoPersonalizado(false);
    setDataInicioDraft(primeiroDiaDoMes(ano, mes));
    setDataFimDraft(ultimoDiaDoMes(ano, mes));
  }

  function aplicar() {
    onAplicar({
      status: statusDraft,
      contaIds: contaIdsDraft,
      categoriaIds: categoriaIdsDraft,
      dataInicio: periodoPersonalizado ? dataInicioDraft : null,
      dataFim: periodoPersonalizado ? dataFimDraft : null,
    });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Filtros</ThemedText>
            <ThemedView style={styles.headerAcoes}>
              <Pressable onPress={limpar} hitSlop={8}>
                <ThemedText type="small" themeColor="textSecondary">
                  Limpar
                </ThemedText>
              </Pressable>
              <Pressable onPress={onClose} hitSlop={8}>
                <Feather name="x" size={20} color={theme.text} />
              </Pressable>
            </ThemedView>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll}>
            <ThemedView style={styles.secao}>
              <ThemedText type="smallBold">Status</ThemedText>
              <ThemedView style={styles.chipsRow}>
                {OPCOES_STATUS.map((opcao) => (
                  <Chip
                    key={opcao.valor}
                    label={opcao.label}
                    selected={statusDraft === opcao.valor}
                    onPress={() => setStatusDraft(opcao.valor)}
                  />
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.secao}>
              <ThemedText type="smallBold">Período</ThemedText>
              <ThemedView style={styles.chipsRow}>
                <Chip label="Mês inteiro" selected={!periodoPersonalizado} onPress={() => setPeriodoPersonalizado(false)} />
                <Chip label="Personalizado" selected={periodoPersonalizado} onPress={() => setPeriodoPersonalizado(true)} />
              </ThemedView>
              {periodoPersonalizado && (
                <ThemedView style={styles.periodoLinha}>
                  <ThemedView style={styles.periodoCampo}>
                    <ThemedText type="small" themeColor="textSecondary">
                      De
                    </ThemedText>
                    <DateField value={dataInicioDraft} onChange={mudarDataInicio} />
                  </ThemedView>
                  <ThemedView style={styles.periodoCampo}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Até
                    </ThemedText>
                    <DateField value={dataFimDraft} onChange={mudarDataFim} />
                  </ThemedView>
                </ThemedView>
              )}
            </ThemedView>

            <ThemedView style={styles.secao}>
              <ThemedView style={styles.secaoHeader}>
                <ThemedText type="smallBold">
                  Contas{contaIdsDraft.length > 0 && contaIdsDraft.length < contasOrdenadas.length
                    ? ` (${contaIdsDraft.length})`
                    : ''}
                </ThemedText>
                <Pressable onPress={alternarTodasContas} hitSlop={8}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {contaIdsDraft.length === contasOrdenadas.length ? 'Limpar' : 'Todas'}
                  </ThemedText>
                </Pressable>
              </ThemedView>
              <ThemedView style={styles.chipsRow}>
                {contasOrdenadas.map((conta) => (
                  <Chip
                    key={conta.id}
                    label={conta.nome}
                    selected={contaIdsDraft.includes(conta.id)}
                    onPress={() => alternarConta(conta.id)}
                  />
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.secao}>
              <ThemedView style={styles.secaoHeader}>
                <ThemedText type="smallBold">
                  Categorias{categoriaIdsDraft.length > 0 ? ` (${categoriaIdsDraft.length})` : ''}
                </ThemedText>
                {categoriaIdsDraft.length > 0 && (
                  <Pressable onPress={() => setCategoriaIdsDraft([])} hitSlop={8}>
                    <ThemedText type="small" themeColor="textSecondary">
                      Limpar
                    </ThemedText>
                  </Pressable>
                )}
              </ThemedView>
              {gruposData?.grupos.map((grupo) => {
                const expandido = grupoExpandido(grupo.id);
                return (
                  <ThemedView key={grupo.id} style={styles.grupo}>
                    <Pressable onPress={() => alternarGrupo(grupo.id)} style={styles.grupoHeader}>
                      <ThemedText type="small">{expandido ? '▾' : '▸'}</ThemedText>
                      <ThemedText type="smallBold">{grupo.nome}</ThemedText>
                    </Pressable>
                    {expandido && (
                      <ThemedView style={styles.grupoConteudo}>
                        {grupo.categorias.map((categoria) => (
                          <Pressable
                            key={categoria.id}
                            onPress={() => alternarCategoria(categoria.id)}
                            style={styles.linhaSelecionavel}>
                            <Marcador marcado={categoriaIdsDraft.includes(categoria.id)} />
                            <ThemedText type="small">{categoria.nome}</ThemedText>
                          </Pressable>
                        ))}
                        {grupo.subgrupos.map((subgrupo) => {
                          const subChave = `sub-${subgrupo.id}`;
                          const subExpandido = grupoExpandido(subChave);
                          return (
                            <ThemedView key={subgrupo.id} style={styles.subgrupo}>
                              <Pressable
                                onPress={() => alternarGrupo(subChave)}
                                style={styles.grupoHeader}>
                                <ThemedText type="small">{subExpandido ? '▾' : '▸'}</ThemedText>
                                <ThemedText type="small" themeColor="textSecondary">
                                  {subgrupo.nome}
                                </ThemedText>
                              </Pressable>
                              {subExpandido && (
                                <ThemedView style={styles.grupoConteudo}>
                                  {subgrupo.categorias.map((categoria) => (
                                    <Pressable
                                      key={categoria.id}
                                      onPress={() => alternarCategoria(categoria.id)}
                                      style={styles.linhaSelecionavel}>
                                      <Marcador marcado={categoriaIdsDraft.includes(categoria.id)} />
                                      <ThemedText type="small">{categoria.nome}</ThemedText>
                                    </Pressable>
                                  ))}
                                </ThemedView>
                              )}
                            </ThemedView>
                          );
                        })}
                      </ThemedView>
                    )}
                  </ThemedView>
                );
              })}
              {gruposData?.semGrupo && gruposData.semGrupo.length > 0 && (
                <ThemedView style={styles.grupo}>
                  <Pressable onPress={() => alternarGrupo('sem-grupo')} style={styles.grupoHeader}>
                    <ThemedText type="small">{grupoExpandido('sem-grupo') ? '▾' : '▸'}</ThemedText>
                    <ThemedText type="smallBold" themeColor="textSecondary">
                      Sem grupo
                    </ThemedText>
                  </Pressable>
                  {grupoExpandido('sem-grupo') && (
                    <ThemedView style={styles.grupoConteudo}>
                      {gruposData.semGrupo.map((categoria) => (
                        <Pressable
                          key={categoria.id}
                          onPress={() => alternarCategoria(categoria.id)}
                          style={styles.linhaSelecionavel}>
                          <Marcador marcado={categoriaIdsDraft.includes(categoria.id)} />
                          <ThemedText type="small">{categoria.nome}</ThemedText>
                        </Pressable>
                      ))}
                    </ThemedView>
                  )}
                </ThemedView>
              )}
            </ThemedView>
          </ScrollView>

          <ThemedView style={[styles.rodape, { borderTopColor: theme.border }]}>
            <Button title="Filtrar" onPress={aplicar} style={styles.botaoFiltrar} />
          </ThemedView>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  headerAcoes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  scroll: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.four },
  secao: { gap: Spacing.two },
  secaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  periodoLinha: { flexDirection: 'row', gap: Spacing.two },
  periodoCampo: { flex: 1, gap: Spacing.one },
  linhaSelecionavel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  marcador: {
    width: 18,
    height: 18,
    borderRadius: Radius.sm - 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcadorCheck: { fontSize: 11, lineHeight: 14 },
  grupo: { gap: Spacing.half },
  grupoHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingVertical: Spacing.one },
  grupoConteudo: { paddingLeft: Spacing.three, gap: Spacing.half },
  subgrupo: { paddingLeft: Spacing.two, gap: Spacing.half },
  rodape: {
    borderTopWidth: 1,
    padding: Spacing.four,
  },
  botaoFiltrar: { width: '100%' },
});
