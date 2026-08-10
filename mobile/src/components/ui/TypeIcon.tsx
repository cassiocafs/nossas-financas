import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

import type { TipoTransacao } from '@/api/transacoes';
import { useTheme } from '@/hooks/use-theme';

const ICON_BY_TIPO: Record<TipoTransacao, keyof typeof Feather.glyphMap> = {
  RECEITA: 'arrow-down-left',
  DESPESA: 'arrow-up-right',
  TRANSFERENCIA: 'repeat',
};

export function TypeIcon({ tipo, size = 36 }: { tipo: TipoTransacao; size?: number }) {
  const theme = useTheme();
  const bg = tipo === 'RECEITA' ? theme.incomeSoft : tipo === 'DESPESA' ? theme.expenseSoft : theme.transferSoft;
  const fg = tipo === 'RECEITA' ? theme.income : tipo === 'DESPESA' ? theme.expense : theme.transfer;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Feather name={ICON_BY_TIPO[tipo]} size={size * 0.45} color={fg} />
    </View>
  );
}
