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

describe("rotas de regras de transação", () => {
  it("GET /api/regras/sugestao retorna contaId e categoriaId da regra equivalente", async () => {
    mockPrisma.regraTransacao.findFirst.mockResolvedValue({
      contaId: "conta-1",
      categoriaId: "categoria-1",
    });

    const app = createApp();
    const res = await request(app).get("/api/regras/sugestao").query({ descricao: "Uber" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ contaId: "conta-1", categoriaId: "categoria-1" });
  });

  it("POST /api/regras sem contaId retorna 400 (campo obrigatório)", async () => {
    const app = createApp();
    const res = await request(app).post("/api/regras").send({ descricao: "Uber" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Dados inválidos");
  });

  it("POST /api/regras cria uma regra manual quando conta existe e descrição é inédita", async () => {
    const contaId = "11111111-1111-4111-8111-111111111111";
    mockPrisma.conta.findFirst.mockResolvedValue({ id: contaId });
    mockPrisma.regraTransacao.findFirst.mockResolvedValue(null);
    mockPrisma.regraTransacao.create.mockResolvedValue({
      id: "regra-1",
      descricao: "Uber",
      contaId,
      conta: { id: contaId, nome: "Carteira" },
      categoriaId: null,
      categoria: null,
    });

    const app = createApp();
    const res = await request(app).post("/api/regras").send({ descricao: "Uber", contaId });

    expect(res.status).toBe(201);
    expect(res.body.descricao).toBe("Uber");
  });

  it("DELETE /api/regras/:id retorna 404 quando a regra não existe no espaço", async () => {
    mockPrisma.regraTransacao.findFirst.mockResolvedValue(null);

    const app = createApp();
    const res = await request(app).delete(
      "/api/regras/11111111-1111-4111-8111-111111111111",
    );

    expect(res.status).toBe(404);
  });
});
