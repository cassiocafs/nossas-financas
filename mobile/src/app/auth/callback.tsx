import { useEffect } from 'react';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { traduzirErroAuth } from '@/lib/authErrors';
import { addLog } from '@/lib/logStore';
import { supabase } from '@/lib/supabaseClient';

/**
 * Fallback para o retorno do OAuth do Google: normalmente o `WebBrowser.openAuthSessionAsync`
 * (em AuthContext) intercepta o redirect antes de chegar aqui. Se o SO abrir o link como um
 * deep link comum (app em background, navegador externo, etc.), essa rota evita o "Unmatched
 * Route" processando o mesmo `poupeu://auth/callback?...` e mandando o usuário pra onde
 * já era esperado que ele fosse.
 */
export default function AuthCallbackScreen() {
  const url = Linking.useURL();

  useEffect(() => {
    async function processar() {
      if (!url) {
        router.replace('/login');
        return;
      }

      const { params, errorCode } = QueryParams.getQueryParams(url);

      if (errorCode || params.error) {
        addLog('error', 'Callback do Google retornou erro', { errorCode, ...params });
        const erroGoogle = traduzirErroAuth(
          new Error(params.error_description ?? errorCode ?? params.error),
          'Falha ao entrar com Google',
        );
        router.replace({ pathname: '/login', params: { erroGoogle } });
        return;
      }

      const { access_token, refresh_token } = params;
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) {
          addLog('error', 'Falha ao definir sessão no callback do Google', error);
          router.replace({
            pathname: '/login',
            params: { erroGoogle: traduzirErroAuth(error, 'Falha ao entrar com Google') },
          });
          return;
        }
        router.replace('/');
        return;
      }

      router.replace('/login');
    }

    processar();
  }, [url]);

  return (
    <ThemedView type="background" style={styles.container}>
      <ActivityIndicator size="large" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
