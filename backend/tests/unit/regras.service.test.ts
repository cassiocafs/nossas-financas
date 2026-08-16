import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetMockPrisma } from "../helpers/mockPrisma.js";

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const regrasService = await import("../../src/modules/regras/regras.service.js");

const ESPACO_ID = "espaco-1";

beforeEach(() => {
  resetMockPrisma();
});

describe("regras.service", () => {
  it("criarRegra lança 409 quando já existe regra para a descrição normalizada", async () => {
    mockPrisma.conta.findFirst.mockResolvedValue({ id: "conta-1" });
    mockPrisma.regraTransacao.findFirst.mockResolvedValue({ id: "regra-existente" });

    await expect(
      regrasService.criarRegra(ESPACO_ID, { descricao: "Uber", contaId: "conta-1" }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("criarRegra normaliza a descrição (acentos, caixa e espaços) ao gravar", async () => {
    mockPrisma.conta.findFirst.mockResolvedValue({ id: "conta-1" });
    mockPrisma.regraTransacao.findFirst.mockResolvedValue(null);
    mockPrisma.regraTransacao.create.mockResolvedValue({
      id: "regra-1",
      descricao: "Pão de Açúcar",
      contaId: "conta-1",
      conta: { id: "conta-1", nome: "Carteira" },
      categoriaId: null,
      categoria: null,
    });

    await regrasService.criarRegra(ESPACO_ID, { descricao: "  Pão de Açúcar  ", contaId: "conta-1" });

    expect(mockPrisma.regraTransacao.create).toHaveBeenCalledWith({
      data: {
        espacoId: ESPACO_ID,
        descricao: "Pão de Açúcar",
        descricaoNormalizada: "pao de acucar",
        contaId: "conta-1",
        categoriaId: null,
      },
      include: expect.anything(),
    });
  });

  it("sugerirParaTransacao retorna contaId e categoriaId nulos quando não há regra equivalente", async () => {
    mockPrisma.regraTransacao.findFirst.mockResolvedValue(null);

    const sugestao = await regrasService.sugerirParaTransacao(ESPACO_ID, "compra qualquer");

    expect(sugestao).toEqual({ contaId: null, categoriaId: null });
  });

  it("sugerirParaTransacao casa a descrição ignorando acentos, caixa e espaços extras", async () => {
    mockPrisma.regraTransacao.findFirst.mockResolvedValue({
      contaId: "conta-1",
      categoriaId: "categoria-1",
    });

    const sugestao = await regrasService.sugerirParaTransacao(ESPACO_ID, "  UBER  ");

    expect(mockPrisma.regraTransacao.findFirst).toHaveBeenCalledWith({
      where: { espacoId: ESPACO_ID, descricaoNormalizada: "uber" },
    });
    expect(sugestao).toEqual({ contaId: "conta-1", categoriaId: "categoria-1" });
  });

  it("aprenderComTransacao grava a regra via upsert usando a descrição normalizada como chave", async () => {
    mockPrisma.regraTransacao.upsert.mockResolvedValue({});

    await regrasService.aprenderComTransacao(ESPACO_ID, " Uber ", "conta-1", "categoria-1");

    expect(mockPrisma.regraTransacao.upsert).toHaveBeenCalledWith({
      where: { espacoId_descricaoNormalizada: { espacoId: ESPACO_ID, descricaoNormalizada: "uber" } },
      update: { descricao: "Uber", contaId: "conta-1", categoriaId: "categoria-1" },
      create: {
        espacoId: ESPACO_ID,
        descricao: "Uber",
        descricaoNormalizada: "uber",
        contaId: "conta-1",
        categoriaId: "categoria-1",
      },
    });
  });

  it("aprenderComTransacao não grava nada quando a descrição está vazia", async () => {
    await regrasService.aprenderComTransacao(ESPACO_ID, "   ", "conta-1", null);

    expect(mockPrisma.regraTransacao.upsert).not.toHaveBeenCalled();
  });
});
