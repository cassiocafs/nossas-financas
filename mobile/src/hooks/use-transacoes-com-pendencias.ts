import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { listarGrupos, type GruposResponse } from '@/api/categorias';
import type { Conta } from '@/api/contas';
import type {
  DiaTransacoes,
  EditarTransacaoInput,
  FiltrosTransacoes,
  ListagemMensal,
  Transacao,
  TipoTransacao,
} from '@/api/transacoes';
import { useSyncQueue } from '@/hooks/use-sync-queue';
import type { OperacaoCriarTransacao, OperacaoCriarTransferencia, OperacaoPendente } from '@/lib/syncQueue';

export type PendenciaSync = 'criar' | 'editar' | 'excluir';

export interface TransacaoComPendencia extends Transacao {
  pendenteSync?: PendenciaSync;
}

export interface DiaComPendencias extends Omit<DiaTransacoes, 'transacoes'> {
  transacoes: TransacaoComPendencia[];
}

export interface ListagemComPendencias extends Omit<ListagemMensal, 'dias'> {
  dias: DiaComPendencias[];
}

function valorComSinal(tipo: 'DESPESA' | 'RECEITA', valor: number): number {
  return tipo === 'DESPESA' ? -Math.abs(valor) : Math.abs(valor);
}

interface ItemFiltravel {
  data: string;
  contaId: string;
  categoriaId: string | null;
  consolidado: boolean;
}

function passaFiltro(item: ItemFiltravel, filtros: FiltrosTransacoes): boolean {
  const [anoItem, mesItem] = item.data.split('-').map(Number);
  if (anoItem !== filtros.ano || mesItem !== filtros.mes) return false;
  if (filtros.contaIds?.length && !filtros.contaIds.includes(item.contaId)) return false;
  if (filtros.categoriaIds?.length && (!item.categoriaId || !filtros.categoriaIds.includes(item.categoriaId))) {
    return false;
  }
  if (filtros.status === 'consolidadas' && !item.consolidado) return false;
  if (filtros.status === 'pendentes' && item.consolidado) return false;
  if (filtros.dataInicio && item.data < filtros.dataInicio) return false;
  if (filtros.dataFim && item.data > filtros.dataFim) return false;
  return true;
}

function flatCategorias(data: GruposResponse | undefined): Map<string, string> {
  const mapa = new Map<string, string>();
  if (!data) return mapa;
  for (const grupo of data.grupos) {
    for (const subgrupo of grupo.subgrupos) {
      for (const c of subgrupo.categorias) mapa.set(c.id, c.nome);
    }
    for (const c of grupo.categorias) mapa.set(c.id, c.nome);
  }
  for (const c of data.semGrupo) mapa.set(c.id, c.nome);
  return mapa;
}

function encontrarTransacao(dados: ListagemMensal, id: string): Transacao | undefined {
  for (const dia of dados.dias) {
    const encontrada = dia.transacoes.find((t) => t.id === id);
    if (encontrada) return encontrada;
  }
  return undefined;
}

function sobrepor(
  t: Transacao,
  edicao: EditarTransacaoInput | undefined,
  excluida: boolean,
  contasPorId: Map<string, string>,
  categoriasPorId: Map<string, string>,
): TransacaoComPendencia {
  if (excluida) return { ...t, pendenteSync: 'excluir' };
  if (!edicao) return t;

  const tipo = (edicao.tipo ?? t.tipo) as 'DESPESA' | 'RECEITA';
  const valorAbs = edicao.valor ?? Math.abs(t.valor);
  const categoriaId = edicao.categoriaId !== undefined ? edicao.categoriaId : t.categoriaId;

  return {
    ...t,
    tipo,
    data: edicao.data ?? t.data,
    descricao: edicao.descricao ?? t.descricao,
    contaId: edicao.contaId ?? t.contaId,
    conta: edicao.contaId ? { id: edicao.contaId, nome: contasPorId.get(edicao.contaId) ?? t.conta.nome } : t.conta,
    categoriaId,
    categoria: edicao.categoriaId !== undefined
      ? categoriaId
        ? { id: categoriaId, nome: categoriasPorId.get(categoriaId) ?? t.categoria?.nome ?? 'Categoria' }
        : null
      : t.categoria,
    valor: valorComSinal(tipo, valorAbs),
    consolidado: edicao.consolidado ?? t.consolidado,
    nota: edicao.nota ?? t.nota,
    pendenteSync: 'editar',
  };
}

