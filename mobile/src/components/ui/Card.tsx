import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardProps = ViewProps & {
  /** `elevated` (padrão) = cartão destacado com sombra; `flat` = preenchimento sutil sem sombra. */
  variant?: 'elevated' | 'flat';
  padded?: boolean;
};

export function Card({ variant = 'elevated', padded = true, style, ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        variant === 'elevated'
          ? { backgroundColor: theme.card, borderColor: theme.border, borderWidth: StyleSheet.hairlineWidth, ...Shadow.card }
          : { backgroundColor: theme.surface },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: Radius.card },
  padded: { padding: Spacing.four },
});
