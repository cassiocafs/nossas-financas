import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GruposResponse } from "@/api/categorias";
import { CategoryFilterProvider, useCategoryFilter } from "@/contexts/CategoryFilterContext";
import { CategoriasSidebar } from "./CategoriasSidebar";

function ProbeFiltro() {
  const { categoriasSelecionadasIds } = useCategoryFilter();
  return <output data-testid="filtro">{categoriasSelecionadasIds.join(",")}</output>;
}

vi.mock("@/api/categorias", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/api/categorias")>();
  return { ...original, listarGrupos: vi.fn() };
});

const { listarGrupos } = await import("@/api/categorias");

function categoria(id: string, nome: string): GruposResponse["semGrupo"][number] {
  return { id, nome, grupoId: null, subgrupoId: null, tipo: "DESPESA", ativa: true, regras: [] };
}

const RESPOSTA: GruposResponse = {
  grupos: [
    {
      id: "g-fixo",
      nome: "Fixo",
      ordem: 0,
      categorias: [],
      subgrupos: [
        {
          id: "s-alimentacao",
          nome: "Alimentação",
          ordem: 0,
          categorias: [categoria("c-feira", "Feira"), categoria("c-mercado", "Mercado")],
        },
      ],
    },
  ],
  semGrupo: [],
};

function renderizar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CategoryFilterProvider>
        <CategoriasSidebar />
        <ProbeFiltro />
      </CategoryFilterProvider>
    </QueryClientProvider>,
  );
}

describe("CategoriasSidebar", () => {
  beforeEach(() => {
    vi.mocked(listarGrupos).mockResolvedValue(RESPOSTA);
  });

  it("expande grupo e subgrupo até a folha e alterna a seleção", async () => {
    renderizar();

    const grupo = await screen.findByRole("treeitem", { name: /fixo/i });
    expect(grupo).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Feira")).not.toBeInTheDocument();

    fireEvent.click(grupo);
    fireEvent.click(screen.getByRole("treeitem", { name: /alimentação/i }));

    const feira = screen.getByRole("treeitem", { name: "Feira" });
    expect(feira).toHaveAttribute("aria-checked", "false");

    fireEvent.click(feira);
    expect(feira).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("1 categoria selecionada")).toBeInTheDocument();
    expect(screen.getByTestId("filtro")).toHaveTextContent("c-feira");

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(screen.queryByText("1 categoria selecionada")).not.toBeInTheDocument();
    expect(screen.getByTestId("filtro")).toHaveTextContent("");
  });

  it("'Expandir tudo' abre todos os níveis e vira 'Recolher tudo'", async () => {
    renderizar();

    const alternar = await screen.findByRole("button", { name: "Expandir tudo" });
    fireEvent.click(alternar);

    expect(screen.getByText("Feira")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recolher tudo" })).toBeInTheDocument();
  });
});
