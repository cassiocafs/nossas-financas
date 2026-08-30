import '@/global.css';

import { Platform } from 'react-native';

/**
 * Design system Poupeu — tokens.
 * Fonte da verdade: `mobile/redesign_handoff_app_mobile/tokens/*.css` + `README.md`.
 *
 * Regra semântica central: verde = positivo, amarelo = atenção, vermelho = problema real,
 * neutro escuro = despesa comum. Gastar não é erro — despesa nunca é vermelha.
 */

/** Rampa completa da marca (uso interno / componentes especiais). */
export const Palette = {
  green900: '#0D5B2E',
  green800: '#0F6A36',
  green700: '#17853F',
  green600: '#1FA34A',
  green500: '#35B45E',
  green300: '#8FD9A9',
  green200: '#C2ECD1',
  green100: '#E4F6EA',

  yellow700: '#B98600',
  yellow600: '#E0A806',
  yellow500: '#FFC107',
  yellow300: '#FFDD73',
  yellow200: '#FFECB3',
  yellow100: '#FFF7E0',

  cream200: '#EFDCB8',
  cream100: '#F5E6C8',
  cream50: '#FBF4E6',
  creamBg: '#FBF8F0',

  neutral0: '#FFFFFF',
  neutral50: '#F7F9F8',
  neutral100: '#EDF1EF',
  neutral200: '#DDE4E0',
  neutral300: '#C2CCC7',
  neutral400: '#9BA8A1',
  neutral500: '#77887F',
  neutral600: '#566860',
  neutral700: '#3A4B41',
  neutral800: '#24312A',
  neutral900: '#16201B',

  error500: '#D93B30',
  error600: '#B32D24',
  info500: '#2C7BE5',
} as const;

