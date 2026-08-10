// Convenção de testes deste projeto: arquivos `*.test.ts(x)` ao lado do código-fonte
// (padrão usual em projetos Expo/RN com jest-expo), em vez de uma pasta `tests/` separada.

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

import { supabase } from '@/lib/supabaseClient';
import { apiFetch, ApiError, baseUrl } from './client';

const mockGetSession = supabase.auth.getSession as jest.Mock;

function mockFetchResponse(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  (globalThis.fetch as jest.Mock).mockResolvedValue(response);
}

describe('apiFetch', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    globalThis.fetch = jest.fn();
  });

  it('retorna o JSON parseado em uma resposta de sucesso', async () => {
    mockFetchResponse({ ok: true, status: 200, json: async () => ({ foo: 'bar' }) });

    const result = await apiFetch<{ foo: string }>('/api/foo');

    expect(result).toEqual({ foo: 'bar' });
    expect(globalThis.fetch).toHaveBeenCalledWith(`${baseUrl}/api/foo`, expect.any(Object));
  });

  it('lança ApiError com status e mensagem extraídos do corpo JSON de erro', async () => {
    mockFetchResponse({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: 'Dados inválidos' }),
    });

    await expect(apiFetch('/api/foo')).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch('/api/foo')).rejects.toMatchObject({
      status: 400,
      message: 'Dados inválidos',
    });
  });

  it('usa o statusText quando o corpo de erro não pode ser parseado como JSON', async () => {
    mockFetchResponse({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('corpo vazio');
      },
    });

    await expect(apiFetch('/api/foo')).rejects.toMatchObject({
      status: 500,
      message: 'Internal Server Error',
    });
  });

  it('retorna undefined para resposta 204', async () => {
    const json = jest.fn();
    mockFetchResponse({ ok: true, status: 204, json });

    const result = await apiFetch('/api/foo');

    expect(result).toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it('envia o header Authorization quando há sessão Supabase', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { access_token: 'tok-123' } } });
    mockFetchResponse({ ok: true, status: 200, json: async () => ({}) });

    await apiFetch('/api/foo');

    const [, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const headers = options.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer tok-123');
  });

  it('não envia o header Authorization quando não há sessão', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockFetchResponse({ ok: true, status: 200, json: async () => ({}) });

    await apiFetch('/api/foo');

    const [, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const headers = options.headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });
});
