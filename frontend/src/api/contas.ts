import { apiFetch } from "./client";

export interface Conta {
  id: string;
  nome: string;
  saldoInicial: number;
  ativa: boolean;
  saldoAtual: number;
}

export interface CriarContaInput {
  nome: string;
  saldoInicial: number;
  ativa: boolean;
}

export type EditarContaInput = Partial<CriarContaInput>;

export interface ImpactoExclusaoConta {
  transacoesVinculadas: number;
}

export interface ExcluirContaInput {
  estrategia?: "excluirTransacoes" | "realocar";
  contaDestinoId?: string;
}

export function listarContas(incluirInativas = true): Promise<Conta[]> {
  return apiFetch<Conta[]>(`/api/contas?incluirInativas=${incluirInativas}`);
}

export function criarConta(input: CriarContaInput): Promise<Conta> {
  return apiFetch<Conta>("/api/contas", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function editarConta(id: string, input: EditarContaInput): Promise<Conta> {
  return apiFetch<Conta>(`/api/contas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function buscarImpactoExclusaoConta(id: string): Promise<ImpactoExclusaoConta> {
  return apiFetch<ImpactoExclusaoConta>(`/api/contas/${id}/impacto-exclusao`);
}

export function excluirConta(id: string, input?: ExcluirContaInput): Promise<void> {
  return apiFetch<void>(`/api/contas/${id}`, {
    method: "DELETE",
    body: JSON.stringify(input ?? {}),
  });
}
