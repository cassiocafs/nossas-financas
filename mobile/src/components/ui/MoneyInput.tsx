import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type MoneySign = 'in' | 'out' | 'none';

interface MoneyInputProps {
  label: string;
  /** Valor em centavos. `null` = vazio. */
  valorCentavos: number | null;
  onChange: (valorCentavos: number | null) => void;
  sign: MoneySign;
  hint?: string;
  disabled?: boolean;
}

function formatar(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Campo de valor da Nova transação: numerais grandes, prefixo de sinal, hint por tipo. */
export function MoneyInput({ label, valorCentavos, onChange, sign, hint, disabled }: MoneyInputProps) {
  const theme = useTheme();

  const prefixo = sign === 'in' ? '+ ' : sign === 'out' ? '− ' : '';
  const cor = sign === 'in' ? theme.income : theme.text;
  const texto = valorCentavos == null ? '' : `${prefixo}R$ ${formatar(valorCentavos)}`;

  function handleChange(raw: string) {
    const digitos = raw.replace(/\D/g, '');
    onChange(digitos ? parseInt(digitos, 10) : null);
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.cream }]}>
      <ThemedText type="caption" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        value={texto}
        onChangeText={handleChange}
        placeholder="R$ 0,00"
        placeholderTextColor={theme.textTertiary}
        keyboardType="number-pad"
        editable={!disabled}
        selection={{ start: texto.length, end: texto.length }}
        style={[styles.input, { color: cor }]}
      />
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    fontFamily: Fonts.display,
    fontSize: 30,
    letterSpacing: -0.6,
    includeFontPadding: false,
    paddingVertical: Spacing.one,
    minHeight: 44,
  },
});
