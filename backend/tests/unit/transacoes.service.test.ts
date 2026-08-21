import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetMockPrisma } from "../helpers/mockPrisma.js";

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const transacoesService = await import("../../src/modules/transacoes/transacoes.service.js");

const ESPACO_ID = "espaco-1";
const INCLUDE_PADRAO = {
  conta: { id: "conta-x", nome: "Conta X" },
  categoria: null,
};

beforeEach(() => {
  resetMockPrisma();
});

describe("transacoes.service — transferências", () => {
  it("criarTransferencia cria duas transações espelhadas com valores opostos e o mesmo grupo", async () => {
    mockPrisma.conta.findFirst
      .mockResolvedValueOnce({ id: "conta-origem" })
      .mockResolvedValueOnce({ id: "conta-destino" });

    mockPrisma.transacao.create
      .mockImplementationOnce(async ({ data }) => ({
        id: "t-saida",
        ...data,
        data: new Date("2026-07-10T00:00:00.000Z"),
        ...INCLUDE_PADRAO,
      }))
      .mockImplementationOnce(async ({ data }) => ({
        id: "t-entrada",
        ...data,
        data: new Date("2026-07-10T00:00:00.000Z"),
        ...INCLUDE_PADRAO,
      }));

    const resultado = await transacoesService.criarTransferencia(ESPACO_ID, {
      data: new Date("2026-07-10T00:00:00.000Z"),
      contaOrigemId: "conta-origem",
      contaDestinoId: "conta-destino",
      valor: 150,
      consolidado: false,
    });

    expect(resultado.transacoes).toHaveLength(2);
    expect(resultado.transacoes[0].valor).toBe(-150);
    expect(resultado.transacoes[1].valor).toBe(150);
    expect(resultado.transacoes[0].transferenciaGrupoId).toBe(resultado.transferenciaGrupoId);
    expect(resultado.transacoes[1].transferenciaGrupoId).toBe(resultado.transferenciaGrupoId);
  });

  it("excluirTransacao remove as duas pernas quando a transação faz parte de uma transferência", async () => {
    mockPrisma.transacao.findFirst.mockResolvedValue({
      id: "t-saida",
      transferenciaGrupoId: "grupo-1",
    });
    mockPrisma.transacao.deleteMany.mockResolvedValue({ count: 2 });

    await transacoesService.excluirTransacao(ESPACO_ID, "t-saida");

    expect(mockPrisma.transacao.deleteMany).toHaveBeenCalledWith({
      where: { espacoId: ESPACO_ID, transferenciaGrupoId: "grupo-1" },
    });
    expect(mockPrisma.transacao.delete).not.toHaveBeenCalled();
  });

  it("editarTransacao rejeita alterar valor/conta de uma perna de transferência", async () => {
    mockPrisma.transacao.findFirst.mockResolvedValue({
      id: "t-saida",
      transferenciaGrupoId: "grupo-1",
      valor: -150,
      tipo: "TRANSFERENCIA",
    });

    await expect(
      transacoesService.editarTransacao(ESPACO_ID, "t-saida", { valor: 200 }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("editarTransacao propaga campos permitidos (nota) para a perna espelhada", async () => {
    mockPrisma.transacao.findFirst.mockResolvedValue({
      id: "t-saida",
      transferenciaGrupoId: "grupo-1",
      valor: -150,
      tipo: "TRANSFERENCIA",
    });
    mockPrisma.transacao.update.mockResolvedValue({
      id: "t-saida",
      tipo: "TRANSFERENCIA",
      data: new Date("2026-07-10T00:00:00.000Z"),
      descricao: "Transferência",
      valor: -150,
      consolidado: false,
      nota: "pago",
      transferenciaGrupoId: "grupo-1",
      ...INCLUDE_PADRAO,
    });
    mockPrisma.transacao.updateMany.mockResolvedValue({ count: 1 });

    await transacoesService.editarTransacao(ESPACO_ID, "t-saida", { nota: "pago" });

    expect(mockPrisma.transacao.updateMany).toHaveBeenCalledWith({
      where: { espacoId: ESPACO_ID, transferenciaGrupoId: "grupo-1", id: { not: "t-saida" } },
      data: { nota: "pago" },
    });
  });
});

describe("transacoes.service — idempotência (sincronização offline)", () => {
  it("criarTransacao usa o id enviado pelo cliente quando não existe ainda", async () => {
    mockPrisma.conta.findFirst.mockResolvedValue({ id: "conta-1" });
    mockPrisma.transacao.findUnique.mockResolvedValue(null);
    mockPrisma.transacao.create.mockImplementation(async ({ data }) => ({
      ...data,
      ...INCLUDE_PADRAO,
    }));

    const resultado = await transacoesService.criarTransacao(ESPACO_ID, {
      id: "id-cliente-1",
      tipo: "DESPESA",
      data: new Date("2026-07-10T00:00:00.000Z"),
      descricao: "Mercado",
      contaId: "conta-1",
      valor: 50,
      consolidado: false,
    });

    expect(mockPrisma.transacao.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: "id-cliente-1" }) }),
    );
    expect(resultado.id).toBe("id-cliente-1");
  });

  it("criarTransacao reenviada com o mesmo id não duplica: devolve o registro já existente", async () => {
    mockPrisma.transacao.findUnique.mockResolvedValue({
      id: "id-cliente-1",
      espacoId: ESPACO_ID,
      tipo: "DESPESA",
      data: new Date("2026-07-10T00:00:00.000Z"),
      descricao: "Mercado",
      contaId: "conta-1",
      categoriaId: null,
      valor: -50,
      consolidado: false,
      nota: null,
      transferenciaGrupoId: null,
      ...INCLUDE_PADRAO,
    });

    const resultado = await transacoesService.criarTransacao(ESPACO_ID, {
      id: "id-cliente-1",
      tipo: "DESPESA",
      data: new Date("2026-07-10T00:00:00.000Z"),
      descricao: "Mercado",
      contaId: "conta-1",
      valor: 50,
      consolidado: false,
    });

    expect(mockPrisma.transacao.create).not.toHaveBeenCalled();
    expect(mockPrisma.conta.findFirst).not.toHaveBeenCalled();
    expect(resultado.id).toBe("id-cliente-1");
  });

  it("criarTransacao rejeita reaproveitar um id que pertence a outro espaço", async () => {
    mockPrisma.transacao.findUnique.mockResolvedValue({
      id: "id-cliente-1",
      espacoId: "outro-espaco",
      ...INCLUDE_PADRAO,
    });

    await expect(
      transacoesService.criarTransacao(ESPACO_ID, {
        id: "id-cliente-1",
        tipo: "DESPESA",
        data: new Date("2026-07-10T00:00:00.000Z"),
        descricao: "Mercado",
        contaId: "conta-1",
        valor: 50,
        consolidado: false,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("criarTransferencia reenviada com o mesmo transferenciaGrupoId devolve as duas pernas existentes", async () => {
    mockPrisma.transacao.findMany.mockResolvedValue([
      {
        id: "t-saida",
        transferenciaGrupoId: "grupo-1",
        data: new Date("2026-07-10T00:00:00.000Z"),
        valor: -150,
        ...INCLUDE_PADRAO,
      },
      {
        id: "t-entrada",
        transferenciaGrupoId: "grupo-1",
        data: new Date("2026-07-10T00:00:00.000Z"),
        valor: 150,
        ...INCLUDE_PADRAO,
      },
    ]);

    const resultado = await transacoesService.criarTransferencia(ESPACO_ID, {
      transferenciaGrupoId: "grupo-1",
      data: new Date("2026-07-10T00:00:00.000Z"),
      contaOrigemId: "conta-origem",
      contaDestinoId: "conta-destino",
      valor: 150,
      consolidado: false,
    });

    expect(mockPrisma.transacao.create).not.toHaveBeenCalled();
    expect(mockPrisma.conta.findFirst).not.toHaveBeenCalled();
    expect(resultado.transferenciaGrupoId).toBe("grupo-1");
    expect(resultado.transacoes).toHaveLength(2);
  });
});

describe("transacoes.service — aprendizado automático de regras", () => {
  it("criarTransacao grava/atualiza a regra da descrição com a conta e categoria usadas", async () => {
    mockPrisma.conta.findFirst.mockResolvedValue({ id: "conta-1" });
    mockPrisma.categoria.findFirst.mockResolvedValue({ id: "categoria-1" });
    mockPrisma.transacao.create.mockResolvedValue({
      id: "t-1",
      tipo: "DESPESA",
      data: new Date("2026-07-10T00:00:00.000Z"),
      descricao: "Uber",
      contaId: "conta-1",
      categoriaId: "categoria-1",
      valor: -50,
      consolidado: false,
      nota: null,
      transferenciaGrupoId: null,
      ...INCLUDE_PADRAO,
    });

    await transacoesService.criarTransacao(ESPACO_ID, {
      tipo: "DESPESA",
      data: new Date("2026-07-10T00:00:00.000Z"),
      descricao: "Uber",
      contaId: "conta-1",
      categoriaId: "categoria-1",
      valor: 50,
      consolidado: false,
    });

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
});

describe("transacoes.service — lote", () => {
  it("categorizarLote nunca recategoriza transações do tipo TRANSFERENCIA", async () => {
    mockPrisma.categoria.findFirst.mockResolvedValue({ id: "categoria-1" });
    mockPrisma.transacao.updateMany.mockResolvedValue({ count: 2 });

    await transacoesService.categorizarLote(ESPACO_ID, ["t1", "t2"], "categoria-1");

    expect(mockPrisma.transacao.updateMany).toHaveBeenCalledWith({
      where: { espacoId: ESPACO_ID, id: { in: ["t1", "t2"] }, tipo: { not: "TRANSFERENCIA" } },
      data: { categoriaId: "categoria-1" },
    });
  });

  it("excluirTransacoesLote também remove pernas espelhadas de transferências selecionadas", async () => {
    mockPrisma.transacao.findMany.mockResolvedValue([
      { transferenciaGrupoId: "grupo-1" },
      { transferenciaGrupoId: null },
    ]);
    mockPrisma.transacao.deleteMany.mockResolvedValue({ count: 3 });

    const resultado = await transacoesService.excluirTransacoesLote(ESPACO_ID, ["t1", "t2"]);

    expect(mockPrisma.transacao.deleteMany).toHaveBeenCalledWith({
      where: {
        espacoId: ESPACO_ID,
        OR: [{ id: { in: ["t1", "t2"] } }, { transferenciaGrupoId: { in: ["grupo-1"] } }],
      },
    });
    expect(resultado).toEqual({ excluidas: 3 });
  });
});

describe("transacoes.service — buscarEvolucaoSaldo", () => {
  it("acumula o saldo base com as transações de cada mês, mês a mês", async () => {
    mockPrisma.conta.findMany.mockResolvedValue([{ id: "conta-1", saldoInicial: 1000 }]);
    mockPrisma.transacao.aggregate.mockResolvedValue({ _sum: { valor: 200 } });
    mockPrisma.transacao.findMany.mockResolvedValue([
      { data: new Date("2026-05-10T00:00:00.000Z"), valor: -100 },
      { data: new Date("2026-06-05T00:00:00.000Z"), valor: 300 },
      { data: new Date("2026-07-01T00:00:00.000Z"), valor: -50 },
      { data: new Date("2026-07-20T00:00:00.000Z"), valor: 20 },
    ]);

    const resultado = await transacoesService.buscarEvolucaoSaldo(
      ESPACO_ID,
      { ano: 2026, mes: 5 },
      { ano: 2026, mes: 7 },
    );

    expect(mockPrisma.transacao.aggregate).toHaveBeenCalledWith({
      where: {
        espacoId: ESPACO_ID,
        contaId: { in: ["conta-1"] },
        data: { lt: new Date("2026-05-01T00:00:00.000Z") },
      },
      _sum: { valor: true },
    });
    expect(resultado).toEqual([
      { ano: 2026, mes: 5, saldoFinal: 1100 },
      { ano: 2026, mes: 6, saldoFinal: 1400 },
      { ano: 2026, mes: 7, saldoFinal: 1370 },
    ]);
  });
});
