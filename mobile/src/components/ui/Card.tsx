import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type CardProps = ViewProps & {
  /**
   * `elevated` (padrão) = branco com sombra `sm` + borda 1px.
   * `flat` = preenchimento sutil sem sombra.
   * `feature` = branco, raio 20 (card de destaque).
   * `brand` = card sólido verde (hero de saldo).
   */
  variant?: 'elevated' | 'flat' | 'feature' | 'brand';
  /** `default` = 24 · `compact` = 16 · `none` = sem padding. */
  padding?: 'default' | 'compact' | 'none';
  /** @deprecated use `padding="none"` */
  padded?: boolean;
};

export function Card({ variant = 'elevated', padding, padded, style, ...rest }: CardProps) {
  const theme = useTheme();

  const pad = padding ?? (padded === false ? 'none' : 'default');

  return (
    <View
      style={[
        { borderRadius: variant === 'feature' || variant === 'brand' ? Radius.cardFeature : Radius.card },
        pad === 'default' && styles.padDefault,
        pad === 'compact' && styles.padCompact,
        variant === 'elevated' || variant === 'feature'
          ? { backgroundColor: theme.card, borderColor: theme.border, borderWidth: StyleSheet.hairlineWidth, ...Shadow.sm }
          : variant === 'brand'
            ? { backgroundColor: theme.brandSurface, ...Shadow.md }
            : { backgroundColor: theme.surface },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  padDefault: { padding: Spacing.four },
  padCompact: { padding: Spacing.three },
});
