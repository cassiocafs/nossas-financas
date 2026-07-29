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

describe("rotas de orçamento", () => {
  it("POST /api/orcamento cria um orçamento para o ano informado", async () => {
    mockPrisma.orcamentoAnual.findFirst.mockResolvedValue(null);
    mockPrisma.orcamentoAnual.create.mockResolvedValue({ id: "orc-1", ano: 2026 });

    const app = createApp();
    const res = await request(app).post("/api/orcamento").send({ ano: 2026 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: "orc-1", ano: 2026 });
  });

  it("POST /api/orcamento com ano fora do intervalo válido retorna 400", async () => {
    const app = createApp();
    const res = await request(app).post("/api/orcamento").send({ ano: 1500 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Dados inválidos");
  });
});
