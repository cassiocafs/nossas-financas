import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import {
  buscarGradeOrcamentoPorAno,
  criarOrcamento,
  listarAnosOrcamento,
  type GrupoGrade,
} from '@/api/orcamento';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DefinirPrevistoModal } from '@/components/relatorios/DefinirPrevistoModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';
import { corCategoria } from '@/lib/categoria-visual';

interface PrevistoRealizadoChartProps {
  ano: number;
  mes: number;
}

function LinhaGrupo({ grupo }: { grupo: GrupoGrade }) {
  const formatarValor = useFormatarValor();
  const theme = useTheme();
  const pct = grupo.subtotalPrevisto > 0 ? (grupo.subtotalRealizado / grupo.subtotalPrevisto) * 100 : 0;
  const estourado = pct > 100;
  const cor = corCategoria(grupo.grupoId ?? grupo.grupoNome).fg;

  return (
    <View style={styles.grupo}>
      <View style={styles.grupoTopo}>
        <View style={styles.grupoNome}>
          <View style={[styles.ponto, { backgroundColor: cor }]} />
          <ThemedText type="smallBold" numberOfLines={1}>
            {grupo.grupoNome}
          </ThemedText>
        </View>
        <ThemedText type="caption" themeColor={estourado ? 'moneyAlert' : 'income'}>
          {Math.round(pct)}%
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        <ThemedText type="smallBold">{formatarValor(grupo.subtotalRealizado)}</ThemedText> de{' '}
        {formatarValor(grupo.subtotalPrevisto)}
      </ThemedText>
      <ProgressBar
        value={Math.min(pct, 100) / 100}
        color={estourado ? theme.moneyAlert : cor}
      />
    </View>
  );
}

export function PrevistoRealizadoChart({ ano, mes }: PrevistoRealizadoChartProps) {
  const queryClient = useQueryClient();
  const [modalVisivel, setModalVisivel] = useState(false);

  const { data: grade, isLoading } = useQuery({
    queryKey: ['orcamento', 'grade', ano, mes],
    queryFn: () => buscarGradeOrcamentoPorAno(ano, mes),
  });

  const { data: anos } = useQuery({ queryKey: ['orcamento', 'anos'], queryFn: listarAnosOrcamento });
  const temOrcamentoDoAno = (anos ?? []).some((a) => a.ano === ano) || !!grade;

  const criarMutation = useMutation({
    mutationFn: () => criarOrcamento(ano),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orcamento'] }),
    onError: (e) =>
      Alert.alert('Não foi possível criar', e instanceof ApiError ? e.message : 'Tente novamente.'),
  });

  const gruposComDado = (grade?.grupos ?? []).filter(
    (g) => g.subtotalPrevisto > 0 || g.subtotalRealizado > 0,
  );
  const noLimite = gruposComDado.filter(
    (g) => g.subtotalPrevisto > 0 && g.subtotalRealizado > g.subtotalPrevisto,
  ).length;

  return (
    <Card style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold">Orçamento: planejado × realizado</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Barras acima de 100% indicam estouro do previsto
        </ThemedText>
      </ThemedView>

      {isLoading ? (
        <ThemedText type="small" themeColor="textSecondary">
          Carregando...
        </ThemedText>
      ) : !temOrcamentoDoAno ? (
        <ThemedView style={styles.vazio}>
          <ThemedText type="small" themeColor="textSecondary">
            Nenhum orçamento para {ano}.
          </ThemedText>
          <Button
            title={criarMutation.isPending ? 'Criando...' : `Criar orçamento ${ano}`}
            onPress={() => criarMutation.mutate()}
            loading={criarMutation.isPending}
          />
        </ThemedView>
      ) : (
        <>
          {noLimite > 0 ? (
            <ThemedText type="small" themeColor="moneyAlert">
              {noLimite} {noLimite === 1 ? 'grupo' : 'grupos'} no limite
            </ThemedText>
          ) : null}

          {gruposComDado.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              Nenhum previsto definido para este mês.
            </ThemedText>
          ) : (
            <View style={styles.grupos}>
              {gruposComDado.map((g) => (
                <LinhaGrupo key={g.grupoId ?? g.grupoNome} grupo={g} />
              ))}
            </View>
          )}

          {grade ? (
            <Button
              title="Incluir no orçamento"
              variant="secondary"
              icon="edit-2"
              onPress={() => setModalVisivel(true)}
            />
          ) : null}
        </>
      )}

      {grade ? (
        <DefinirPrevistoModal
          visible={modalVisivel}
          orcamentoId={grade.orcamentoId}
          onClose={() => setModalVisivel(false)}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  header: { gap: 2 },
  vazio: { gap: Spacing.three, alignItems: 'flex-start' },
  grupos: { gap: Spacing.three },
  grupo: { gap: Spacing.two },
  grupoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  grupoNome: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  ponto: { width: 8, height: 8, borderRadius: 2 },
});
