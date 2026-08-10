import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listarContas } from '@/api/contas';
import { listarGrupos } from '@/api/categorias';
import type { StatusFiltro } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Chip } from '@/components/ui/Chip';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const OPCOES_STATUS: { valor: StatusFiltro; label: string }[] = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'consolidadas', label: 'Consolidadas' },
  { valor: 'pendentes', label: 'Pendentes' },
];

interface FiltrosModalProps {
  visible: boolean;
  onClose: () => void;
  status: StatusFiltro;
  onStatusChange: (status: StatusFiltro) => void;
  contaIds: string[];
  onContaIdsChange: (ids: string[]) => void;
  categoriaIds: string[];
  onCategoriaIdsChange: (ids: string[]) => void;
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
  status,
  onStatusChange,
  contaIds,
  onContaIdsChange,
  categoriaIds,
  onCategoriaIdsChange,
}: FiltrosModalProps) {
  const [gruposExpandidos, setGruposExpandidos] = useState<Record<string, boolean>>({});

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
    onContaIdsChange(contaIds.includes(id) ? contaIds.filter((c) => c !== id) : [...contaIds, id]);
  }

  function alternarTodasContas() {
    onContaIdsChange(
      contaIds.length === contasOrdenadas.length ? [] : contasOrdenadas.map((c) => c.id),
    );
  }

  function alternarCategoria(id: string) {
    onCategoriaIdsChange(
      categoriaIds.includes(id) ? categoriaIds.filter((c) => c !== id) : [...categoriaIds, id],
    );
  }

  function grupoExpandido(id: string) {
    return gruposExpandidos[id] ?? true;
  }

  function alternarGrupo(id: string) {
    setGruposExpandidos((prev) => ({ ...prev, [id]: !grupoExpandido(id) }));
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ThemedView type="background" style={styles.container}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <ThemedView style={styles.header}>
            <ThemedText type="subtitle">Filtros</ThemedText>
            <Pressable onPress={onClose}>
              <ThemedText type="small" themeColor="textSecondary">
                Fechar
              </ThemedText>
            </Pressable>
          </ThemedView>

          <ScrollView contentContainerStyle={styles.scroll}>
            <ThemedView style={styles.secao}>
              <ThemedText type="smallBold">Status</ThemedText>
              <ThemedView style={styles.chipsRow}>
                {OPCOES_STATUS.map((opcao) => (
                  <Chip
                    key={opcao.valor}
                    label={opcao.label}
                    selected={status === opcao.valor}
                    onPress={() => onStatusChange(opcao.valor)}
                  />
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.secao}>
              <ThemedView style={styles.secaoHeader}>
                <ThemedText type="smallBold">Contas</ThemedText>
                <Pressable onPress={alternarTodasContas}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Todos
                  </ThemedText>
                </Pressable>
              </ThemedView>
              {contasOrdenadas.map((conta) => (
                <Pressable
                  key={conta.id}
                  onPress={() => alternarConta(conta.id)}
                  style={styles.linhaSelecionavel}>
                  <Marcador marcado={contaIds.includes(conta.id)} />
                  <ThemedText type="small">{conta.nome}</ThemedText>
                </Pressable>
              ))}
            </ThemedView>

            <ThemedView style={styles.secao}>
              <ThemedText type="smallBold">Categorias</ThemedText>
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
                            <Marcador marcado={categoriaIds.includes(categoria.id)} />
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
                                      <Marcador marcado={categoriaIds.includes(categoria.id)} />
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
                  {gruposData.grupos.length > 0 && (
                    <ThemedText type="smallBold" themeColor="textSecondary">
                      Sem grupo
                    </ThemedText>
                  )}
                  {gruposData.semGrupo.map((categoria) => (
                    <Pressable
                      key={categoria.id}
                      onPress={() => alternarCategoria(categoria.id)}
                      style={styles.linhaSelecionavel}>
                      <Marcador marcado={categoriaIds.includes(categoria.id)} />
                      <ThemedText type="small">{categoria.nome}</ThemedText>
                    </Pressable>
                  ))}
                </ThemedView>
              )}
            </ThemedView>
          </ScrollView>
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
});
