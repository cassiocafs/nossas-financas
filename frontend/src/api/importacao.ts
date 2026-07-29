import { apiFetch } from "./client";

export interface ErroImportacao {
  linha: number;
  motivo: string;
}

export interface ResultadoImportacao {
  totalLinhas: number;
  importadas: number;
  duplicadasIgnoradas: number;
  contasCriadas: string[];
  categoriasCriadas: string[];
  erros: ErroImportacao[];
}

export function importarTransacoesXls(arquivo: File): Promise<ResultadoImportacao> {
  const formData = new FormData();
  formData.append("arquivo", arquivo);

  return apiFetch<ResultadoImportacao>("/api/importacoes/transacoes", {
    method: "POST",
    body: formData,
  });
}