function transacaoSinteticaDeCriacao(
  op: OperacaoCriarTransacao,
  contasPorId: Map<string, string>,
  categoriasPorId: Map<string, string>,
): TransacaoComPendencia {
  const { payload } = op;
  const categoriaId = payload.categoriaId ?? null;
  return {
    id: op.id,
    tipo: payload.tipo,
    data: payload.data,
    descricao: payload.descricao,
    contaId: payload.contaId,
    conta: { id: payload.contaId, nome: contasPorId.get(payload.contaId) ?? 'Conta' },
    categoriaId,
    categoria: categoriaId ? { id: categoriaId, nome: categoriasPorId.get(categoriaId) ?? 'Categoria' } : null,
    valor: valorComSinal(payload.tipo, payload.valor),
    consolidado: payload.consolidado,
    nota: payload.nota ?? null,
    transferenciaGrupoId: null,
    pendenteSync: 'criar',
  };
}

function transacoesSinteticasDeTransferencia(
  op: OperacaoCriarTransferencia,
  contasPorId: Map<string, string>,
): [TransacaoComPendencia, TransacaoComPendencia] {
  const { payload, grupoId } = op;
  const descricao = payload.descricao?.trim() || 'Transferência entre contas';
  const base = {
    tipo: 'TRANSFERENCIA' as TipoTransacao,
    data: payload.data,
    descricao,
    categoriaId: null,
    categoria: null,
    consolidado: payload.consolidado,
    nota: payload.nota ?? null,
    transferenciaGrupoId: grupoId,
    pendenteSync: 'criar' as const,
  };
  return [
    {
      ...base,
      id: `${grupoId}#saida`,
      contaId: payload.contaOrigemId,
      conta: { id: payload.contaOrigemId, nome: contasPorId.get(payload.contaOrigemId) ?? 'Conta' },
      valor: -Math.abs(payload.valor),
    },
    {
      ...base,
      id: `${grupoId}#entrada`,
      contaId: payload.contaDestinoId,
      conta: { id: payload.contaDestinoId, nome: contasPorId.get(payload.contaDestinoId) ?? 'Conta' },
      valor: Math.abs(payload.valor),
    },
  ];
}

function empurrar<K, V>(mapa: Map<K, V[]>, chave: K, valor: V) {
  const lista = mapa.get(chave);
  if (lista) lista.push(valor);
  else mapa.set(chave, [valor]);
}

/**
 * Combina o resultado já carregado de `listarTransacoesMes` com a fila de
 * sincronização pendente (`syncQueue`), devolvendo uma listagem "estimada"
 * que já reflete criações/edições/exclusões feitas offline, antes mesmo de
 * chegarem ao servidor. Os totais (`saldoDia`/`saldoFinal`) recalculam de
 * forma cumulativa, igual ao backend; `totalEntradas`/`totalSaidas` só
 * incorporam pendências de criação (edições/exclusões pendentes são um caso
 * raro e não valem a complexidade extra de ajustar esses dois totais).
 */
