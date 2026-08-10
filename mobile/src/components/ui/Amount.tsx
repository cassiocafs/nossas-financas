import type { TextStyle } from 'react-native';

import type { TipoTransacao } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { formatarValor } from '@/lib/format';

/** Valor monetário na fonte display, colorido por tipo de lançamento (assume `valor` já assinado). */
export function Amount({ tipo, valor, size = 14, style }: { tipo: TipoTransacao; valor: number; size?: number; style?: TextStyle }) {
  const theme = useTheme();
  const color = tipo === 'RECEITA' ? theme.income : tipo === 'DESPESA' ? theme.expense : theme.transfer;

  return (
    <ThemedText type="smallBold" numeric style={[{ color, fontSize: size }, style]}>
      {formatarValor(valor)}
    </ThemedText>
  );
}
