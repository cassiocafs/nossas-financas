jest.mock('./client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from './client';
import { listarGrupos } from './categorias';

const mockApiFetch = apiFetch as jest.Mock;

describe('api/categorias', () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    mockApiFetch.mockResolvedValue({ grupos: [], semGrupo: [] });
  });

  it('listarGrupos faz GET em /api/categorias/grupos', async () => {
    await listarGrupos();
    expect(mockApiFetch).toHaveBeenCalledWith('/api/categorias/grupos');
  });
});
