import { apiFetch } from './client';

export interface Conta {
  id: string;
  nome: string;
  saldoInicial: number;
  ativa: boolean;
  saldoAtual: number;
}

export function listarContas(incluirInativas = true): Promise<Conta[]> {
  return apiFetch<Conta[]>(`/api/contas?incluirInativas=${incluirInativas}`);
}
