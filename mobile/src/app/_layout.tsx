import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { ApiError, baseUrl, NetworkError } from '@/api/client';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { addLog } from '@/lib/logStore';

SplashScreen.preventAutoHideAsync();

addLog('info', 'App iniciado', { baseUrl });

/** O app sempre roda no tema light, independentemente do tema do aparelho. */
const LightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    primary: Colors.light.primary,
  },
};

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

const queryClient = new QueryClient({
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

function SplashGate({ children, fontsReady }: { children: React.ReactNode; fontsReady: boolean }) {
  const { loading } = useAuth();
  const ready = fontsReady && !loading;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
  const fontsReady = fontsLoaded || !!fontsError;

  return (
    <ThemeProvider value={LightNavigationTheme}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SplashGate fontsReady={fontsReady}>
              <Slot />
            </SplashGate>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
