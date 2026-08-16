import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { StyleSheet } from 'react-native';

import type { PeriodoMes, PontoEvolucaoSaldo } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/Card';
import { MesNavigator } from '@/components/transacoes/MesNavigator';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatarValor } from '@/lib/format';

interface EvolucaoSaldoChartProps {
  dados: PontoEvolucaoSaldo[];
  inicio: PeriodoMes;
  fim: PeriodoMes;
  onChangeInicio: (ano: number, mes: number) => void;
  onChangeFim: (ano: number, mes: number) => void;
}

const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const ALTURA = 160;
const MARGEM_LATERAL = 8;

export function EvolucaoSaldoChart({ dados, inicio, fim, onChangeInicio, onChangeFim }: EvolucaoSaldoChartProps) {
  const theme = useTheme();
  const largura = 320;

  const valores = dados.map((p) => p.saldoFinal);
  const min = Math.min(...valores, 0);
  const max = Math.max(...valores, 0);
  const margem = (max - min) * 0.1 || 1;
  const topo = max + margem;
  const base = min - margem;

  const larguraUtil = largura - MARGEM_LATERAL * 2;

  function coordenada(indice: number, valor: number) {
    const x = dados.length > 1 ? MARGEM_LATERAL + (indice / (dados.length - 1)) * larguraUtil : largura / 2;
    const y = ALTURA - ((valor - base) / (topo - base)) * ALTURA;
    return { x, y };
  }

  const pontos = dados.map((p, i) => coordenada(i, p.saldoFinal));

  const linhaPath = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath =
    pontos.length > 0
      ? `${linhaPath} L ${pontos[pontos.length - 1].x} ${ALTURA} L ${pontos[0].x} ${ALTURA} Z`
      : '';

  const rotulos = dados.map((p, i) => {
    const mostrar =
      dados.length <= 6 || i === 0 || i === dados.length - 1 || i === Math.floor((dados.length - 1) / 2);
    return { chave: `${p.ano}-${p.mes}`, texto: `${MESES_ABREV[p.mes - 1]}/${String(p.ano).slice(2)}`, mostrar };
  });

  return (
    <Card style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold">Evolução do saldo</ThemedText>
        <ThemedView style={styles.periodo}>
          <MesNavigator ano={inicio.ano} mes={inicio.mes} onChange={onChangeInicio} />
          <ThemedText type="small" themeColor="textSecondary">
            até
          </ThemedText>
          <MesNavigator ano={fim.ano} mes={fim.mes} onChange={onChangeFim} />
        </ThemedView>
      </ThemedView>

      {dados.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Sem dados para o período.
        </ThemedText>
      ) : (
        <>
          <Svg width={largura} height={ALTURA}>
            <Defs>
              <LinearGradient id="evolucaoSaldoGradiente" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={theme.primary} stopOpacity={0.25} />
                <Stop offset="1" stopColor={theme.primary} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={areaPath} fill="url(#evolucaoSaldoGradiente)" />
            <Path d={linhaPath} stroke={theme.primary} strokeWidth={2} fill="none" />
            {pontos.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3} fill={theme.primary} />
            ))}
          </Svg>
          <ThemedView style={styles.eixoX}>
            {rotulos.map((r) => (
              <ThemedText key={r.chave} type="small" themeColor="textSecondary" style={styles.rotulo}>
                {r.mostrar ? r.texto : ''}
              </ThemedText>
            ))}
          </ThemedView>
          <ThemedText type="small" themeColor="textSecondary">
            Saldo atual: {formatarValor(dados[dados.length - 1]?.saldoFinal ?? 0)}
          </ThemedText>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three },
  header: { gap: Spacing.two },
  periodo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  eixoX: { flexDirection: 'row', justifyContent: 'space-between' },
  rotulo: { flex: 1, textAlign: 'center' },
});
