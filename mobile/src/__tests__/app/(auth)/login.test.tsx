import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

const mockSignIn = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}));

import LoginScreen from '@/app/(auth)/login';

describe('LoginScreen', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignIn.mockResolvedValue(undefined);
  });

  it('mantém o botão "Entrar" desabilitado até que e-mail e senha sejam preenchidos', async () => {
    await render(<LoginScreen />);

    const botao = screen.getByText('Entrar');
    expect(botao.parent?.props.accessibilityState?.disabled).toBe(true);
  });

  it('habilita o botão "Entrar" e chama signIn ao preencher e-mail e senha', async () => {
    await render(<LoginScreen />);

    const [emailInput, senhaInput] = screen.getAllByDisplayValue('');
    await fireEvent.changeText(emailInput, 'user@example.com');
    await fireEvent.changeText(senhaInput, 'senha123');

    const botao = screen.getByText('Entrar');
    expect(botao.parent?.props.accessibilityState?.disabled).toBe(false);

    await fireEvent.press(botao);

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'senha123'));
  });
});
