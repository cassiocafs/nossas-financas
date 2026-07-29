import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetMockPrisma } from "../helpers/mockPrisma.js";

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const { criarConta, excluirConta, listarContas } = await import(
  "../../src/modules/contas/contas.service.js"
);
const { HttpError } = await import("../../src/middlewares/errorHandler.js");

const ESPACO_ID = "espaco-1";

beforeEach(() => {
  resetMockPrisma();
});

describe("contas.service", () => {
  it("criarConta cria a conta com os dados informados", async () => {
    mockPrisma.conta.create.mockResolvedValue({
      id: "conta-1",
      nome: "Carteira",
      saldoInicial: 100,
      ativa: true,
    });

    const conta = await criarConta(ESPACO_ID, { nome: "Carteira", saldoInicial: 100, ativa: true });

    expect(mockPrisma.conta.create).toHaveBeenCalledWith({
      data: { espacoId: ESPACO_ID, nome: "Carteira", saldoInicial: 100, ativa: true },
    });
    expect(conta).toMatchObject({ id: "conta-1", saldoAtual: 100 });
  });

  it("listarContas soma saldoInicial + transações para calcular saldoAtual", async () => {
    mockPrisma.conta.findMany.mockResolvedValue([
      { id: "conta-1", nome: "Carteira", saldoInicial: 100, ativa: true },
    ]);
    mockPrisma.transacao.groupBy.mockResolvedValue([
      { contaId: "conta-1", _sum: { valor: -30 } },
    ]);

    const contas = await listarContas(ESPACO_ID, false);

    expect(contas[0].saldoAtual).toBe(70);
  });

  it("excluirConta sem estratégia lança 409 quando há transações vinculadas", async () => {
    mockPrisma.conta.findFirst.mockResolvedValue({ id: "conta-1" });
    mockPrisma.transacao.count.mockResolvedValue(3);

    await expect(excluirConta(ESPACO_ID, "conta-1")).rejects.toThrow(HttpError);
    await expect(excluirConta(ESPACO_ID, "conta-1")).rejects.toMatchObject({ status: 409 });
  });

  it("excluirConta com estratégia excluirTransacoes remove transações (incluindo pernas espelhadas) e a conta", async () => {
    mockPrisma.conta.findFirst.mockResolvedValue({ id: "conta-1" });
    mockPrisma.transacao.count.mockResolvedValue(2);
    mockPrisma.transacao.findMany.mockResolvedValue([
      { transferenciaGrupoId: "grupo-1" },
      { transferenciaGrupoId: null },
    ]);
    mockPrisma.transacao.deleteMany.mockResolvedValue({ count: 3 });
    mockPrisma.conta.delete.mockResolvedValue({});

    await excluirConta(ESPACO_ID, "conta-1", { estrategia: "excluirTransacoes" });

    expect(mockPrisma.transacao.deleteMany).toHaveBeenCalledWith({
      where: {
        espacoId: ESPACO_ID,
        OR: [{ contaId: "conta-1" }, { transferenciaGrupoId: { in: ["grupo-1"] } }],
      },
    });
    expect(mockPrisma.conta.delete).toHaveBeenCalledWith({ where: { id: "conta-1" } });
  });

  it("excluirConta lança 404 quando a conta não existe no espaço", async () => {
    mockPrisma.conta.findFirst.mockResolvedValue(null);

    await expect(excluirConta(ESPACO_ID, "inexistente")).rejects.toMatchObject({ status: 404 });
  });
});
