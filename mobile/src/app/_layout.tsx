import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { baseUrl } from '@/api/client';
import { SyncStatusBar } from '@/components/SyncStatusBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PreferencesProvider, usePreferences } from '@/contexts/PreferencesContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNetworkState } from '@/hooks/use-network-state';
import { addLog } from '@/lib/logStore';
import { queryClient } from '@/lib/queryClient';
import { filaHidratada, processarFila } from '@/lib/syncQueue';

SplashScreen.preventAutoHideAsync();

addLog('info', 'App iniciado', { baseUrl });

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: '@nossas-financas/cache-query',
});
const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
  buster: Constants.expoConfig?.version ?? '1',
};

/** Tema de navegação (expo-router/react-navigation) derivado dos tokens de cada esquema. */
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
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    primary: Colors.dark.primary,
  },
};

function useFilaHidratada(): boolean {
  const [pronta, setPronta] = useState(false);
  useEffect(() => {
    let ativo = true;
    filaHidratada.then(() => {
      if (ativo) setPronta(true);
    });
    return () => {
      ativo = false;
    };
  }, []);
  return pronta;
}

/** Dispara a sincronização automaticamente sempre que a conectividade volta (ou já começa online com pendências). */
function AutoSync() {
  const { isConnected } = useNetworkState();

  useEffect(() => {
    if (!isConnected) return;
    let cancelado = false;
    filaHidratada.then(() => {
      if (!cancelado) void processarFila();
    });
    return () => {
      cancelado = true;
    };
  }, [isConnected]);

  return null;
}

function SplashGate({ children, fontsReady }: { children: React.ReactNode; fontsReady: boolean }) {
  const { loading } = useAuth();
  const filaPronta = useFilaHidratada();
  const ready = fontsReady && !loading && filaPronta;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <AutoSync />
      <SyncStatusBar />
      {children}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });
  const fontsReady = fontsLoaded || !!fontsError;

  return (
    <PreferencesProvider>
      <RootLayoutNavigation fontsReady={fontsReady} />
    </PreferencesProvider>
  );
}

function RootLayoutNavigation({ fontsReady }: { fontsReady: boolean }) {
  const scheme = useColorScheme();
  const { colorSchemeOverride } = usePreferences();
  const resolvido = colorSchemeOverride === 'system' ? scheme : colorSchemeOverride;
  const navigationTheme = resolvido === 'dark' ? DarkNavigationTheme : LightNavigationTheme;

  return (
    <ThemeProvider value={navigationTheme}>
      <ErrorBoundary>
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <AuthProvider>
            <SplashGate fontsReady={fontsReady}>
              <Slot />
            </SplashGate>
          </AuthProvider>
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
