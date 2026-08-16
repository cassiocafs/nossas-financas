const REGEX_DIACRITICOS = /[̀-ͯ]/g;

export function normalizarDescricao(descricao: string): string {
  return descricao
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(REGEX_DIACRITICOS, "")
    .replace(/\s+/g, " ");
}
