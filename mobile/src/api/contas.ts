import { apiFetch } from './client';

export interface Conta {
  id: string;
  nome: string;
  saldoInicial: number;
  ativa: boolean;
  saldoAtual: number;
}

export async function listarContas(incluirInativas = true): Promise<Conta[]> {
  const contas = await apiFetch<Conta[]>(`/api/contas?incluirInativas=${incluirInativas}`);
  return [...contas].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
