import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
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

beforeEach(() => {
  resetMockPrisma();
});

describe("rotas de contas", () => {
  it("GET /api/contas retorna a lista de contas do espaço", async () => {
    mockPrisma.conta.findMany.mockResolvedValue([
      { id: "conta-1", nome: "Carteira", saldoInicial: 100, ativa: true },
    ]);
    mockPrisma.transacao.groupBy.mockResolvedValue([]);

    const app = createApp();
    const res = await request(app).get("/api/contas");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: "conta-1", nome: "Carteira", saldoInicial: 100, ativa: true, saldoAtual: 100 },
    ]);
  });

  it("POST /api/contas com nome vazio retorna 400 com detalhes de validação", async () => {
    const app = createApp();
    const res = await request(app).post("/api/contas").send({ nome: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Dados inválidos");
    expect(res.body.detalhes).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "nome" })]),
    );
  });
});
