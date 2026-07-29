import { apiFetch } from "./client";

export type TipoTransacao = "DESPESA" | "RECEITA" | "TRANSFERENCIA";
export type StatusFiltro = "todas" | "consolidadas" | "pendentes";

export interface Transacao {
  id: string;
  tipo: TipoTransacao;
  data: string;
  descricao: string;
  contaId: string;
  conta: { id: string; nome: string };
  categoriaId: string | null;
  categoria: { id: string; nome: string } | null;
  valor: number;
  consolidado: boolean;
  nota: string | null;
  transferenciaGrupoId: string | null;
}

export interface DiaTransacoes {
  data: string;
  saldoDia: number;
  transacoes: Transacao[];
}

export interface ListagemMensal {
  saldoAnterior: number;
  dias: DiaTransacoes[];
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
}

export interface ResumoMensal {
  saldoAnterior: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
  anterioresNaoConsolidadas: Transacao[];
  proximasNaoConsolidadas: Transacao[];
  despesasPorCategoria: { categoriaId: string | null; categoriaNome: string; total: number }[];
}

export interface FiltrosTransacoes {
  ano: number;
  mes: number;
  contaIds?: string[];
  categoriaIds?: string[];
  status?: StatusFiltro;
  texto?: string;
}

export interface CriarTransacaoInput {
  tipo: "DESPESA" | "RECEITA";
  data: string;
  descricao: string;
  contaId: string;
  categoriaId?: string | null;
  valor: number;
  consolidado: boolean;
  nota?: string;
}

export type EditarTransacaoInput = Partial<CriarTransacaoInput>;

export interface CriarTransferenciaInput {
  data: string;
  descricao?: string;
  contaOrigemId: string;
  contaDestinoId: string;
  valor: number;
  consolidado: boolean;
  nota?: string;
}

function montarQuery(filtros: FiltrosTransacoes): string {
  const params = new URLSearchParams();
  params.set("ano", String(filtros.ano));
  params.set("mes", String(filtros.mes));
  if (filtros.contaIds?.length) params.set("contaIds", filtros.contaIds.join(","));
  if (filtros.categoriaIds?.length) params.set("categoriaIds", filtros.categoriaIds.join(","));
  if (filtros.status) params.set("status", filtros.status);
  if (filtros.texto) params.set("texto", filtros.texto);
  return params.toString();
}

export function listarTransacoesMes(filtros: FiltrosTransacoes): Promise<ListagemMensal> {
  return apiFetch<ListagemMensal>(`/api/transacoes?${montarQuery(filtros)}`);
}

export function buscarResumoMensal(ano: number, mes: number): Promise<ResumoMensal> {
  return apiFetch<ResumoMensal>(`/api/transacoes/resumo?ano=${ano}&mes=${mes}`);
}

export interface PontoEvolucaoSaldo {
  ano: number;
  mes: number;
  saldoFinal: number;
}

export function buscarEvolucaoSaldo(meses = 6): Promise<PontoEvolucaoSaldo[]> {
  return apiFetch<PontoEvolucaoSaldo[]>(`/api/transacoes/evolucao-saldo?meses=${meses}`);
}

export function criarTransacao(input: CriarTransacaoInput): Promise<Transacao> {
  return apiFetch<Transacao>("/api/transacoes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function criarTransferencia(
  input: CriarTransferenciaInput,
): Promise<{ transferenciaGrupoId: string; transacoes: Transacao[] }> {
  return apiFetch("/api/transacoes/transferencias", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function editarTransacao(id: string, input: EditarTransacaoInput): Promise<Transacao> {
  return apiFetch<Transacao>(`/api/transacoes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function excluirTransacao(id: string): Promise<void> {
  return apiFetch<void>(`/api/transacoes/${id}`, { method: "DELETE" });
}

export function excluirTransacoesLote(ids: string[]): Promise<{ excluidas: number }> {
  return apiFetch("/api/transacoes/excluir-lote", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export function consolidarLote(
  ids: string[],
  consolidado: boolean,
): Promise<{ atualizadas: number }> {
  return apiFetch("/api/transacoes/consolidar-lote", {
    method: "POST",
    body: JSON.stringify({ ids, consolidado }),
  });
}

export function categorizarLote(
  ids: string[],
  categoriaId: string | null,
): Promise<{ atualizadas: number }> {
  return apiFetch("/api/transacoes/categorizar-lote", {
    method: "POST",
    body: JSON.stringify({ ids, categoriaId }),
  });
}
