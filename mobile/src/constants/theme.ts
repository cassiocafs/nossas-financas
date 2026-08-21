import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F3F5F9',
    surface: '#ECEEF3',
    card: '#FFFFFF',
    border: 'rgba(11,15,23,0.08)',
    text: '#0B0F17',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    primary: '#4F46E5',
    primaryForeground: '#FFFFFF',
    income: '#059669',
    incomeSoft: 'rgba(5,150,105,0.10)',
    expense: '#DC2626',
    expenseSoft: 'rgba(220,38,38,0.09)',
    transfer: '#0284C7',
    transferSoft: 'rgba(2,132,199,0.10)',
    destructive: '#DC2626',
    destructiveForeground: '#FFFFFF',
    warning: '#D97706',
    warningForeground: '#FFFFFF',
  },
  dark: {
    background: '#0B0F17',
    surface: '#161D29',
    card: '#151D2A',
    border: 'rgba(255,255,255,0.08)',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    primary: '#6366F1',
    primaryForeground: '#FFFFFF',
    income: '#10B981',
    incomeSoft: 'rgba(16,185,129,0.14)',
    expense: '#EF4444',
    expenseSoft: 'rgba(239,68,68,0.13)',
    transfer: '#38BDF8',
    transferSoft: 'rgba(56,189,248,0.15)',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    warning: '#F59E0B',
    warningForeground: '#111827',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const ChartColors = ['#6366F1', '#10B981', '#F59E0B', '#38BDF8', '#A78BFA'];

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
