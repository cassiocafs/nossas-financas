import { describe, expect, it } from "vitest";
import type { ItemCategoriaResumo } from "@/api/transacoes";
import { itensDoNivel } from "./categoriaNiveis";

const dados: ItemCategoriaResumo[] = [
  {
    categoriaId: "c1",
    categoriaNome: "Mercado",
    grupoId: "g1",
    grupoNome: "Casa",
    subgrupoId: "s1",
    subgrupoNome: "Alimentação",
    total: 300,
  },
  {
    categoriaId: "c2",
    categoriaNome: "Padaria",
    grupoId: "g1",
    grupoNome: "Casa",
    subgrupoId: "s1",
    subgrupoNome: "Alimentação",
    total: 100,
  },
  {
    categoriaId: "c3",
    categoriaNome: "Uber",
    grupoId: "g1",
    grupoNome: "Casa",
    subgrupoId: null,
    subgrupoNome: null,
    total: 80,
  },
  {
    categoriaId: null,
    categoriaNome: "Sem Categoria",
    grupoId: null,
    grupoNome: null,
    subgrupoId: null,
    subgrupoNome: null,
    total: 20,
  },
];

describe("itensDoNivel", () => {
  it("na raiz agrupa por grupo e mantém categorias soltas", () => {
    const itens = itensDoNivel(dados, { tipo: "raiz" });
    expect(itens).toEqual([
      expect.objectContaining({ chave: "g1", nome: "Casa", total: 480, folha: false }),
      expect.objectContaining({ chave: "sem-categoria", nome: "Sem Categoria", total: 20, folha: true }),
    ]);
  });

  it("no grupo separa subgrupos de categorias soltas", () => {
    const itens = itensDoNivel(dados, { tipo: "grupo", id: "g1", nome: "Casa" });
    expect(itens).toEqual([
      expect.objectContaining({ chave: "s1", nome: "Alimentação", total: 400, folha: false }),
      expect.objectContaining({ chave: "c3", nome: "Uber", total: 80, folha: true }),
    ]);
  });

  it("no subgrupo devolve as categorias folha", () => {
    const itens = itensDoNivel(dados, {
      tipo: "subgrupo",
      grupoId: "g1",
      id: "s1",
      nome: "Alimentação",
    });
    expect(itens.map((i) => i.nome)).toEqual(["Mercado", "Padaria"]);
    expect(itens.every((i) => i.folha)).toBe(true);
  });
});
