import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'default'
  | 'small'
  | 'smallBold'
  | 'caption'
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
  /** Aplica algarismos tabulares — usar em qualquer valor monetário. */
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
  display: {
    fontFamily: Fonts.displayBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 19,
    lineHeight: 25,
    letterSpacing: -0.3,
  },
  default: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 16,
    lineHeight: 22,
  },
  small: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  smallBold: {
    fontFamily: Fonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    fontFamily: Fonts.bodySemi,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  link: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  linkPrimary: {
    fontFamily: Fonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
  numeric: {
    fontFamily: Fonts.displayBold,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
});
