import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import * as XLSX from "xlsx";
import { mockPrisma, resetMockPrisma } from "../helpers/mockPrisma.js";

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));
vi.mock("../../src/middlewares/authenticate.js", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.auth = { userId: "user-1", email: "user@teste.com" };
    next();
  },
}));
vi.mock("../../src/middlewares/resolveEspaco.js", () => ({
  resolveEspaco: (req: any, _res: any, next: any) => {
    req.espacoId = "espaco-1";
    req.usuario = { id: "user-1" };
    next();
  },
}));

const { createApp } = await import("../../src/app.js");

interface EventoConcluido {
  tipo: "concluido";
  resultado: Record<string, unknown>;
}

function extrairResultado(ndjson: string): Record<string, unknown> {
  const eventos = ndjson
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((linha) => JSON.parse(linha) as EventoConcluido | { tipo: string });
  const concluido = eventos.find((e): e is EventoConcluido => e.tipo === "concluido");
  if (!concluido) throw new Error("Evento 'concluido' não encontrado na resposta");
  return concluido.resultado;
}

function gerarPlanilha(linhas: Record<string, unknown>[]): Buffer {
  const planilha = XLSX.utils.json_to_sheet(linhas);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, planilha, "Extrato");
  return XLSX.write(workbook, { type: "buffer", bookType: "xls" }) as Buffer;
}

beforeEach(() => {
  resetMockPrisma();
});

describe("rotas de importação", () => {
  it("POST /api/importacoes/transacoes sem arquivo retorna 400", async () => {
    const app = createApp();
    const res = await request(app).post("/api/importacoes/transacoes");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Nenhum arquivo enviado");
  });

  it("POST /api/importacoes/transacoes cria conta e categoria novas e importa a transação", async () => {
    mockPrisma.conta.findMany.mockResolvedValue([]);
    mockPrisma.categoria.findMany.mockResolvedValue([]);
    mockPrisma.transacao.findMany.mockResolvedValue([]);
    mockPrisma.conta.create.mockResolvedValue({ id: "conta-1", nome: "Cartão C6" });
    mockPrisma.categoria.create.mockResolvedValue({ id: "categoria-1", nome: "Feira" });
    mockPrisma.transacao.create.mockResolvedValue({ id: "t-1" });

    const buffer = gerarPlanilha([
      {
        "Data Ocorrência": "01/01/2026",
        Descrição: "Tomate e chuchu",
        Valor: -6.2,
        Categoria: "Feira",
        Conta: "Cartão C6",
      },
    ]);

    const app = createApp();
    const res = await request(app)
      .post("/api/importacoes/transacoes")
      .attach("arquivos", buffer, "extrato.xls");

    expect(res.status).toBe(200);
    expect(extrairResultado(res.text)).toMatchObject({
      totalLinhas: 1,
      importadas: 1,
      contasCriadas: ["Cartão C6"],
      categoriasCriadas: ["Feira"],
      erros: [],
    });
    expect(mockPrisma.transacao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipo: "DESPESA",
          valor: -6.2,
          consolidado: true,
        }),
      }),
    );
  });

  it("POST /api/importacoes/transacoes importa a transação mesmo se já existir uma igual", async () => {
    mockPrisma.conta.findMany.mockResolvedValue([{ id: "conta-1", nome: "Cartão C6" }]);
    mockPrisma.categoria.findMany.mockResolvedValue([{ id: "categoria-1", nome: "Feira" }]);
    mockPrisma.transacao.findMany.mockResolvedValue([
      {
        contaId: "conta-1",
        data: new Date(Date.UTC(2026, 0, 1)),
        descricao: "Tomate e chuchu",
        valor: { toNumber: () => -6.2 },
        categoriaId: "categoria-1",
      },
    ]);
    mockPrisma.transacao.create.mockResolvedValue({ id: "t-2" });

    const buffer = gerarPlanilha([
      {
        "Data Ocorrência": "01/01/2026",
        Descrição: "Tomate e chuchu",
        Valor: -6.2,
        Categoria: "Feira",
        Conta: "Cartão C6",
      },
    ]);

    const app = createApp();
    const res = await request(app)
      .post("/api/importacoes/transacoes")
      .attach("arquivos", buffer, "extrato.xls");

    expect(res.status).toBe(200);
    const resultado = extrairResultado(res.text);
    expect(resultado.importadas).toBe(1);
    expect(mockPrisma.conta.create).not.toHaveBeenCalled();
    expect(mockPrisma.transacao.create).toHaveBeenCalledTimes(1);
  });

  it("POST /api/importacoes/transacoes aceita múltiplos arquivos e importa linhas repetidas entre eles", async () => {
    mockPrisma.conta.findMany.mockResolvedValue([]);
    mockPrisma.categoria.findMany.mockResolvedValue([]);
    mockPrisma.transacao.findMany.mockResolvedValue([]);
    mockPrisma.conta.create.mockResolvedValue({ id: "conta-1", nome: "Cartão C6" });
    mockPrisma.categoria.create.mockResolvedValue({ id: "categoria-1", nome: "Feira" });
    mockPrisma.transacao.create.mockResolvedValue({ id: "t-1" });

    const linhaBase = {
      "Data Ocorrência": "01/01/2026",
      Descrição: "Tomate e chuchu",
      Valor: -6.2,
      Categoria: "Feira",
      Conta: "Cartão C6",
    };
    const bufferA = gerarPlanilha([linhaBase]);
    const bufferB = gerarPlanilha([
      linhaBase,
      {
        "Data Ocorrência": "02/01/2026",
        Descrição: "Feira da semana",
        Valor: -30,
        Categoria: "Feira",
        Conta: "Cartão C6",
      },
    ]);

    const app = createApp();
    const res = await request(app)
      .post("/api/importacoes/transacoes")
      .attach("arquivos", bufferA, "extrato-a.xls")
      .attach("arquivos", bufferB, "extrato-b.xls");

    expect(res.status).toBe(200);
    const resultado = extrairResultado(res.text);
    expect(resultado).toMatchObject({
      totalLinhas: 3,
      importadas: 3,
    });
  });
});
