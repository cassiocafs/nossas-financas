import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface CategoryFilterContextValue {
  categoriasSelecionadasIds: string[];
  alternarCategoriaSelecionada: (categoriaId: string) => void;
  limparCategoriasSelecionadas: () => void;
}

const CategoryFilterContext = createContext<CategoryFilterContextValue | null>(null);

export function CategoryFilterProvider({ children }: { children: ReactNode }) {
  const [categoriasSelecionadasIds, setCategoriasSelecionadasIds] = useState<string[]>([]);

  const value = useMemo<CategoryFilterContextValue>(
    () => ({
      categoriasSelecionadasIds,
      alternarCategoriaSelecionada: (categoriaId: string) =>
        setCategoriasSelecionadasIds((atual) =>
          atual.includes(categoriaId)
            ? atual.filter((id) => id !== categoriaId)
            : [...atual, categoriaId],
        ),
      limparCategoriasSelecionadas: () => setCategoriasSelecionadasIds([]),
    }),
    [categoriasSelecionadasIds],
  );

  return <CategoryFilterContext value={value}>{children}</CategoryFilterContext>;
}

export function useCategoryFilter() {
  const context = useContext(CategoryFilterContext);
  if (!context) {
    throw new Error("useCategoryFilter deve ser usado dentro de CategoryFilterProvider");
  }
  return context;
}
