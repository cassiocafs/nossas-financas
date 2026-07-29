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
    mockPrisma.conta.create.mockResolvedValue({ id: "conta-1", nome: "Cartão C6" });
    mockPrisma.categoria.create.mockResolvedValue({ id: "categoria-1", nome: "Feira" });
    mockPrisma.transacao.findFirst.mockResolvedValue(null);
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
      .attach("arquivo", buffer, "extrato.xls");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalLinhas: 1,
      importadas: 1,
      duplicadasIgnoradas: 0,
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

  it("POST /api/importacoes/transacoes ignora transação já existente (duplicada)", async () => {
    mockPrisma.conta.findMany.mockResolvedValue([{ id: "conta-1", nome: "Cartão C6" }]);
    mockPrisma.categoria.findMany.mockResolvedValue([{ id: "categoria-1", nome: "Feira" }]);
    mockPrisma.transacao.findFirst.mockResolvedValue({ id: "existente" });

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
      .attach("arquivo", buffer, "extrato.xls");

    expect(res.status).toBe(200);
    expect(res.body.duplicadasIgnoradas).toBe(1);
    expect(res.body.importadas).toBe(0);
    expect(mockPrisma.conta.create).not.toHaveBeenCalled();
    expect(mockPrisma.transacao.create).not.toHaveBeenCalled();
  });
});
