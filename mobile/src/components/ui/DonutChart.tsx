import Svg, { Circle, Path } from 'react-native-svg';

export interface DonutFatia {
  chave: string;
  valor: number;
  cor: string;
}

interface DonutChartProps {
  fatias: DonutFatia[];
  size: number;
  onPressFatia?: (chave: string) => void;
}

const PADDING_DEG = 2;

function polar(cx: number, cy: number, r: number, anguloDeg: number) {
  const rad = (anguloDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function wedgePath(cx: number, cy: number, R: number, r: number, anguloIni: number, anguloFim: number) {
  const outerIni = polar(cx, cy, R, anguloIni);
  const outerFim = polar(cx, cy, R, anguloFim);
  const innerFim = polar(cx, cy, r, anguloFim);
  const innerIni = polar(cx, cy, r, anguloIni);
  const largeArc = anguloFim - anguloIni > 180 ? 1 : 0;

  return [
    `M ${outerIni.x} ${outerIni.y}`,
    `A ${R} ${R} 0 ${largeArc} 1 ${outerFim.x} ${outerFim.y}`,
    `L ${innerFim.x} ${innerFim.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${innerIni.x} ${innerIni.y}`,
    'Z',
  ].join(' ');
}

function calcularArcos(fatias: DonutFatia[], total: number, cx: number, cy: number, R: number, r: number) {
  const n = fatias.length;
  const gapTotal = n > 1 ? PADDING_DEG * n : 0;
  const disponivel = 360 - gapTotal;

  const anguloIniPorIndice = fatias.reduce<number[]>((acc, fatia, indice) => {
    const anteriorFim = indice === 0 ? 0 : acc[indice - 1] + (fatias[indice - 1].valor / total) * disponivel + PADDING_DEG;
    acc.push(anteriorFim);
    return acc;
  }, []);

  return fatias.map((fatia, indice) => {
    const anguloIni = anguloIniPorIndice[indice];
    const anguloFim = anguloIni + (fatia.valor / total) * disponivel;
    return { ...fatia, d: wedgePath(cx, cy, R, r, anguloIni, anguloFim) };
  });
}

export function DonutChart({ fatias, size, onPressFatia }: DonutChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const raioExterno = size * 0.5;
  const raioInterno = size * 0.32;
  const total = fatias.reduce((soma, f) => soma + f.valor, 0);

  if (total <= 0) return null;

  const comFatiasPositivas = fatias.filter((f) => f.valor > 0);

  if (comFatiasPositivas.length === 1) {
    const unica = comFatiasPositivas[0];
    return (
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={(raioExterno + raioInterno) / 2}
          stroke={unica.cor}
          strokeWidth={raioExterno - raioInterno}
          fill="none"
          onPress={onPressFatia ? () => onPressFatia(unica.chave) : undefined}
        />
      </Svg>
    );
  }

  const arcos = calcularArcos(comFatiasPositivas, total, cx, cy, raioExterno, raioInterno);

  return (
    <Svg width={size} height={size}>
      {arcos.map((arco) => (
        <Path
          key={arco.chave}
          d={arco.d}
          fill={arco.cor}
          onPress={onPressFatia ? () => onPressFatia(arco.chave) : undefined}
        />
      ))}
    </Svg>
  );
}
