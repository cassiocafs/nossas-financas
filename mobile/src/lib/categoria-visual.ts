import type { Feather } from '@expo/vector-icons';

import { CategoryNeutral, CategoryPalette } from '@/constants/theme';

type FeatherGlyph = keyof typeof Feather.glyphMap;

/**
 * As categorias do Poupeu são livres (definidas pelo usuário), não uma taxonomia fixa —
 * não há como mapear cor por nome. Cada categoria recebe uma cor estável a partir de um
 * hash do seu id, garantindo que a mesma categoria sempre apareça com a mesma cor em
 * todos os gráficos e listas. Mesma ideia de `frontend/src/lib/categoryColor.ts`.
 */
function hashIndice(id: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}

/** Par `{ fg, bg }` estável para uma categoria (bg é o tint claro para o círculo do ícone). */
export function corCategoria(categoriaId: string | null | undefined): { fg: string; bg: string } {
  if (!categoriaId) {
    return { fg: CategoryNeutral[0], bg: CategoryNeutral[1] };
  }
  const [fg, bg] = CategoryPalette[hashIndice(categoriaId, CategoryPalette.length)];
  return { fg, bg };
}

/**
 * Ícone de interface para a categoria. Como não há taxonomia, hoje é sempre um glifo
 * genérico. Isolado aqui para, no futuro, poder mapear por palavra-chave/grupo.
 */
export function iconeCategoria(_categoriaId: string | null | undefined): FeatherGlyph {
  return 'tag';
}
