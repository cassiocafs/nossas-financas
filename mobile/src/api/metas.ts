import { apiFetch } from './client';

export type EstadoMeta = 'sem_aporte' | 'em_andamento' | 'quase_la' | 'concluida' | 'atrasada';

export interface Meta {
  id: string;
  nome: string;
  emoji: string | null;
  valorAlvo: number;
  valorAtual: number;
  dataAlvo: string | null;
  progresso: number;
  faltam: number;
  estado: EstadoMeta;
  concluidaEm: string | null;
  arquivada: boolean;
  aporteMensalSugerido: number | null;
  ultimoAporteEm: string | null;
}

export interface Aporte {
  id: string;
  valor: number;
  data: string;
  nota: string | null;
  criadoEm: string;
}

export interface CriarMetaInput {
  nome: string;
  emoji?: string;
  valorAlvo: number;
  dataAlvo?: string;
}

export type EditarMetaInput = Partial<CriarMetaInput> & { arquivada?: boolean };

export interface RegistrarAporteInput {
  valor: number;
  data?: string;
  nota?: string;
}

export function listarMetas(incluirArquivadas = false): Promise<Meta[]> {
  return apiFetch<Meta[]>(`/api/metas?incluirArquivadas=${incluirArquivadas}`);
}

export function buscarMeta(id: string): Promise<Meta & { aportes: Aporte[] }> {
  return apiFetch<Meta & { aportes: Aporte[] }>(`/api/metas/${id}`);
}

export function criarMeta(input: CriarMetaInput): Promise<Meta> {
  return apiFetch<Meta>('/api/metas', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function editarMeta(id: string, input: EditarMetaInput): Promise<Meta> {
  return apiFetch<Meta>(`/api/metas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function excluirMeta(id: string, confirmar = false): Promise<void> {
  return apiFetch<void>(`/api/metas/${id}?confirmar=${confirmar}`, {
    method: 'DELETE',
  });
}

export function registrarAporte(
  id: string,
  input: RegistrarAporteInput,
): Promise<{ meta: Meta; aporte: Aporte }> {
  return apiFetch<{ meta: Meta; aporte: Aporte }>(`/api/metas/${id}/aportes`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function removerAporte(id: string, aporteId: string): Promise<{ meta: Meta }> {
  return apiFetch<{ meta: Meta }>(`/api/metas/${id}/aportes/${aporteId}`, {
    method: 'DELETE',
  });
}
