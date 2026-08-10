import { render, screen } from '@testing-library/react-native';

import { Colors } from '@/constants/theme';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from './themed-text';

const mockUseColorScheme = useColorScheme as jest.Mock;

describe('ThemedText', () => {
  it('renderiza o texto informado', async () => {
    mockUseColorScheme.mockReturnValue('light');

    await render(<ThemedText>Olá mundo</ThemedText>);

    expect(screen.getByText('Olá mundo')).toBeTruthy();
  });

  it('aplica a cor de texto do tema light por padrão', async () => {
    mockUseColorScheme.mockReturnValue('light');

    await render(<ThemedText>Texto claro</ThemedText>);

    const node = screen.getByText('Texto claro');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: Colors.light.text })]),
    );
  });

  it('aplica a cor de texto do tema dark quando o esquema é dark', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    await render(<ThemedText>Texto escuro</ThemedText>);

    const node = screen.getByText('Texto escuro');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: Colors.dark.text })]),
    );
  });

  it('usa a cor informada via themeColor', async () => {
    mockUseColorScheme.mockReturnValue('light');

    await render(<ThemedText themeColor="textSecondary">Texto secundário</ThemedText>);

    const node = screen.getByText('Texto secundário');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: Colors.light.textSecondary })]),
    );
  });
});
