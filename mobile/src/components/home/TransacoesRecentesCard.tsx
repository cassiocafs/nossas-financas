import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Transacao } from '@/api/transacoes';
import { ThemedText } from '@/components/themed-text';
import { TransacaoItem } from '@/components/transacoes/TransacaoItem';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LIMITE = 4;

interface TransacoesRecentesCardProps {
  ano: number;
  mes: number;
  recentes: Transacao[];
}

export function TransacoesRecentesCard({ ano, mes, recentes: todasRecentes }: TransacoesRecentesCardProps) {
  const router = useRouter();
  const theme = useTheme();
  const recentes = todasRecentes.slice(0, LIMITE);

  function verTodas() {
    router.push({ pathname: '/transacoes', params: { ano: String(ano), mes: String(mes) } });
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Últimas transações</ThemedText>
        <Pressable onPress={verTodas} hitSlop={8}>
          <ThemedText type="smallBold" themeColor="primary">
            Ver todas
          </ThemedText>
        </Pressable>
      </View>

      <Card padding="compact">
        {recentes.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Nenhuma transação neste período.
          </ThemedText>
        ) : (
          recentes.map((transacao, i) => (
            <View
              key={transacao.id}
              style={i < recentes.length - 1 ? [styles.divider, { borderBottomColor: theme.divider }] : undefined}>
              <TransacaoItem
                transacao={transacao}
                selecionado={false}
                modoSelecao={false}
                onPress={verTodas}
                onLongPress={() => {}}
              />
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth },
});
