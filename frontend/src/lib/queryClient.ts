import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/api/client";

// Erros 4xx (validação, autenticação, não encontrado) são erros do cliente:
// tentar de novo não resolve, só atrasa a exibição do erro. Falhas de rede
// e 5xx ainda merecem algumas tentativas antes de desistir.
function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      // Dados financeiros do próprio usuário não precisam ser revalidados a
      // cada foco de janela; mutations já invalidam as queries afetadas, então
      // uma janela de 1 min de "fresco" evita refetch redundante das
      // requisições paralelas da Home (e ao navegar entre meses) sem risco de
      // mostrar dado desatualizado.
      staleTime: 60_000,
    },
  },
});
