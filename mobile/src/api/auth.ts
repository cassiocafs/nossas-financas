import { apiFetch } from './client';

export async function excluirContaUsuario(): Promise<void> {
  await apiFetch<void>('/api/auth/me', { method: 'DELETE' });
}