export const Colors = {
  light: {
    /** Fundo de página do app (§bg-page-app). Creme fica só em superfícies de destaque. */
    background: Palette.neutral50,
    /** Preenchimento sutil / trilhas de controle. */
    surface: Palette.neutral100,
    card: Palette.neutral0,
    /** Superfícies de destaque quentes. */
    cream: Palette.cream50,
    creamStrong: Palette.cream100,
    /** Verde bem claro — chip selecionado, ícones sobre tint. */
    primarySoft: Palette.green100,
    border: Palette.neutral200,
    divider: Palette.neutral100,

    text: Palette.neutral900,
    textSecondary: Palette.neutral500,
    textTertiary: Palette.neutral400,

    primary: Palette.green900,
    primaryForeground: '#FFFFFF',
    /** Superfície verde sólida do card herói — sempre escura o bastante para texto branco. */
    brandSurface: Palette.green900,

    income: Palette.green600,
    incomeSoft: 'rgba(31,163,74,0.12)',
    /** Despesa: texto NEUTRO escuro, nunca vermelho. */
    expense: Palette.neutral900,
    expenseSoft: 'rgba(22,32,27,0.06)',
    /** "Sobrou" / economia. */
    saved: Palette.green600,
    savedSoft: 'rgba(31,163,74,0.12)',
    transfer: Palette.info500,
    transferSoft: 'rgba(44,123,229,0.10)',

    destructive: Palette.error500,
    destructiveSoft: 'rgba(217,59,48,0.10)',
    destructiveForeground: '#FFFFFF',
    warning: Palette.yellow500,
    warningForeground: Palette.neutral900,
    /** Alerta financeiro real (ex.: saldo negativo). */
    moneyAlert: Palette.error500,
  },
  dark: {
    background: Palette.neutral900,
    surface: '#1C2620',
    card: Palette.neutral800,
    cream: '#2A2A20',
    creamStrong: '#33301F',
    primarySoft: 'rgba(31,163,74,0.18)',
    border: 'rgba(255,255,255,0.10)',
    divider: 'rgba(255,255,255,0.08)',

    text: Palette.neutral50,
    textSecondary: Palette.neutral400,
    textTertiary: Palette.neutral500,

    primary: Palette.green600,
    primaryForeground: '#FFFFFF',
    brandSurface: '#0B4A26',

    income: Palette.green500,
    incomeSoft: 'rgba(53,180,94,0.16)',
    expense: Palette.neutral50,
    expenseSoft: 'rgba(255,255,255,0.06)',
    saved: Palette.green500,
    savedSoft: 'rgba(53,180,94,0.16)',
    transfer: '#4C93EF',
    transferSoft: 'rgba(76,147,239,0.16)',

    destructive: '#E5493E',
    destructiveSoft: 'rgba(229,73,62,0.16)',
    destructiveForeground: '#FFFFFF',
    warning: Palette.yellow500,
    warningForeground: Palette.neutral900,
    moneyAlert: '#E5493E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Cores de gráfico — brand-led, no máximo seis (§18). */
export const ChartColors = ['#0D5B2E', '#1FA34A', '#2C7BE5', '#FFC107', '#D93B30', '#C2CCC7'];

/**
 * Paleta estável para categorias livres (definidas pelo usuário). Derivada das tintas de
 * categoria do Poupeu — cada par é `[fg, bg]`. O índice vem de um hash do id da categoria
 * (ver `src/lib/categoria-visual.ts`), garantindo cor consistente em todos os lugares.
 */
export const CategoryPalette: readonly (readonly [string, string])[] = [
  ['#C2681E', '#FBEEE2'], // alimentação
  ['#17853F', '#E4F6EA'], // casa
  ['#2C7BE5', '#E8F1FD'], // transporte
  ['#8A5CC7', '#F1EAFB'], // compras
  ['#D2517E', '#FBE9F0'], // lazer
  ['#1FA39A', '#E2F5F3'], // saúde
  ['#3A63C4', '#EAEFFB'], // educação
  ['#5C6B77', '#EDF1F4'], // assinaturas
  ['#B98600', '#FFF7E0'], // viagem
  ['#77887F', '#EDF1EF'], // outros / neutro
];

/** Par fg/bg neutro para categoria ausente. */
export const CategoryNeutral: readonly [string, string] = ['#77887F', '#EDF1EF'];

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

/**
 * Escala de 8px (§spacing). Os nomes históricos (`half`..`six`) são mantidos para não
 * churnar 30+ arquivos; `page` (20) e `gap` (20) vêm do layout mobile do mock.
 */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  fiveAndHalf: 48,
  six: 64,
  /** Padding lateral de página no mobile. */
  page: 20,
  /** Gap padrão entre blocos numa tela. */
  gap: 20,
} as const;

/** Raios por papel (§radius). */
export const Radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  input: 12,
  button: 14,
  card: 16,
  cardFeature: 20,
  sheet: 24,
  pill: 999,
} as const;

/**
 * Três níveis de sombra, todos com tinta verde e opacidade baixíssima (§shadows).
 * A hierarquia vem da cor e do tamanho, não do peso. Card = `sm` + borda 1px.
 */
const shadowSm = {
  shadowColor: '#0D5B2E',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
} as const;

const shadowMd = {
  shadowColor: '#0D5B2E',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

const shadowLg = {
  shadowColor: '#0D5B2E',
  shadowOpacity: 0.1,
  shadowRadius: 32,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
} as const;

export const Shadow = {
  sm: shadowSm,
  md: shadowMd,
  lg: shadowLg,
  /** Alias histórico — cartão padrão (= `sm`). */
  card: shadowSm,
  /** Alias histórico — elemento levantado, FAB / card hero (= `md`). */
  lift: shadowMd,
} as const;

/** Movimento (§motion). Durações em ms; `easing` é o cubic-bezier padrão. */
export const Motion = {
  fast: 150,
  base: 200,
  slow: 300,
  easing: [0.2, 0.8, 0.2, 1] as const,
};

/** Fundo do overlay de modal / bottom sheet (§base — `--overlay`). */
export const Overlay = 'rgba(22,32,27,0.40)';

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
