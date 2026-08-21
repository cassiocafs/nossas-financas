jest.mock('./client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from './client';
import { listarContas } from './contas';

const mockApiFetch = apiFetch as jest.Mock;

describe('api/contas', () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    mockApiFetch.mockResolvedValue([]);
  });

  it('inclui contas inativas por padrão', async () => {
    await listarContas();
    expect(mockApiFetch).toHaveBeenCalledWith('/api/contas?incluirInativas=true');
  });

  it('permite excluir contas inativas', async () => {
    await listarContas(false);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/contas?incluirInativas=false');
  });

  it('retorna as contas em ordem alfabética', async () => {
    mockApiFetch.mockResolvedValue([
      { id: '1', nome: 'Nubank', saldoInicial: 0, ativa: true, saldoAtual: 0 },
      { id: '2', nome: 'itaú', saldoInicial: 0, ativa: true, saldoAtual: 0 },
      { id: '3', nome: 'Ágil', saldoInicial: 0, ativa: true, saldoAtual: 0 },
    ]);

    const contas = await listarContas();

    expect(contas.map((c) => c.nome)).toEqual(['Ágil', 'itaú', 'Nubank']);
  });
});
