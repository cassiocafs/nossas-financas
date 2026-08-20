import { useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' | 'unspecified' {
  return useRNColorScheme() ?? 'unspecified';
}
