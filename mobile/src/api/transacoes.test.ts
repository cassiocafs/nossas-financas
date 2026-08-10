jest.mock('./client', () => ({
  apiFetch: jest.fn(),
}));

import { apiFetch } from './client';
import {
  categorizarLote,
  consolidarLote,
  criarTransacao,
  editarTransacao,
  excluirTransacao,
  excluirTransacoesLote,
  listarTransacoesMes,
} from './transacoes';

const mockApiFetch = apiFetch as jest.Mock;

describe('api/transacoes', () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    mockApiFetch.mockResolvedValue(undefined);
  });

  it('monta a query string de listarTransacoesMes só com os filtros informados', async () => {
    await listarTransacoesMes({ ano: 2026, mes: 8 });
    expect(mockApiFetch).toHaveBeenCalledWith('/api/transacoes?ano=2026&mes=8');

    mockApiFetch.mockClear();
    await listarTransacoesMes({
      ano: 2026,
      mes: 8,
      contaIds: ['c1', 'c2'],
      categoriaIds: ['cat1'],
      status: 'pendentes',
      texto: 'mercado',
    });
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/api/transacoes?ano=2026&mes=8&contaIds=c1%2Cc2&categoriaIds=cat1&status=pendentes&texto=mercado',
    );
  });

  it('criarTransacao faz POST em /api/transacoes com o payload serializado', async () => {
    const input = {
      tipo: 'DESPESA' as const,
      data: '2026-08-06',
      descricao: 'Mercado',
      contaId: 'c1',
      valor: 100,
      consolidado: true,
    };
    await criarTransacao(input);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/transacoes', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  });

  it('editarTransacao faz PATCH em /api/transacoes/:id', async () => {
    await editarTransacao('t1', { consolidado: false });
    expect(mockApiFetch).toHaveBeenCalledWith('/api/transacoes/t1', {
      method: 'PATCH',
      body: JSON.stringify({ consolidado: false }),
    });
  });

  it('excluirTransacao faz DELETE em /api/transacoes/:id', async () => {
    await excluirTransacao('t1');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/transacoes/t1', { method: 'DELETE' });
  });

  it('excluirTransacoesLote faz POST em /api/transacoes/excluir-lote com os ids', async () => {
    await excluirTransacoesLote(['t1', 't2']);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/transacoes/excluir-lote', {
      method: 'POST',
      body: JSON.stringify({ ids: ['t1', 't2'] }),
    });
  });

  it('consolidarLote faz POST em /api/transacoes/consolidar-lote com ids e flag', async () => {
    await consolidarLote(['t1'], true);
    expect(mockApiFetch).toHaveBeenCalledWith('/api/transacoes/consolidar-lote', {
      method: 'POST',
      body: JSON.stringify({ ids: ['t1'], consolidado: true }),
    });
  });

  it('categorizarLote faz POST em /api/transacoes/categorizar-lote com ids e categoria', async () => {
    await categorizarLote(['t1'], 'cat1');
    expect(mockApiFetch).toHaveBeenCalledWith('/api/transacoes/categorizar-lote', {
      method: 'POST',
      body: JSON.stringify({ ids: ['t1'], categoriaId: 'cat1' }),
    });
  });
});
