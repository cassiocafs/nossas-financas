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

describe("rotas de transações", () => {
  it("POST /api/transacoes cria uma transação de despesa com valor negativo", async () => {
    const contaId = "11111111-1111-4111-8111-111111111111";
    mockPrisma.conta.findFirst.mockResolvedValue({ id: contaId });
    mockPrisma.transacao.create.mockResolvedValue({
      id: "t-1",
      tipo: "DESPESA",
      data: new Date("2026-07-10T00:00:00.000Z"),
      descricao: "Mercado",
      contaId,
      conta: { id: contaId, nome: "Carteira" },
      categoriaId: null,
      categoria: null,
      valor: -50,
      consolidado: false,
      nota: null,
      transferenciaGrupoId: null,
    });

    const app = createApp();
    const res = await request(app).post("/api/transacoes").send({
      tipo: "DESPESA",
      data: "2026-07-10",
      descricao: "Mercado",
      contaId,
      valor: 50,
    });

    expect(res.status).toBe(201);
    expect(res.body.valor).toBe(-50);
  });

  it("POST /api/transacoes/transferencias com mesma conta de origem e destino retorna 400", async () => {
    const app = createApp();
    const res = await request(app).post("/api/transacoes/transferencias").send({
      data: "2026-07-10",
      contaOrigemId: "11111111-1111-4111-8111-111111111111",
      contaDestinoId: "11111111-1111-4111-8111-111111111111",
      valor: 100,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Dados inválidos");
  });

  it("GET /api/transacoes/transferencias/:grupoId retorna contas de origem e destino", async () => {
    const grupoId = "22222222-2222-4222-8222-222222222222";
    const contaOrigemId = "11111111-1111-4111-8111-111111111111";
    const contaDestinoId = "33333333-3333-4333-8333-333333333333";
    mockPrisma.transacao.findMany.mockResolvedValue([
      {
        id: "t-1",
        tipo: "TRANSFERENCIA",
        data: new Date("2026-07-10T00:00:00.000Z"),
        descricao: "Transferência entre contas",
        contaId: contaOrigemId,
        conta: { id: contaOrigemId, nome: "Carteira" },
        categoriaId: null,
        categoria: null,
        valor: -100,
        consolidado: true,
        nota: null,
        transferenciaGrupoId: grupoId,
      },
      {
        id: "t-2",
        tipo: "TRANSFERENCIA",
        data: new Date("2026-07-10T00:00:00.000Z"),
        descricao: "Transferência entre contas",
        contaId: contaDestinoId,
        conta: { id: contaDestinoId, nome: "Poupança" },
        categoriaId: null,
        categoria: null,
        valor: 100,
        consolidado: true,
        nota: null,
        transferenciaGrupoId: grupoId,
      },
    ]);

    const app = createApp();
    const res = await request(app).get(`/api/transacoes/transferencias/${grupoId}`);

    expect(res.status).toBe(200);
    expect(res.body.contaOrigem).toEqual({ id: contaOrigemId, nome: "Carteira" });
    expect(res.body.contaDestino).toEqual({ id: contaDestinoId, nome: "Poupança" });
  });
});
