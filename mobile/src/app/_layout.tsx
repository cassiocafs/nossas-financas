import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { ApiError } from '@/api/client';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

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

const DarkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    primary: Colors.dark.primary,
  },
};

function logQueryError(error: unknown, context: string) {
  console.error(`[react-query] erro não tratado em ${context}:`, error);
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

function SplashGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) return null;

  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkNavigationTheme : LightNavigationTheme}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SplashGate>
              <Slot />
            </SplashGate>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
