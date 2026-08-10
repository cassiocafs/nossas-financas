import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F6F7F9',
    surface: '#ECEEF2',
    card: '#FFFFFF',
    border: '#E2E4E9',
    text: '#14161A',
    textSecondary: '#5B616E',
    textTertiary: '#9AA0AC',
    primary: '#2F6FED',
    primaryForeground: '#FFFFFF',
    income: '#1E9563',
    incomeSoft: '#E3F6EC',
    expense: '#D64545',
    expenseSoft: '#FCE8E8',
    transfer: '#5B5BD6',
    transferSoft: '#ECECFB',
    destructive: '#D64545',
    destructiveForeground: '#FFFFFF',
  },
  dark: {
    background: '#0F1115',
    surface: '#191C22',
    card: '#1E212A',
    border: 'rgba(255,255,255,0.09)',
    text: '#F5F6F8',
    textSecondary: '#A8AEBB',
    textTertiary: '#6B7280',
    primary: '#5B8DFF',
    primaryForeground: '#0F1115',
    income: '#3DDC97',
    incomeSoft: '#123024',
    expense: '#F2726B',
    expenseSoft: '#341616',
    transfer: '#9797F0',
    transferSoft: '#211F3A',
    destructive: '#F2726B',
    destructiveForeground: '#0F1115',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
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
});

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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lift: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
