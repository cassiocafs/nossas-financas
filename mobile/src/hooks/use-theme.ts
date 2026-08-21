/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const { colorSchemeOverride } = usePreferences();
  const resolvido = colorSchemeOverride === 'system' ? scheme : colorSchemeOverride;
  const theme = resolvido === 'unspecified' ? 'light' : resolvido;

  return Colors[theme];
}
