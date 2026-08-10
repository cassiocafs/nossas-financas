import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Colors } from '@/constants/theme';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedView } from './themed-view';

const mockUseColorScheme = useColorScheme as jest.Mock;

describe('ThemedView', () => {
  it('renderiza seus filhos', async () => {
    mockUseColorScheme.mockReturnValue('light');

    await render(
      <ThemedView>
        <Text>Conteúdo</Text>
      </ThemedView>,
    );

    expect(screen.getByText('Conteúdo')).toBeTruthy();
  });

  it('não define cor de fundo quando nenhum type é informado', async () => {
    mockUseColorScheme.mockReturnValue('light');

    await render(
      <ThemedView testID="view">
        <Text>Conteúdo</Text>
      </ThemedView>,
    );

    const node = screen.getByTestId('view');
    const flat = [node.props.style].flat().filter(Boolean);
    expect(flat.every((s) => !('backgroundColor' in s))).toBe(true);
  });

  it('aplica a cor de fundo do tema light quando type="background"', async () => {
    mockUseColorScheme.mockReturnValue('light');

    await render(
      <ThemedView testID="view" type="background">
        <Text>Conteúdo</Text>
      </ThemedView>,
    );

    const node = screen.getByTestId('view');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: Colors.light.background })]),
    );
  });

  it('aplica a cor de fundo do tema dark quando type="background"', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    await render(
      <ThemedView testID="view" type="background">
        <Text>Conteúdo</Text>
      </ThemedView>,
    );

    const node = screen.getByTestId('view');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: Colors.dark.background })]),
    );
  });

  it('usa a cor informada via type', async () => {
    mockUseColorScheme.mockReturnValue('light');

    await render(
      <ThemedView testID="view" type="surface">
        <Text>Conteúdo</Text>
      </ThemedView>,
    );

    const node = screen.getByTestId('view');
    expect(node.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: Colors.light.surface })]),
    );
  });
});
