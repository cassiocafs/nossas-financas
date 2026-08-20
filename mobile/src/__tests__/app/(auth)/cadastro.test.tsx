import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

const mockSignUp = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signUp: mockSignUp }),
}));

import CadastroScreen from '@/app/(auth)/cadastro';

describe('CadastroScreen', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
    mockSignUp.mockResolvedValue(undefined);
  });

  it('mantém o botão "Criar conta" desabilitado até que todos os campos sejam preenchidos', async () => {
    await render(<CadastroScreen />);

    const botao = screen.getByRole('button', { name: 'Criar conta' });
    expect(botao.props.accessibilityState?.disabled).toBe(true);
  });

  it('habilita o botão "Criar conta" e chama signUp ao preencher todos os campos corretamente', async () => {
    await render(<CadastroScreen />);

    const [nomeInput, emailInput, senhaInput, confirmarSenhaInput] = screen.getAllByDisplayValue('');
    await fireEvent.changeText(nomeInput, 'Maria Silva');
    await fireEvent.changeText(emailInput, 'user@example.com');
    await fireEvent.changeText(senhaInput, 'senha123');
    await fireEvent.changeText(confirmarSenhaInput, 'senha123');

    const botao = screen.getByRole('button', { name: 'Criar conta' });
    expect(botao.props.accessibilityState?.disabled).toBe(false);

    await fireEvent.press(botao);

    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith('Maria Silva', 'user@example.com', 'senha123'),
    );
  });

  it('exibe erro e não chama signUp quando as senhas não coincidem', async () => {
    await render(<CadastroScreen />);

    const [nomeInput, emailInput, senhaInput, confirmarSenhaInput] = screen.getAllByDisplayValue('');
    await fireEvent.changeText(nomeInput, 'Maria Silva');
    await fireEvent.changeText(emailInput, 'user@example.com');
    await fireEvent.changeText(senhaInput, 'senha123');
    await fireEvent.changeText(confirmarSenhaInput, 'senha456');

    const botao = screen.getByRole('button', { name: 'Criar conta' });
    await fireEvent.press(botao);

    await waitFor(() => expect(screen.getByText('As senhas não coincidem')).toBeTruthy());
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
