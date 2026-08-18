import * as XLSX from "xlsx";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../middlewares/errorHandler.js";

const COLUNA_DATA = "Data Ocorrência";
const COLUNA_DESCRICAO = "Descrição";
const COLUNA_VALOR = "Valor";
const COLUNA_CATEGORIA = "Categoria";
const COLUNA_CONTA = "Conta";

interface LinhaPlanilha {
  [COLUNA_DATA]?: unknown;
  [COLUNA_DESCRICAO]?: unknown;
  [COLUNA_VALOR]?: unknown;
  [COLUNA_CATEGORIA]?: unknown;
  [COLUNA_CONTA]?: unknown;
}

export interface ErroImportacao {
  arquivo: string;
  linha: number;
  motivo: string;
}

export interface ResultadoImportacao {
  totalLinhas: number;
  importadas: number;
  contasCriadas: string[];
  categoriasCriadas: string[];
  erros: ErroImportacao[];
}

export interface LinhaPreviewImportacao {
  arquivo: string;
  linha: number;
  data: string;
  descricao: string;
  valor: number;
  conta: string;
  categoria: string | null;
  contaNova: boolean;
  categoriaNova: boolean;
  status: "nova" | "invalida";
  motivo?: string;
}

export interface ArquivoImportacao {
  nome: string;
  buffer: Buffer;
}

export interface PreviewImportacao {
  totalLinhas: number;
  novas: number;
  invalidas: number;
  contasNovas: string[];
  categoriasNovas: string[];
  linhas: LinhaPreviewImportacao[];
}

function excelDataParaDate(valor: unknown): Date | null {
  if (valor instanceof Date) {
    return new Date(Date.UTC(valor.getFullYear(), valor.getMonth(), valor.getDate()));
  }
  if (typeof valor === "number") {
    const parsed = XLSX.SSF.parse_date_code(valor);
    if (!parsed) return null;
    return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }
  if (typeof valor === "string") {
    const texto = valor.trim();
    const brMatch = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (brMatch) {
      const [, dia, mes, ano] = brMatch;
      return new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
    }
    const isoMatch = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, ano, mes, dia] = isoMatch;
      return new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
    }
  }
  return null;
}

function parseValor(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor === "string") {
    const normalizado = valor.trim().replace(/\./g, "").replace(",", ".");
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : null;
  }
  return null;
}

function textoCelula(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor).trim();
}

function dataParaIso(data: Date): string {
  return data.toISOString().slice(0, 10);
}

function lerLinhasPlanilha(buffer: Buffer, nomeArquivo: string): LinhaPlanilha[] {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  } catch {
    throw new HttpError(
      400,
      `Não foi possível ler o arquivo "${nomeArquivo}". Envie um extrato em formato XLS/XLSX.`,
    );
  }

  const nomeAba = workbook.SheetNames[0];
  if (!nomeAba) throw new HttpError(400, `A planilha "${nomeArquivo}" está vazia`);

  const linhas = XLSX.utils.sheet_to_json<LinhaPlanilha>(workbook.Sheets[nomeAba]!, {
    defval: null,
  });
  if (linhas.length === 0) {
    throw new HttpError(400, `Nenhuma linha encontrada na planilha "${nomeArquivo}"`);
  }

  const primeiraLinha = linhas[0]!;
  const colunasEsperadas = [COLUNA_DATA, COLUNA_DESCRICAO, COLUNA_VALOR, COLUNA_CONTA];
  const colunasFaltando = colunasEsperadas.filter((c) => !(c in primeiraLinha));
  if (colunasFaltando.length > 0) {
    throw new HttpError(
      400,
      `Colunas obrigatórias ausentes na planilha "${nomeArquivo}": ${colunasFaltando.join(", ")}`,
    );
  }

  return linhas;
}

const TAMANHO_LOTE_INSERCAO = 500;

interface LinhaExtraida {
  nomeConta: string;
  descricao: string;
  nomeCategoria: string;
  data: Date | null;
  valor: number | null;
}

