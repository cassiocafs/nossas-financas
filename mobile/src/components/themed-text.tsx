import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType =
  | 'display'
  | 'title'
  | 'h3'
  | 'subtitle'
  | 'default'
  | 'label'
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'money'
  | 'moneyLg'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
  /** Aplica algarismos tabulares + tracking negativo — usar em qualquer valor monetário. */
  numeric?: boolean;
};

export function ThemedText({ style, type = 'default', themeColor, numeric, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const color = theme[themeColor ?? (type === 'linkPrimary' ? 'primary' : 'text')];

  return (
    <Text
      style={[
        { color },
        styles[type],
        numeric && styles.numeric,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // display mobile — 800 / 30 / 1.1
  display: {
    fontFamily: Fonts.displayBold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.6,
  },
  // h2 mobile — 700 / 22 / 1.25
  title: {
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  // h3 mobile — 700 / 20 / 1.25
  h3: {
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.3,
  },
  // h4 — 600 / 19 / 1.25
  subtitle: {
    fontFamily: Fonts.bodySemi,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  // body — 400 / 16 / 1.5
  default: {
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  // label — 500 / 14 / 1.5
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 21,
  },
  // body-sm — 400 / 14 / 1.5
  small: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  smallBold: {
    fontFamily: Fonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
  },
  // caption — 500 / 12 / 1.5 · CAIXA ALTA · tracking largo
  caption: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  // money — 600 / 19 / 1.25
  money: {
    fontFamily: Fonts.bodySemi,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  // money-lg — 700 / 30 / 1.1
  moneyLg: {
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
  link: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  linkPrimary: {
    fontFamily: Fonts.bodySemi,
    fontSize: 14,
    lineHeight: 21,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
  numeric: {
    fontFamily: Fonts.bodySemi,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
});
