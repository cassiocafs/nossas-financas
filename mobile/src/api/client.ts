import { addLog } from '@/lib/logStore';
import { supabase } from '@/lib/supabaseClient';

export const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Sem conexão com a internet. Verifique sua rede e tente novamente.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const url = `${baseUrl}${path}`;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    addLog('error', `${method} ${path} — falha de rede`, {
      url,
      hasSession: !!session,
      error: err instanceof Error ? err.message : String(err),
    });
    throw new NetworkError();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    addLog('error', `${method} ${path} — HTTP ${res.status}`, { url, body });
    throw new ApiError(res.status, body.error ?? res.statusText);
  }

  addLog('info', `${method} ${path} — HTTP ${res.status}`, { url });

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