function extrairLinha(linha: LinhaPlanilha): LinhaExtraida {
  return {
    nomeConta: textoCelula(linha[COLUNA_CONTA]),
    descricao: textoCelula(linha[COLUNA_DESCRICAO]),
    nomeCategoria: textoCelula(linha[COLUNA_CATEGORIA]),
    data: excelDataParaDate(linha[COLUNA_DATA]),
    valor: parseValor(linha[COLUNA_VALOR]),
  };
}

function linhaInvalida(l: LinhaExtraida): boolean {
  return !l.nomeConta || !l.descricao || !l.data || l.valor === null || l.valor === 0;
}

export async function gerarPreviewImportacao(
  espacoId: string,
  arquivos: ArquivoImportacao[],
): Promise<PreviewImportacao> {
  const linhasPorArquivo = arquivos.map((a) => ({
    nome: a.nome,
    linhas: lerLinhasPlanilha(a.buffer, a.nome),
  }));

  const [contasExistentes, categoriasExistentes] = await Promise.all([
    prisma.conta.findMany({ where: { espacoId } }),
    prisma.categoria.findMany({ where: { espacoId } }),
  ]);
  const mapaContas = new Map(contasExistentes.map((c) => [c.nome.trim().toLowerCase(), c]));
  const mapaCategorias = new Map(
    categoriasExistentes.map((c) => [c.nome.trim().toLowerCase(), c]),
  );

  const contasNovas: string[] = [];
  const categoriasNovas: string[] = [];
  const linhasPreview: LinhaPreviewImportacao[] = [];
  let totalLinhas = 0;
  let novas = 0;
  let invalidas = 0;

  for (const { nome: nomeArquivo, linhas } of linhasPorArquivo) {
    totalLinhas += linhas.length;

    for (let i = 0; i < linhas.length; i++) {
      const numeroLinha = i + 2;
      const extraida = extrairLinha(linhas[i]!);

      if (linhaInvalida(extraida)) {
        invalidas++;
        linhasPreview.push({
          arquivo: nomeArquivo,
          linha: numeroLinha,
          data: "",
          descricao: extraida.descricao,
          valor: extraida.valor ?? 0,
          conta: extraida.nomeConta,
          categoria: extraida.nomeCategoria || null,
          contaNova: false,
          categoriaNova: false,
          status: "invalida",
          motivo: "Linha incompleta ou com valores inválidos",
        });
        continue;
      }

      const { nomeConta, descricao, nomeCategoria, data, valor } = extraida as {
        nomeConta: string;
        descricao: string;
        nomeCategoria: string;
        data: Date;
        valor: number;
      };

      const chaveConta = nomeConta.toLowerCase();
      let contaNova = false;
      if (!mapaContas.get(chaveConta)) {
        contaNova = true;
        if (!contasNovas.includes(nomeConta)) contasNovas.push(nomeConta);
        mapaContas.set(chaveConta, { id: "", nome: nomeConta } as (typeof contasExistentes)[number]);
      }

      let categoriaNova = false;
      if (nomeCategoria && nomeCategoria.toLowerCase() !== "sem categoria") {
        const chaveCategoria = nomeCategoria.toLowerCase();
        if (!mapaCategorias.get(chaveCategoria)) {
          categoriaNova = true;
          if (!categoriasNovas.includes(nomeCategoria)) categoriasNovas.push(nomeCategoria);
          mapaCategorias.set(chaveCategoria, {
            id: "",
            nome: nomeCategoria,
          } as (typeof categoriasExistentes)[number]);
        }
      }

      novas++;
      linhasPreview.push({
        arquivo: nomeArquivo,
        linha: numeroLinha,
        data: dataParaIso(data),
        descricao,
        valor,
        conta: nomeConta,
        categoria: nomeCategoria || null,
        contaNova,
        categoriaNova,
        status: "nova",
      });
    }
  }

  return {
    totalLinhas,
    novas,
    invalidas,
    contasNovas,
    categoriasNovas,
    linhas: linhasPreview,
  };
}

