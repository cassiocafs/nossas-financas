jest.mock('./client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from './client';
import { criarRegra, editarRegra, excluirRegra, listarRegras, sugerirTransacao } from './regras';

const mockApiFetch = apiFetch as jest.Mock;

describe('api/regras', () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    mockApiFetch.mockResolvedValue(undefined);
  });

  it('listarRegras faz GET em /api/regras', async () => {
    await listarRegras();
    expect(mockApiFetch).toHaveBeenCalledWith('/api/regras');
  });

  it('criarRegra faz POST em /api/regras com o payload serializado', async () => {
    const input = { descricao: 'Uber', contaId: 'c1', categoriaId: 'cat1' };
    await criarRegra(input);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/regras', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  });

  it('editarRegra faz PATCH em /api/regras/:id', async () => {
    await editarRegra('r1', { contaId: 'c2' });
    expect(mockApiFetch).toHaveBeenCalledWith('/api/regras/r1', {
      method: 'PATCH',
      body: JSON.stringify({ contaId: 'c2' }),
    });
  });

  it('excluirRegra faz DELETE em /api/regras/:id', async () => {
    await excluirRegra('r1');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/regras/r1', { method: 'DELETE' });
  });

  it('sugerirTransacao faz GET em /api/regras/sugestao com a descrição codificada', async () => {
    await sugerirTransacao('Uber Eats');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/regras/sugestao?descricao=Uber%20Eats');
  });
});
