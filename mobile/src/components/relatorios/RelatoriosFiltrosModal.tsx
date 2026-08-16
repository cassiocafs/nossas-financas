import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listarContas } from '@/api/contas';
import { listarGrupos } from '@/api/categorias';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface RelatoriosFiltrosAplicados {
  contaIds: string[];
  categoriaIds: string[];
}

interface RelatoriosFiltrosModalProps {
  visible: boolean;
  onClose: () => void;
  contaIds: string[];
  categoriaIds: string[];
  onAplicar: (filtros: RelatoriosFiltrosAplicados) => void;
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

export function RelatoriosFiltrosModal({
  visible,
  onClose,
  contaIds,
  categoriaIds,
  onAplicar,
}: RelatoriosFiltrosModalProps) {
  const theme = useTheme();
  const [gruposExpandidos, setGruposExpandidos] = useState<Record<string, boolean>>({});

  const [contaIdsDraft, setContaIdsDraft] = useState(contaIds);
  const [categoriaIdsDraft, setCategoriaIdsDraft] = useState(categoriaIds);

  const [visibleAnterior, setVisibleAnterior] = useState(visible);
  if (visible !== visibleAnterior) {
    setVisibleAnterior(visible);
    if (visible) {
      setContaIdsDraft(contaIds);
      setCategoriaIdsDraft(categoriaIds);
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
    setContaIdsDraft((prev) => (prev.length === contasOrdenadas.length ? [] : contasOrdenadas.map((c) => c.id)));
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

  function limpar() {
    setContaIdsDraft([]);
    setCategoriaIdsDraft([]);
  }

  function aplicar() {
    onAplicar({ contaIds: contaIdsDraft, categoriaIds: categoriaIdsDraft });
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
              <ThemedView style={styles.secaoHeader}>
                <ThemedText type="smallBold">
                  Contas
                  {contaIdsDraft.length > 0 && contaIdsDraft.length < contasOrdenadas.length
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
                              <Pressable onPress={() => alternarGrupo(subChave)} style={styles.grupoHeader}>
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
