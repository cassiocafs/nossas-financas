import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { ApiError, NetworkError } from '@/api/client';
import { addLog } from '@/lib/logStore';

function logQueryError(error: unknown, context: string) {
  console.error(`[react-query] erro não tratado em ${context}:`, error);
  // Erros de NetworkError/ApiError já são registrados em apiFetch; isto cobre
  // o restante (ex.: erro ao serializar variáveis da mutation).
  if (!(error instanceof ApiError) && !(error instanceof NetworkError)) {
    addLog('error', `react-query (${context}) não tratado`, error);
  }
}

// Erros HTTP 4xx (ApiError com status 4xx) não devem ser repetidos — são
// erros do cliente (validação, autenticação, etc.) e tentar de novo não
// resolve. Erros de rede (NetworkError e outras falhas de fetch) e 5xx
// merecem até 2 tentativas antes de desistir.
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
    },
    mutations: {
      retry: false,
    },
  },
  // Na v5 do TanStack Query, `onError` em `defaultOptions` foi descontinuado
  // em favor do `QueryCache`/`MutationCache`, que centralizam o log de erros
  // não tratados independentemente de cada tela tratar o próprio erro ou não.
  queryCache: new QueryCache({
    onError: (error) => logQueryError(error, 'query'),
  }),
  mutationCache: new MutationCache({
    onError: (error) => logQueryError(error, 'mutation'),
  }),
});
