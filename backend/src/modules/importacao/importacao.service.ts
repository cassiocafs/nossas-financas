import * as XLSX from "xlsx";
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
  linha: number;
  motivo: string;
}

export interface ResultadoImportacao {
  totalLinhas: number;
  importadas: number;
  duplicadasIgnoradas: number;
  contasCriadas: string[];
  categoriasCriadas: string[];
  erros: ErroImportacao[];
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

export async function importarTransacoesXls(
  espacoId: string,
  buffer: Buffer,
): Promise<ResultadoImportacao> {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  } catch {
    throw new HttpError(400, "Não foi possível ler o arquivo. Envie um extrato em formato XLS/XLSX.");
  }

  const nomeAba = workbook.SheetNames[0];
  if (!nomeAba) throw new HttpError(400, "A planilha enviada está vazia");

  const linhas = XLSX.utils.sheet_to_json<LinhaPlanilha>(workbook.Sheets[nomeAba]!, {
    defval: null,
  });
  if (linhas.length === 0) throw new HttpError(400, "Nenhuma linha encontrada na planilha");

  const primeiraLinha = linhas[0]!;
  const colunasEsperadas = [COLUNA_DATA, COLUNA_DESCRICAO, COLUNA_VALOR, COLUNA_CONTA];
  const colunasFaltando = colunasEsperadas.filter((c) => !(c in primeiraLinha));
  if (colunasFaltando.length > 0) {
    throw new HttpError(
      400,
      `Colunas obrigatórias ausentes na planilha: ${colunasFaltando.join(", ")}`,
    );
  }

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
  let importadas = 0;
  let duplicadasIgnoradas = 0;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i]!;
    const numeroLinha = i + 2;

    const nomeConta = textoCelula(linha[COLUNA_CONTA]);
    const descricao = textoCelula(linha[COLUNA_DESCRICAO]);
    const nomeCategoria = textoCelula(linha[COLUNA_CATEGORIA]);
    const data = excelDataParaDate(linha[COLUNA_DATA]);
    const valor = parseValor(linha[COLUNA_VALOR]);

    if (!nomeConta || !descricao || !data || valor === null || valor === 0) {
      erros.push({ linha: numeroLinha, motivo: "Linha incompleta ou com valores inválidos" });
      continue;
    }

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

    const duplicada = await prisma.transacao.findFirst({
      where: { espacoId, contaId: conta.id, data, descricao, valor },
    });
    if (duplicada) {
      duplicadasIgnoradas++;
      continue;
    }

    await prisma.transacao.create({
      data: {
        espacoId,
        contaId: conta.id,
        categoriaId,
        tipo: valor >= 0 ? "RECEITA" : "DESPESA",
        data,
        descricao,
        valor,
        consolidado: true,
      },
    });
    importadas++;
  }

  return {
    totalLinhas: linhas.length,
    importadas,
    duplicadasIgnoradas,
    contasCriadas,
    categoriasCriadas,
    erros,
  };
}
