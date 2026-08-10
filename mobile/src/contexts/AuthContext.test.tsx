import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

jest.mock('@/api/client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from '@/api/client';
import { supabase } from '@/lib/supabaseClient';
import { AuthProvider, useAuth } from './AuthContext';

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;
const mockApiFetch = apiFetch as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

/** Configura os mocks do Supabase para um dado estado inicial de sessão. */
function setupAuthMocks(initialSession: unknown = null) {
  mockGetSession.mockResolvedValue({ data: { session: initialSession } });
  const unsubscribe = jest.fn();
  let authChangeCallback: (event: string, session: unknown) => void = () => {};
  mockOnAuthStateChange.mockImplementation((cb: typeof authChangeCallback) => {
    authChangeCallback = cb;
    return { data: { subscription: { unsubscribe } } };
  });
  return {
    unsubscribe,
    triggerAuthChange: (session: unknown) =>
      act(async () => authChangeCallback('SIGNED_IN', session)),
  };
}

describe('useAuth', () => {
  it('lança erro quando usado fora do AuthProvider', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(renderHook(() => useAuth())).rejects.toThrow(
      'useAuth deve ser usado dentro de AuthProvider',
    );

    consoleError.mockRestore();
  });
});

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockResolvedValue(undefined);
  });

  it('signIn chama supabase.auth.signInWithPassword com email e senha', async () => {
    setupAuthMocks(null);
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signIn('user@example.com', 'senha123');
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'senha123',
    });
  });

  it('signIn propaga o erro retornado pelo Supabase', async () => {
    setupAuthMocks(null);
    const error = new Error('Credenciais inválidas');
    mockSignInWithPassword.mockResolvedValue({ error });

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.signIn('user@example.com', 'senha123')).rejects.toBe(error);
  });

  it('signOut chama supabase.auth.signOut', async () => {
    setupAuthMocks(null);
    mockSignOut.mockResolvedValue({ error: null });

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('sincroniza com o backend via apiFetch quando a sessão muda', async () => {
    const { triggerAuthChange } = setupAuthMocks(null);

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockApiFetch).not.toHaveBeenCalled();

    await triggerAuthChange({ access_token: 'tok', user: { id: '1' } });

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/sync', { method: 'POST' }),
    );
  });

  it('sincroniza com o backend quando já existe sessão ao montar', async () => {
    setupAuthMocks({ access_token: 'tok-inicial', user: { id: '1' } });

    await renderHook(() => useAuth(), { wrapper });

    await waitFor(() =>
      expect(mockApiFetch).toHaveBeenCalledWith('/api/auth/sync', { method: 'POST' }),
    );
  });
});
