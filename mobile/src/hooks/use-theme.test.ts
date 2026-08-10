import { renderHook } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from './use-theme';

const mockUseColorScheme = useColorScheme as jest.Mock;

describe('useTheme', () => {
  it('retorna as cores do tema light quando o esquema é "light"', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const { result } = await renderHook(() => useTheme());

    expect(result.current).toEqual(Colors.light);
  });

  it('retorna as cores do tema dark quando o esquema é "dark"', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { result } = await renderHook(() => useTheme());

    expect(result.current).toEqual(Colors.dark);
  });

  it('usa o tema light como fallback quando o esquema é "unspecified"', async () => {
    mockUseColorScheme.mockReturnValue('unspecified');

    const { result } = await renderHook(() => useTheme());

    expect(result.current).toEqual(Colors.light);
  });
});
