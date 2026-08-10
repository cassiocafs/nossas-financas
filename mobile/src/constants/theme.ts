import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F7F8FA',
    surface: '#EDEFF3',
    card: '#FFFFFF',
    border: '#E3E6EC',
    text: '#1F2937',
    textSecondary: '#7A8496',
    textTertiary: '#A4ACBA',
    primary: '#232B3A',
    primaryForeground: '#F8F9FB',
    income: '#2E9E7C',
    incomeSoft: '#DCF2E7',
    expense: '#E2564A',
    expenseSoft: '#FBE6E3',
    transfer: '#5E7FD0',
    transferSoft: '#E6EBF8',
    destructive: '#DC4A3D',
    destructiveForeground: '#FFFFFF',
  },
  dark: {
    background: '#14181F',
    surface: '#2A3038',
    card: '#1E242C',
    border: '#31373F',
    text: '#F5F6F8',
    textSecondary: '#A7AEBB',
    textTertiary: '#7B8393',
    primary: '#F3F4F7',
    primaryForeground: '#1A1F27',
    income: '#49C39B',
    incomeSoft: '#26473C',
    expense: '#F0685A',
    expenseSoft: '#4A2A26',
    transfer: '#7C9AE0',
    transferSoft: '#26314A',
    destructive: '#F0685A',
    destructiveForeground: '#14181F',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const ChartColors = ['#2E9E7C', '#E2564A', '#5E7FD0', '#D89A3A', '#9A6BD1'];

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

/** Space Grotesk (títulos/valores) + DM Sans (corpo), carregadas via expo-font no RootLayout. */
export const Fonts = {
  ...SystemFonts,
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemi: 'DMSans_600SemiBold',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  card: 24,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  lift: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
