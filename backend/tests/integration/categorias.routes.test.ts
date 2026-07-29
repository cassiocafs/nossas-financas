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

describe("rotas de categorias", () => {
  it("GET /api/categorias/grupos retorna a árvore de grupos, subgrupos e categorias", async () => {
    mockPrisma.grupoCategoria.findMany.mockResolvedValue([
      { id: "grupo-1", nome: "Moradia", ordem: 0, subgrupos: [], categorias: [] },
    ]);
    mockPrisma.categoria.findMany.mockResolvedValue([]);

    const app = createApp();
    const res = await request(app).get("/api/categorias/grupos");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      grupos: [{ id: "grupo-1", nome: "Moradia", ordem: 0, subgrupos: [], categorias: [] }],
      semGrupo: [],
    });
  });

  it("POST /api/categorias sem grupoId retorna 400 (campo obrigatório, mesmo que nulo)", async () => {
    const app = createApp();
    const res = await request(app).post("/api/categorias").send({ nome: "Aluguel" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Dados inválidos");
  });
});
