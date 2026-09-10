import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetMockPrisma } from "../helpers/mockPrisma.js";

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const { criarMeta, listarMetas, buscarMeta, excluirMeta, registrarAporte, removerAporte } =
  await import("../../src/modules/metas/metas.service.js");
const { HttpError } = await import("../../src/middlewares/errorHandler.js");

const ESPACO_ID = "espaco-1";

function metaBase(over: Record<string, unknown> = {}) {
  return {
    id: "meta-1",
    espacoId: ESPACO_ID,
    nome: "Viagem",
    emoji: null,
    valorAlvo: 1000,
    dataAlvo: null,
    concluidaEm: null,
    arquivada: false,
    ordem: 0,
    criadoEm: new Date("2026-01-01"),
    atualizadoEm: new Date("2026-01-01"),
    ...over,
  };
}

beforeEach(() => {
  resetMockPrisma();
});

describe("metas.service", () => {
  it("criarMeta devolve meta com progresso 0 e estado sem_aporte", async () => {
    mockPrisma.meta.create.mockResolvedValue(metaBase());

    const meta = await criarMeta(ESPACO_ID, { nome: "Viagem", valorAlvo: 1000 });

    expect(mockPrisma.meta.create).toHaveBeenCalledWith({
      data: { espacoId: ESPACO_ID, nome: "Viagem", emoji: null, valorAlvo: 1000, dataAlvo: null },
    });
    expect(meta).toMatchObject({
      valorAtual: 0,
      progresso: 0,
      faltam: 1000,
      estado: "sem_aporte",
    });
  });

  it("listarMetas soma os aportes via groupBy para calcular valorAtual e progresso", async () => {
    mockPrisma.meta.findMany.mockResolvedValue([metaBase()]);
    mockPrisma.aporteMeta.groupBy.mockResolvedValue([
      { metaId: "meta-1", _sum: { valor: 800 }, _max: { data: new Date("2026-02-10") } },
    ]);

    const metas = await listarMetas(ESPACO_ID, false);

    expect(metas[0]).toMatchObject({
      valorAtual: 800,
      progresso: 80,
      faltam: 200,
      estado: "quase_la",
      ultimoAporteEm: "2026-02-10",
    });
  });

  it("registrarAporte marca concluidaEm quando o valor acumulado atinge o alvo", async () => {
    mockPrisma.meta.findFirst.mockResolvedValue(metaBase({ valorAlvo: 500 }));
    mockPrisma.aporteMeta.create.mockResolvedValue({
      id: "aporte-1",
      valor: 500,
      data: new Date("2026-03-01"),
      nota: null,
      criadoEm: new Date("2026-03-01"),
    });
    mockPrisma.aporteMeta.groupBy.mockResolvedValue([
      { metaId: "meta-1", _sum: { valor: 500 }, _max: { data: new Date("2026-03-01") } },
    ]);
    mockPrisma.meta.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(metaBase({ valorAlvo: 500, ...data })),
    );

    const { meta } = await registrarAporte(ESPACO_ID, "meta-1", {
      valor: 500,
      data: new Date("2026-03-01"),
    });

    expect(mockPrisma.meta.update).toHaveBeenCalledWith({
      where: { id: "meta-1" },
      data: { concluidaEm: expect.any(Date) },
    });
    expect(meta.estado).toBe("concluida");
    expect(meta.progresso).toBe(100);
  });

  it("excluirMeta sem confirmar lança 409 quando há aportes", async () => {
    mockPrisma.meta.findFirst.mockResolvedValue(metaBase());
    mockPrisma.aporteMeta.count.mockResolvedValue(2);

    await expect(excluirMeta(ESPACO_ID, "meta-1", false)).rejects.toThrow(HttpError);
    await expect(excluirMeta(ESPACO_ID, "meta-1", false)).rejects.toMatchObject({ status: 409 });
  });

  it("excluirMeta com confirmar apaga a meta (cascade nos aportes)", async () => {
    mockPrisma.meta.findFirst.mockResolvedValue(metaBase());
    mockPrisma.aporteMeta.count.mockResolvedValue(2);
    mockPrisma.meta.delete.mockResolvedValue(metaBase());

    await excluirMeta(ESPACO_ID, "meta-1", true);

    expect(mockPrisma.meta.delete).toHaveBeenCalledWith({ where: { id: "meta-1" } });
  });

  it("excluirMeta lança 404 quando a meta não existe no espaço", async () => {
    mockPrisma.meta.findFirst.mockResolvedValue(null);

    await expect(excluirMeta(ESPACO_ID, "inexistente", true)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("buscarMeta devolve a meta com o histórico de aportes serializado", async () => {
    mockPrisma.meta.findFirst.mockResolvedValue(metaBase());
    mockPrisma.aporteMeta.findMany.mockResolvedValue([
      {
        id: "aporte-1",
        valor: 300,
        data: new Date("2026-02-01"),
        nota: "salário",
        criadoEm: new Date("2026-02-01"),
      },
    ]);

    const meta = await buscarMeta(ESPACO_ID, "meta-1");

    expect(meta.valorAtual).toBe(300);
    expect(meta.aportes).toHaveLength(1);
    expect(meta.aportes[0]).toMatchObject({ valor: 300, data: "2026-02-01", nota: "salário" });
  });

  it("removerAporte limpa concluidaEm quando o valor cai abaixo do alvo", async () => {
    mockPrisma.meta.findFirst.mockResolvedValue(
      metaBase({ valorAlvo: 500, concluidaEm: new Date("2026-03-01") }),
    );
    mockPrisma.aporteMeta.findFirst.mockResolvedValue({ id: "aporte-1", valor: 200 });
    mockPrisma.aporteMeta.delete.mockResolvedValue({});
    mockPrisma.aporteMeta.groupBy.mockResolvedValue([
      { metaId: "meta-1", _sum: { valor: 300 }, _max: { data: new Date("2026-02-01") } },
    ]);
    mockPrisma.meta.update.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve(metaBase({ valorAlvo: 500, ...data })),
    );

    const { meta } = await removerAporte(ESPACO_ID, "meta-1", "aporte-1");

    expect(mockPrisma.meta.update).toHaveBeenCalledWith({
      where: { id: "meta-1" },
      data: { concluidaEm: null },
    });
    expect(meta.estado).not.toBe("concluida");
  });
});
