/** O app sempre roda no tema light, independentemente do tema do aparelho. */
export function useColorScheme(): 'light' | 'dark' | 'unspecified' {
  return 'light';
}
