import { supabase } from "@/lib/supabaseClient";
import { apiFetch, baseUrl, ApiError } from "./client";

export interface ErroImportacao {
  arquivo: string;
  linha: number;
  motivo: string;
}

export interface ResultadoImportacao {
  totalLinhas: number;
  importadas: number;
  contasCriadas: string[];
  categoriasCriadas: string[];
  erros: ErroImportacao[];
}

export interface LinhaPreviewImportacao {
  arquivo: string;
  linha: number;
  data: string;
  descricao: string;
  valor: number;
  conta: string;
  categoria: string | null;
  contaNova: boolean;
  categoriaNova: boolean;
  status: "nova" | "invalida";
  motivo?: string;
}

export interface PreviewImportacao {
  totalLinhas: number;
  novas: number;
  invalidas: number;
  contasNovas: string[];
  categoriasNovas: string[];
  linhas: LinhaPreviewImportacao[];
}

export function previewImportacaoXls(arquivos: File[]): Promise<PreviewImportacao> {
  const formData = new FormData();
  for (const arquivo of arquivos) {
    formData.append("arquivos", arquivo);
  }

  return apiFetch<PreviewImportacao>("/api/importacoes/transacoes/preview", {
    method: "POST",
    body: formData,
  });
}

type EventoImportacao =
  | { tipo: "progresso"; processadas: number; total: number }
  | { tipo: "concluido"; resultado: ResultadoImportacao }
  | { tipo: "erro"; mensagem: string };

export async function importarTransacoesXls(
  arquivos: File[],
  onProgresso?: (processadas: number, total: number) => void,
): Promise<ResultadoImportacao> {
  const formData = new FormData();
  for (const arquivo of arquivos) {
    formData.append("arquivos", arquivo);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers();
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const res = await fetch(`${baseUrl}/api/importacoes/transacoes`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  if (!res.body) throw new ApiError(res.status, "Resposta vazia do servidor");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let resultado: ResultadoImportacao | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let indiceQuebra: number;
    while ((indiceQuebra = buffer.indexOf("\n")) >= 0) {
      const linha = buffer.slice(0, indiceQuebra).trim();
      buffer = buffer.slice(indiceQuebra + 1);
      if (!linha) continue;

      const evento = JSON.parse(linha) as EventoImportacao;
      if (evento.tipo === "progresso") {
        onProgresso?.(evento.processadas, evento.total);
      } else if (evento.tipo === "concluido") {
        resultado = evento.resultado;
      } else if (evento.tipo === "erro") {
        throw new ApiError(500, evento.mensagem);
      }
    }
  }

  if (!resultado) throw new ApiError(500, "Resposta inesperada do servidor");
  return resultado;
}
