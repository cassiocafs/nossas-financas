import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Evita mismatch de hidratação no web: no primeiro render (SSR/estático) o
 * tema real ainda não é conhecido, então retornamos 'unspecified' até o
 * componente montar no cliente.
 */
export function useColorScheme(): 'light' | 'dark' | 'unspecified' {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme ?? 'unspecified';
  }

  return 'unspecified';
}
