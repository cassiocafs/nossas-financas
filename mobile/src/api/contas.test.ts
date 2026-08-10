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
});
