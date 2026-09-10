import { apiFetch } from "./client";
import type { Conta } from "./contas";
import type { GradeOrcamento } from "./orcamento";
import type { Meta } from "./metas";

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

export interface ItemCategoriaResumo {
  categoriaId: string | null;
  categoriaNome: string;
  grupoId: string | null;
  grupoNome: string | null;
  subgrupoId: string | null;
  subgrupoNome: string | null;
  total: number;
}

export interface ResumoMensal {
  saldoAnterior: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
  recentes: Transacao[];
  anterioresNaoConsolidadas: Transacao[];
  proximasNaoConsolidadas: Transacao[];
  despesasPorCategoria: ItemCategoriaResumo[];
  receitasPorCategoria: ItemCategoriaResumo[];
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

export function buscarResumoMensal(
  ano: number,
  mes: number,
  contaIds?: string[],
): Promise<ResumoMensal> {
  const params = new URLSearchParams({ ano: String(ano), mes: String(mes) });
  if (contaIds?.length) params.set("contaIds", contaIds.join(","));
  return apiFetch<ResumoMensal>(`/api/transacoes/resumo?${params.toString()}`);
}

export interface PontoEvolucaoSaldo {
  ano: number;
  mes: number;
  saldoFinal: number;
}

export interface PeriodoMes {
  ano: number;
  mes: number;
}

export function buscarEvolucaoSaldo(
  inicio: PeriodoMes,
  fim: PeriodoMes,
  contaIds?: string[],
): Promise<PontoEvolucaoSaldo[]> {
  const params = new URLSearchParams({
    anoInicio: String(inicio.ano),
    mesInicio: String(inicio.mes),
    anoFim: String(fim.ano),
    mesFim: String(fim.mes),
  });
  if (contaIds?.length) params.set("contaIds", contaIds.join(","));
  return apiFetch<PontoEvolucaoSaldo[]>(`/api/transacoes/evolucao-saldo?${params.toString()}`);
}

export interface PontoFluxoCaixa {
  ano: number;
  mes: number;
  entradas: number;
  saidas: number;
}

export interface FluxoCaixa {
  serie: PontoFluxoCaixa[];
}

export function buscarFluxoCaixa(
  fim: PeriodoMes,
  meses = 6,
  contaIds?: string[],
): Promise<FluxoCaixa> {
  const params = new URLSearchParams({
    ano: String(fim.ano),
    mes: String(fim.mes),
    meses: String(meses),
  });
  if (contaIds?.length) params.set("contaIds", contaIds.join(","));
  return apiFetch<FluxoCaixa>(`/api/transacoes/fluxo-caixa?${params.toString()}`);
}

export interface ResumoMensalComPeriodo extends ResumoMensal {
  ano: number;
  mes: number;
}

export interface HomePayload {
  contas: Conta[];
  /** [0] = mês consultado; [1..3] = meses fechados anteriores, mais recente primeiro. */
  meses: ResumoMensalComPeriodo[];
  evolucaoSaldo: PontoEvolucaoSaldo[];
  fluxoCaixa: FluxoCaixa;
  orcamentoGrade: (GradeOrcamento & { orcamentoId: string }) | null;
  metas: Meta[];
}

export function buscarHome(
  ano: number,
  mes: number,
  contaIds?: string[],
): Promise<HomePayload> {
  const params = new URLSearchParams({ ano: String(ano), mes: String(mes) });
  if (contaIds?.length) params.set("contaIds", contaIds.join(","));
  return apiFetch<HomePayload>(`/api/transacoes/home?${params.toString()}`);
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

export interface Transferencia {
  transferenciaGrupoId: string;
  contaOrigem: { id: string; nome: string } | null;
  contaDestino: { id: string; nome: string } | null;
  transacoes: Transacao[];
}

export function buscarTransferencia(grupoId: string): Promise<Transferencia> {
  return apiFetch<Transferencia>(`/api/transacoes/transferencias/${grupoId}`);
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
