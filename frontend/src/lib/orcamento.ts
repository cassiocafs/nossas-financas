import type { CategoriaGrade, GradeOrcamento } from "@/api/orcamento";

/**
 * Varre a grade do orçamento (categorias diretas dos grupos + categorias dos
 * subgrupos) procurando a linha de uma categoria. Devolve `null` quando a
 * categoria não está na grade do mês (ex.: removida do orçamento, ou mês trocado
 * para um em que ela não existe).
 */
export function acharCategoriaNaGrade(
  grade: GradeOrcamento,
  categoriaId: string,
): CategoriaGrade | null {
  for (const grupo of grade.grupos) {
    for (const categoria of grupo.categorias) {
      if (categoria.categoriaId === categoriaId) return categoria;
    }
    for (const subgrupo of grupo.subgrupos) {
      for (const categoria of subgrupo.categorias) {
        if (categoria.categoriaId === categoriaId) return categoria;
      }
    }
  }
  return null;
}
