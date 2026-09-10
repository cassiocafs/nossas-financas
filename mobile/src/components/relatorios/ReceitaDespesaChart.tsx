import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { G, Rect } from 'react-native-svg';

import type { RelatorioMes } from '@/api/relatorios';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Spacing } from '@/constants/theme';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

/** Coral das saídas — mesma exceção de design da versão web (`ReceitaDespesaChart`/`FluxoCaixaChart`). */
const COR_SAIDAS = '#E59D98';

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const ALTURA = 150;

type Modo = 'mensal' | 'anual';

interface Barra {
  chave: string;
  rotulo: string;
  receitas: number;
  despesas: number;
}

function agruparPorAno(meses: RelatorioMes[]): Barra[] {
  const porAno = new Map<number, { receitas: number; despesas: number }>();
  for (const m of meses) {
    const atual = porAno.get(m.ano) ?? { receitas: 0, despesas: 0 };
    atual.receitas += m.receitas;
    atual.despesas += m.despesas;
    porAno.set(m.ano, atual);
  }
  return [...porAno.entries()]
    .sort(([a], [b]) => a - b)
    .map(([ano, v]) => ({ chave: String(ano), rotulo: String(ano), receitas: v.receitas, despesas: v.despesas }));
}

interface ReceitaDespesaChartProps {
  meses: RelatorioMes[];
}

export function ReceitaDespesaChart({ meses }: ReceitaDespesaChartProps) {
  const theme = useTheme();
  const formatarValor = useFormatarValor();
  const { width } = useWindowDimensions();
  const [modo, setModo] = useState<Modo>('mensal');

  const largura = Math.max(240, width - Spacing.page * 2 - Spacing.four * 2);

  const barras = useMemo<Barra[]>(() => {
    if (modo === 'anual') return agruparPorAno(meses);
    return meses.slice(-12).map((m) => ({
      chave: `${m.ano}-${m.mes}`,
      rotulo: `${MESES_ABREV[m.mes - 1]}/${String(m.ano).slice(2)}`,
      receitas: m.receitas,
      despesas: m.despesas,
    }));
  }, [meses, modo]);

  const maxValor = Math.max(1, ...barras.flatMap((b) => [b.receitas, b.despesas]));
  const totalReceitas = barras.reduce((s, b) => s + b.receitas, 0);
  const totalDespesas = barras.reduce((s, b) => s + b.despesas, 0);

  const n = barras.length;
  const larguraGrupo = n > 0 ? largura / n : largura;
  const larguraBarra = Math.min(16, (larguraGrupo - 6) / 2);

  return (
    <Card style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold">Receita e despesa</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {modo === 'mensal' ? 'Entrou e saiu em cada mês (últimos 12)' : 'Entrou e saiu em cada ano'}
        </ThemedText>
      </ThemedView>

      <Tabs
        items={[
          { value: 'mensal', label: 'Mensal' },
          { value: 'anual', label: 'Anual' },
        ]}
        value={modo}
        onChange={(v) => setModo(v as Modo)}
      />

      {barras.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Sem dados no período.
        </ThemedText>
      ) : (
        <>
          <Svg width={largura} height={ALTURA}>
            {barras.map((b, i) => {
              const centro = i * larguraGrupo + larguraGrupo / 2;
              const hR = (b.receitas / maxValor) * (ALTURA - 4);
              const hD = (b.despesas / maxValor) * (ALTURA - 4);
              return (
                <G key={b.chave}>
                  <Rect
                    x={centro - larguraBarra - 1}
                    y={ALTURA - hR}
                    width={larguraBarra}
                    height={hR}
                    rx={3}
                    fill={theme.income}
                  />
                  <Rect
                    x={centro + 1}
                    y={ALTURA - hD}
                    width={larguraBarra}
                    height={hD}
                    rx={3}
                    fill={COR_SAIDAS}
                  />
                </G>
              );
            })}
          </Svg>

          <ThemedView style={styles.eixoX}>
            {barras.map((b, i) => {
              const mostrar = n <= 8 || i === 0 || i === n - 1 || i % Math.ceil(n / 6) === 0;
              return (
                <ThemedText key={b.chave} type="small" themeColor="textSecondary" style={styles.rotulo}>
                  {mostrar ? b.rotulo : ''}
                </ThemedText>
              );
            })}
          </ThemedView>

          <ThemedView style={styles.legenda}>
            <ThemedView style={styles.legendaItem}>
              <ThemedView style={[styles.legendaCor, { backgroundColor: theme.income }]} />
              <ThemedText type="small" themeColor="textSecondary">
                Entrou · {formatarValor(totalReceitas)}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.legendaItem}>
              <ThemedView style={[styles.legendaCor, { backgroundColor: COR_SAIDAS }]} />
              <ThemedText type="small" themeColor="textSecondary">
                Saiu · {formatarValor(totalDespesas)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  header: { gap: 2 },
  eixoX: { flexDirection: 'row' },
  rotulo: { flex: 1, textAlign: 'center', fontSize: 10 },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaCor: { width: 10, height: 10, borderRadius: 3 },
});
