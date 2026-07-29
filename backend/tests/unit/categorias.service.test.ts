import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetMockPrisma } from "../helpers/mockPrisma.js";

vi.mock("../../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const categoriasService = await import("../../src/modules/categorias/categorias.service.js");

const ESPACO_ID = "espaco-1";

beforeEach(() => {
  resetMockPrisma();
});

describe("categorias.service", () => {
  it("criarGrupo lança 409 quando já existe grupo com o mesmo nome", async () => {
    mockPrisma.grupoCategoria.findFirst.mockResolvedValue({ id: "grupo-1", nome: "Moradia" });

    await expect(categoriasService.criarGrupo(ESPACO_ID, { nome: "Moradia" })).rejects.toMatchObject({
      status: 409,
    });
  });

  it("criarCategoria lança 409 quando já existe categoria com o mesmo nome no grupo", async () => {
    mockPrisma.grupoCategoria.findFirst.mockResolvedValue({ id: "grupo-1", espacoId: ESPACO_ID });
    mockPrisma.categoria.findFirst.mockResolvedValue({ id: "categoria-existente" });

    await expect(
      categoriasService.criarCategoria(ESPACO_ID, {
        nome: "Aluguel",
        grupoId: "grupo-1",
        tipo: "DESPESA",
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("criarSubgrupo lança 409 quando já existe subgrupo com o mesmo nome no grupo", async () => {
    mockPrisma.grupoCategoria.findFirst.mockResolvedValue({ id: "grupo-1", espacoId: ESPACO_ID });
    mockPrisma.subgrupoCategoria.findFirst.mockResolvedValue({ id: "subgrupo-1" });

    await expect(
      categoriasService.criarSubgrupo(ESPACO_ID, { nome: "Alimentação", grupoId: "grupo-1" }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("criarCategoria lança 400 quando subgrupo informado não pertence ao grupo informado", async () => {
    mockPrisma.grupoCategoria.findFirst.mockResolvedValue({ id: "grupo-1", espacoId: ESPACO_ID });
    mockPrisma.subgrupoCategoria.findFirst.mockResolvedValue({
      id: "subgrupo-1",
      espacoId: ESPACO_ID,
      grupoId: "outro-grupo",
    });

    await expect(
      categoriasService.criarCategoria(ESPACO_ID, {
        nome: "Feira",
        grupoId: "grupo-1",
        subgrupoId: "subgrupo-1",
        tipo: "DESPESA",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("excluirCategoria sem estratégia lança 409 quando há transações vinculadas", async () => {
    mockPrisma.categoria.findFirst.mockResolvedValue({ id: "categoria-1" });
    mockPrisma.transacao.count.mockResolvedValue(5);

    await expect(categoriasService.excluirCategoria(ESPACO_ID, "categoria-1")).rejects.toMatchObject({
      status: 409,
    });
  });

  it("excluirCategoria com estratégia realocarPara reclassifica as transações e limpa vínculos", async () => {
    mockPrisma.categoria.findFirst
      .mockResolvedValueOnce({ id: "categoria-1" }) // buscarCategoriaOuFalhar
      .mockResolvedValueOnce({ id: "categoria-2" }); // categoria destino dentro da tx
    mockPrisma.transacao.count.mockResolvedValue(4);
    mockPrisma.transacao.updateMany.mockResolvedValue({ count: 4 });
    mockPrisma.orcamentoCategoriaMes.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.regraCategorizacao.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.categoria.delete.mockResolvedValue({});

    await categoriasService.excluirCategoria(ESPACO_ID, "categoria-1", {
      estrategia: "realocarPara",
      categoriaDestinoId: "categoria-2",
    });

    expect(mockPrisma.transacao.updateMany).toHaveBeenCalledWith({
      where: { espacoId: ESPACO_ID, categoriaId: "categoria-1" },
      data: { categoriaId: "categoria-2" },
    });
    expect(mockPrisma.categoria.delete).toHaveBeenCalledWith({ where: { id: "categoria-1" } });
  });

  it("sugerirCategoria retorna null quando nenhuma regra bate", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const sugestao = await categoriasService.sugerirCategoria(ESPACO_ID, "compra qualquer");

    expect(sugestao).toEqual({ categoriaId: null, palavraChave: null });
  });
});
