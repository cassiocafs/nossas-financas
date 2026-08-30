import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listarGrupos } from '@/api/categorias';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Overlay, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface CategoriaSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  title?: string;
  clearLabel?: string;
  disabled?: boolean;
  /** 'row' renderiza como linha com rótulo à esquerda e valor à direita, sem borda. */
  variant?: 'input' | 'row';
  label?: string;
}

interface ItemCategoria {
  id: string;
  nome: string;
  grupoNome: string | null;
  subgrupoNome: string | null;
}

type LinhaArvore =
  | { tipo: 'cabecalho'; nivel: 1 | 2; texto: string; key: string }
  | { tipo: 'item'; item: ItemCategoria; key: string };

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function CategoriaSelect({
  value,
  onChange,
  placeholder = 'Sem categoria',
  title = 'Selecionar categoria',
  clearLabel = 'Sem categoria',
  disabled,
  variant = 'input',
  label,
}: CategoriaSelectProps) {
  const theme = useTheme();
  const { data } = useQuery({ queryKey: ['categorias', 'grupos'], queryFn: listarGrupos });
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const isRow = variant === 'row';

  const itens = useMemo<ItemCategoria[]>(() => {
    if (!data) return [];
    const lista: ItemCategoria[] = [];
    for (const grupo of data.grupos) {
      for (const subgrupo of grupo.subgrupos) {
        for (const c of subgrupo.categorias) {
          lista.push({ id: c.id, nome: c.nome, grupoNome: grupo.nome, subgrupoNome: subgrupo.nome });
        }
      }
      for (const c of grupo.categorias) {
        lista.push({ id: c.id, nome: c.nome, grupoNome: grupo.nome, subgrupoNome: null });
      }
    }
    for (const c of data.semGrupo) {
      lista.push({ id: c.id, nome: c.nome, grupoNome: null, subgrupoNome: null });
    }
    return lista;
  }, [data]);

  const selecionada = useMemo(() => itens.find((i) => i.id === value) ?? null, [itens, value]);

  const itensFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return itens;
    return itens.filter((i) =>
      [i.nome, i.subgrupoNome, i.grupoNome].some((t) => t && normalizar(t).includes(termo)),
    );
  }, [itens, busca]);

  const linhas = useMemo<LinhaArvore[]>(() => {
    const resultado: LinhaArvore[] = [];
    let grupoAtual: string | null | undefined;
    let subgrupoAtual: string | null | undefined;
    itensFiltrados.forEach((item, i) => {
      if (item.grupoNome !== grupoAtual) {
        grupoAtual = item.grupoNome;
        subgrupoAtual = undefined;
        if (item.grupoNome) {
          resultado.push({ tipo: 'cabecalho', nivel: 1, texto: item.grupoNome, key: `g-${i}` });
        }
      }
      if (item.subgrupoNome !== subgrupoAtual) {
        subgrupoAtual = item.subgrupoNome;
        if (item.subgrupoNome) {
          resultado.push({ tipo: 'cabecalho', nivel: 2, texto: item.subgrupoNome, key: `s-${i}` });
        }
      }
      resultado.push({ tipo: 'item', item, key: item.id });
    });
    return resultado;
  }, [itensFiltrados]);

  function selecionar(id: string | null) {
    onChange(id);
    setAberto(false);
    setBusca('');
  }

  function fechar() {
    setAberto(false);
    setBusca('');
  }

  return (
    <>
      <Pressable
        onPress={() => !disabled && setAberto(true)}
        disabled={disabled}
        style={[
          isRow ? styles.row : styles.input,
          isRow ? { backgroundColor: theme.surface } : { borderColor: theme.border },
          disabled && styles.desabilitado,
        ]}
        accessibilityRole="button">
        {isRow && label && (
          <ThemedText type="label" themeColor="textSecondary">
            {label}
          </ThemedText>
        )}
        <ThemedText
          type="default"
          themeColor={selecionada ? 'text' : 'textTertiary'}
          numberOfLines={1}
          style={isRow ? styles.rowValue : styles.inputText}>
          {selecionada?.nome ?? placeholder}
        </ThemedText>
        {!isRow && <Feather name="chevron-down" size={18} color={theme.textSecondary} />}
      </Pressable>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={fechar}>
        <ThemedView style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={fechar} />
          <ThemedView type="card" style={styles.sheet}>
            <SafeAreaView edges={['bottom']} style={styles.sheetInner}>
              <ThemedView type="card" style={styles.sheetHeader}>
                <ThemedText type="subtitle">{title}</ThemedText>
                <Pressable onPress={fechar}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Fechar
                  </ThemedText>
                </Pressable>
              </ThemedView>

              <ThemedView style={[styles.buscaContainer, { borderColor: theme.border }]}>
                <Feather name="search" size={16} color={theme.textTertiary} />
                <TextInput
                  value={busca}
                  onChangeText={setBusca}
                  placeholder="Buscar categoria..."
                  placeholderTextColor={theme.textTertiary}
                  style={[styles.buscaInput, { color: theme.text }]}
                  autoCorrect={false}
                />
                {busca.length > 0 && (
                  <Pressable onPress={() => setBusca('')} hitSlop={8}>
                    <Feather name="x" size={16} color={theme.textTertiary} />
                  </Pressable>
                )}
              </ThemedView>

              <FlatList
                data={linhas}
                keyExtractor={(linha) => linha.key}
                style={styles.list}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                  busca.trim().length === 0 ? (
                    <Pressable
                      style={[styles.option, !value && { backgroundColor: theme.surface }]}
                      onPress={() => selecionar(null)}>
                      <ThemedText type="default">{clearLabel}</ThemedText>
                      {!value && <Feather name="check" size={18} color={theme.primary} />}
                    </Pressable>
                  ) : null
                }
                renderItem={({ item: linha }) => {
                  if (linha.tipo === 'cabecalho') {
                    return (
                      <ThemedText
                        type="caption"
                        themeColor="textTertiary"
                        style={[styles.cabecalho, linha.nivel === 2 && styles.cabecalhoNivel2]}>
                        {linha.texto}
                      </ThemedText>
                    );
                  }
                  const { item } = linha;
                  const selecionado = item.id === value;
                  const indentacao = item.subgrupoNome ? styles.itemNivel2 : item.grupoNome ? styles.itemNivel1 : undefined;
                  return (
                    <Pressable
                      style={[styles.option, indentacao, selecionado && { backgroundColor: theme.surface }]}
                      onPress={() => selecionar(item.id)}>
                      <ThemedText type="default">{item.nome}</ThemedText>
                      {selecionado && <Feather name="check" size={18} color={theme.primary} />}
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <ThemedText type="small" themeColor="textSecondary" style={styles.vazio}>
                    Nenhuma categoria encontrada
                  </ThemedText>
                }
              />
            </SafeAreaView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: { flex: 1 },
  row: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowValue: { fontFamily: Fonts.bodySemi, textAlign: 'right' },
  desabilitado: { opacity: 0.5 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: Overlay },
  sheet: {
    height: '85%',
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
  },
  sheetInner: { flex: 1 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  buscaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  buscaInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  list: { flex: 1, paddingHorizontal: Spacing.four },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
  },
  itemNivel1: { paddingLeft: Spacing.four },
  itemNivel2: { paddingLeft: Spacing.six },
  cabecalho: { paddingTop: Spacing.three, paddingBottom: Spacing.one, paddingHorizontal: Spacing.two },
  cabecalhoNivel2: { paddingLeft: Spacing.four },
  vazio: { textAlign: 'center', paddingVertical: Spacing.six },
});