export function useTransacoesComPendencias(
  dados: ListagemMensal | undefined,
  contas: Conta[],
  filtros: FiltrosTransacoes,
): ListagemComPendencias | undefined {
  const { fila } = useSyncQueue();
  const { data: categoriasData } = useQuery({ queryKey: ['categorias', 'grupos'], queryFn: listarGrupos });

  return useMemo(() => {
    if (!dados) return undefined;
    if (fila.length === 0) return dados as ListagemComPendencias;

    const contasPorId = new Map(contas.map((c) => [c.id, c.nome]));
    const categoriasPorId = flatCategorias(categoriasData);

    const edicoesPorId = new Map<string, EditarTransacaoInput>();
    const exclusoesIds = new Set<string>();
    const eventos: { data: string; valor: number }[] = [];
    let totalEntradasExtra = 0;
    let totalSaidasExtra = 0;
    const linhasSinteticasPorDia = new Map<string, TransacaoComPendencia[]>();

    for (const op of fila as OperacaoPendente[]) {
      if (op.tipo === 'criarTransacao') {
        const item: ItemFiltravel = {
          data: op.payload.data,
          contaId: op.payload.contaId,
          categoriaId: op.payload.categoriaId ?? null,
          consolidado: op.payload.consolidado,
        };
        if (!passaFiltro(item, filtros)) continue;
        const valor = valorComSinal(op.payload.tipo, op.payload.valor);
        eventos.push({ data: op.payload.data, valor });
        if (valor > 0) totalEntradasExtra += valor;
        else totalSaidasExtra += Math.abs(valor);
        empurrar(linhasSinteticasPorDia, op.payload.data, transacaoSinteticaDeCriacao(op, contasPorId, categoriasPorId));
      } else if (op.tipo === 'criarTransferencia') {
        const legs = [
          { contaId: op.payload.contaOrigemId, valor: -Math.abs(op.payload.valor) },
          { contaId: op.payload.contaDestinoId, valor: Math.abs(op.payload.valor) },
        ];
        const linhas = transacoesSinteticasDeTransferencia(op, contasPorId);
        legs.forEach((leg, i) => {
          const item: ItemFiltravel = {
            data: op.payload.data,
            contaId: leg.contaId,
            categoriaId: null,
            consolidado: op.payload.consolidado,
          };
          if (!passaFiltro(item, filtros)) return;
          eventos.push({ data: op.payload.data, valor: leg.valor });
          empurrar(linhasSinteticasPorDia, op.payload.data, linhas[i]);
        });
      } else if (op.tipo === 'editarTransacao') {
        edicoesPorId.set(op.id, op.payload);
        const original = encontrarTransacao(dados, op.id);
        if (!original) continue;
        const novoValor = valorComSinal((op.payload.tipo ?? original.tipo) as 'DESPESA' | 'RECEITA', op.payload.valor ?? Math.abs(original.valor));
        const delta = novoValor - original.valor;
        if (delta !== 0) eventos.push({ data: original.data, valor: delta });
      } else if (op.tipo === 'excluirTransacao') {
        exclusoesIds.add(op.id);
        const original = encontrarTransacao(dados, op.id);
        if (!original) continue;
        eventos.push({ data: original.data, valor: -original.valor });
      }
    }

    function eventosAte(dataAlvo: string): number {
      return eventos.filter((e) => e.data <= dataAlvo).reduce((soma, e) => soma + e.valor, 0);
    }

    function baselineAntes(dataAlvo: string): number {
      let baseline = dados!.saldoAnterior;
      for (const dia of dados!.dias) {
        if (dia.data < dataAlvo) baseline = dia.saldoDia;
        else break;
      }
      return baseline;
    }

    const diasBase: DiaComPendencias[] = dados.dias.map((dia) => ({
      data: dia.data,
      saldoDia: dia.saldoDia,
      transacoes: dia.transacoes.map((t) =>
        sobrepor(t, edicoesPorId.get(t.id), exclusoesIds.has(t.id), contasPorId, categoriasPorId),
      ),
    }));

    const datasExistentes = new Set(diasBase.map((d) => d.data));
    for (const data of linhasSinteticasPorDia.keys()) {
      if (!datasExistentes.has(data)) {
        diasBase.push({ data, saldoDia: 0, transacoes: [] });
      }
    }
    diasBase.sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));

    for (const dia of diasBase) {
      const extras = linhasSinteticasPorDia.get(dia.data);
      if (extras) dia.transacoes = [...dia.transacoes, ...extras];
      const diaServidor = dados.dias.find((d) => d.data === dia.data);
      const baseline = diaServidor ? diaServidor.saldoDia : baselineAntes(dia.data);
      dia.saldoDia = baseline + eventosAte(dia.data);
    }

    const totalPendente = eventos.reduce((soma, e) => soma + e.valor, 0);

    return {
      saldoAnterior: dados.saldoAnterior,
      dias: diasBase,
      totalEntradas: dados.totalEntradas + totalEntradasExtra,
      totalSaidas: dados.totalSaidas + totalSaidasExtra,
      saldoFinal: dados.saldoFinal + totalPendente,
    };
  }, [dados, fila, contas, categoriasData, filtros]);
}
