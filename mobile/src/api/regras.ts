import { apiFetch } from './client';

export interface RegraTransacao {
  id: string;
  descricao: string;
  contaId: string;
  conta: { id: string; nome: string };
  categoriaId: string | null;
  categoria: { id: string; nome: string } | null;
}

export interface SugestaoTransacao {
  contaId: string | null;
  categoriaId: string | null;
}

export function listarRegras(): Promise<RegraTransacao[]> {
  return apiFetch<RegraTransacao[]>('/api/regras');
}

export function criarRegra(input: { descricao: string; contaId: string; categoriaId?: string | null }) {
  return apiFetch<RegraTransacao>('/api/regras', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function editarRegra(
  id: string,
  input: { descricao?: string; contaId?: string; categoriaId?: string | null },
) {
  return apiFetch<RegraTransacao>(`/api/regras/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function excluirRegra(id: string): Promise<void> {
  return apiFetch<void>(`/api/regras/${id}`, { method: 'DELETE' });
}

export function sugerirTransacao(descricao: string): Promise<SugestaoTransacao> {
  return apiFetch<SugestaoTransacao>(`/api/regras/sugestao?descricao=${encodeURIComponent(descricao)}`);
}
