import { CATEGORICAL_PALETTE } from "./chartPalette";

/**
 * As categorias são livres (definidas pelo usuário), não uma taxonomia fixa — não há como
 * mapear cor por nome. Em vez disso, cada categoria recebe uma cor estável da paleta a partir
 * de um hash do seu id, garantindo que a mesma categoria sempre apareça com a mesma cor em
 * todos os gráficos, independentemente da ordem de exibição.
 */
export function categoryColor(categoriaId: string | null | undefined): string {
  if (!categoriaId) return "var(--color-muted-foreground)";
  let hash = 0;
  for (let i = 0; i < categoriaId.length; i++) {
    hash = (hash * 31 + categoriaId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CATEGORICAL_PALETTE.length;
  return CATEGORICAL_PALETTE[index];
}