export async function importarTransacoesXls(
  espacoId: string,
  arquivos: ArquivoImportacao[],
  onProgresso?: (processadas: number, total: number) => void,
): Promise<ResultadoImportacao> {
  const linhasPorArquivo = arquivos.map((a) => ({
    nome: a.nome,
    linhas: lerLinhasPlanilha(a.buffer, a.nome),
  }));
  const total = linhasPorArquivo.reduce((soma, a) => soma + a.linhas.length, 0);
  const passoProgresso = Math.max(1, Math.floor(total / 100));

  const [contasExistentes, categoriasExistentes] = await Promise.all([
    prisma.conta.findMany({ where: { espacoId } }),
    prisma.categoria.findMany({ where: { espacoId } }),
  ]);
  const mapaContas = new Map(contasExistentes.map((c) => [c.nome.trim().toLowerCase(), c]));
  const mapaCategorias = new Map(
    categoriasExistentes.map((c) => [c.nome.trim().toLowerCase(), c]),
  );

  const contasCriadas: string[] = [];
  const categoriasCriadas: string[] = [];
  const erros: ErroImportacao[] = [];
  const dadosParaInserir: Prisma.TransacaoCreateManyInput[] = [];
  let processadas = 0;

  function reportarProgresso() {
    if (onProgresso && (processadas % passoProgresso === 0 || processadas === total)) {
      onProgresso(processadas, total);
    }
  }

  for (const { nome: nomeArquivo, linhas } of linhasPorArquivo) {
    for (let i = 0; i < linhas.length; i++) {
      const numeroLinha = i + 2;
      const extraida = extrairLinha(linhas[i]!);
      processadas++;

      if (linhaInvalida(extraida)) {
        erros.push({
          arquivo: nomeArquivo,
          linha: numeroLinha,
          motivo: "Linha incompleta ou com valores inválidos",
        });
        reportarProgresso();
        continue;
      }

      const { nomeConta, descricao, nomeCategoria, data, valor } = extraida as {
        nomeConta: string;
        descricao: string;
        nomeCategoria: string;
        data: Date;
        valor: number;
      };

      const chaveConta = nomeConta.toLowerCase();
      let conta = mapaContas.get(chaveConta);
      if (!conta) {
        conta = await prisma.conta.create({
          data: { espacoId, nome: nomeConta, saldoInicial: 0, ativa: true },
        });
        mapaContas.set(chaveConta, conta);
        contasCriadas.push(nomeConta);
      }

      let categoriaId: string | null = null;
      if (nomeCategoria && nomeCategoria.toLowerCase() !== "sem categoria") {
        const chaveCategoria = nomeCategoria.toLowerCase();
        let categoria = mapaCategorias.get(chaveCategoria);
        if (!categoria) {
          categoria = await prisma.categoria.create({
            data: { espacoId, nome: nomeCategoria, grupoId: null, tipo: "AMBOS" },
          });
          mapaCategorias.set(chaveCategoria, categoria);
          categoriasCriadas.push(nomeCategoria);
        }
        categoriaId = categoria.id;
      }

      dadosParaInserir.push({
        espacoId,
        contaId: conta.id,
        categoriaId,
        tipo: valor >= 0 ? "RECEITA" : "DESPESA",
        data,
        descricao,
        valor,
        consolidado: true,
      });
      reportarProgresso();
    }
  }

  for (let i = 0; i < dadosParaInserir.length; i += TAMANHO_LOTE_INSERCAO) {
    const lote = dadosParaInserir.slice(i, i + TAMANHO_LOTE_INSERCAO);
    await prisma.transacao.createMany({ data: lote });
  }

  return {
    totalLinhas: total,
    importadas: dadosParaInserir.length,
    contasCriadas,
    categoriasCriadas,
    erros,
  };
}
