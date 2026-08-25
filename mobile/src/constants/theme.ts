import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#FBF8F0',
    surface: '#F7F9F8',
    card: '#FFFFFF',
    border: 'rgba(22,32,27,0.08)',
    text: '#16201B',
    textSecondary: '#77887F',
    textTertiary: '#9BA8A1',
    primary: '#0D5B2E',
    primaryForeground: '#FFFFFF',
    income: '#1FA34A',
    incomeSoft: 'rgba(31,163,74,0.12)',
    expense: '#16201B',
    expenseSoft: 'rgba(22,32,27,0.06)',
    transfer: '#2C7BE5',
    transferSoft: 'rgba(44,123,229,0.10)',
    destructive: '#D93B30',
    destructiveSoft: 'rgba(217,59,48,0.10)',
    destructiveForeground: '#FFFFFF',
    warning: '#FFC107',
    warningForeground: '#16201B',
    moneyAlert: '#D93B30',
  },
  dark: {
    background: '#16201B',
    surface: '#1C2620',
    card: '#24312A',
    border: 'rgba(255,255,255,0.10)',
    text: '#F7F9F8',
    textSecondary: '#9BA8A1',
    textTertiary: '#77887F',
    primary: '#1FA34A',
    primaryForeground: '#FFFFFF',
    income: '#35B45E',
    incomeSoft: 'rgba(53,180,94,0.16)',
    expense: '#F7F9F8',
    expenseSoft: 'rgba(255,255,255,0.06)',
    transfer: '#4C93EF',
    transferSoft: 'rgba(76,147,239,0.16)',
    destructive: '#E5493E',
    destructiveSoft: 'rgba(229,73,62,0.16)',
    destructiveForeground: '#FFFFFF',
    warning: '#FFC107',
    warningForeground: '#16201B',
    moneyAlert: '#E5493E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const ChartColors = ['#0D5B2E', '#1FA34A', '#2C7BE5', '#FFC107', '#D93B30'];

const SystemFonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})!;

/** Poppins (títulos, corpo e valores), carregada via expo-font no RootLayout. */
export const Fonts = {
  ...SystemFonts,
  display: 'Poppins_700Bold',
  displayBold: 'Poppins_800ExtraBold',
  body: 'Poppins_400Regular',
  bodyMedium: 'Poppins_500Medium',
  bodySemi: 'Poppins_600SemiBold',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  fiveAndHalf: 48,
  six: 64,
} as const;

export const Radius = {
  xs: 9,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  card: 20,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#0D5B2E',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lift: {
    shadowColor: '#0D5B2E',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
