import { apiFetch } from "./client";

export type TipoCategoria = "DESPESA" | "RECEITA" | "AMBOS";

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

export interface CriarCategoriaInput {
  nome: string;
  grupoId: string | null;
  subgrupoId?: string | null;
  tipo: TipoCategoria;
}

export type EditarCategoriaInput = Partial<CriarCategoriaInput> & { ativa?: boolean };

export interface CriarSubgrupoInput {
  nome: string;
  grupoId: string;
}

export type EditarSubgrupoInput = { nome?: string; ordem?: number };

export interface ImpactoExclusaoCategoria {
  transacoesVinculadas: number;
  orcamentoItensVinculados: number;
}

export interface ExcluirCategoriaInput {
  estrategia?: "semCategoria" | "realocarPara";
  categoriaDestinoId?: string;
}

export interface Sugestao {
  categoriaId: string | null;
  palavraChave: string | null;
}

export function listarGrupos(): Promise<GruposResponse> {
  return apiFetch<GruposResponse>("/api/categorias/grupos");
}

export function criarGrupo(nome: string) {
  return apiFetch<GrupoCategoria>("/api/categorias/grupos", {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}

export function editarGrupo(id: string, input: { nome?: string; ordem?: number }) {
  return apiFetch<GrupoCategoria>(`/api/categorias/grupos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function excluirGrupo(id: string) {
  return apiFetch<void>(`/api/categorias/grupos/${id}`, { method: "DELETE" });
}

export function criarSubgrupo(input: CriarSubgrupoInput) {
  return apiFetch<SubgrupoCategoria>("/api/categorias/subgrupos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function editarSubgrupo(id: string, input: EditarSubgrupoInput) {
  return apiFetch<SubgrupoCategoria>(`/api/categorias/subgrupos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function excluirSubgrupo(id: string) {
  return apiFetch<void>(`/api/categorias/subgrupos/${id}`, { method: "DELETE" });
}

export function criarCategoria(input: CriarCategoriaInput) {
  return apiFetch<Categoria>("/api/categorias", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function editarCategoria(id: string, input: EditarCategoriaInput) {
  return apiFetch<Categoria>(`/api/categorias/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function buscarImpactoExclusaoCategoria(id: string) {
  return apiFetch<ImpactoExclusaoCategoria>(`/api/categorias/${id}/impacto-exclusao`);
}

export function excluirCategoria(id: string, input?: ExcluirCategoriaInput) {
  return apiFetch<void>(`/api/categorias/${id}`, {
    method: "DELETE",
    body: JSON.stringify(input ?? {}),
  });
}

export function criarRegra(categoriaId: string, palavraChave: string) {
  return apiFetch<RegraCategorizacao>(`/api/categorias/${categoriaId}/regras`, {
    method: "POST",
    body: JSON.stringify({ palavraChave }),
  });
}

export function removerRegra(categoriaId: string, regraId: string) {
  return apiFetch<void>(`/api/categorias/${categoriaId}/regras/${regraId}`, {
    method: "DELETE",
  });
}

export function sugerirCategoria(descricao: string) {
  return apiFetch<Sugestao>(`/api/categorias/sugestao?descricao=${encodeURIComponent(descricao)}`);
}
