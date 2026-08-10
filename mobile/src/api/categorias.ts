import { apiFetch } from './client';

export type TipoCategoria = 'DESPESA' | 'RECEITA' | 'AMBOS';

export interface RegraCategorizacao {
  id: string;
  palavraChave: string;
}

export interface Categoria {
  id: string;
  nome: string;
  grupoId: string | null;
  subgrupoId: string | null;
  tipo: TipoCategoria;
  ativa: boolean;
  regras: RegraCategorizacao[];
}

export interface SubgrupoCategoria {
  id: string;
  nome: string;
  ordem: number;
  categorias: Categoria[];
}

export interface GrupoCategoria {
  id: string;
  nome: string;
  ordem: number;
  subgrupos: SubgrupoCategoria[];
  categorias: Categoria[];
}

export interface GruposResponse {
  grupos: GrupoCategoria[];
  semGrupo: Categoria[];
}

export function listarGrupos(): Promise<GruposResponse> {
  return apiFetch<GruposResponse>('/api/categorias/grupos');
}
