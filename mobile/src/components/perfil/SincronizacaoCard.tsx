import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useNetworkState } from '@/hooks/use-network-state';
import { useSyncQueue } from '@/hooks/use-sync-queue';
import { useTheme } from '@/hooks/use-theme';
import { descartarItem, processarFila } from '@/lib/syncQueue';

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function descricaoOperacao(tipo: 'criarTransacao' | 'editarTransacao' | 'excluirTransacao' | 'criarTransferencia'): string {
  switch (tipo) {
    case 'criarTransacao':
      return 'Criar transação';
    case 'editarTransacao':
      return 'Editar transação';
    case 'excluirTransacao':
      return 'Excluir transação';
    case 'criarTransferencia':
      return 'Criar transferência';
  }
}

export function SincronizacaoCard() {
  const theme = useTheme();
  const { isConnected } = useNetworkState();
  const { fila, sincronizando, ultimaSincronizacao } = useSyncQueue();
  const comFalha = fila.filter((op) => op.tentativas > 0);

  return (
    <Card style={styles.card}>
      <ThemedView style={styles.linhaTitulo}>
        <ThemedText type="small" themeColor="textSecondary">
          Sincronização
        </ThemedText>
        {fila.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Tudo em dia
          </ThemedText>
        ) : (
          <ThemedText type="smallBold">
            {fila.length === 1 ? '1 pendência' : `${fila.length} pendências`}
          </ThemedText>
        )}
      </ThemedView>

      {ultimaSincronizacao && (
        <ThemedText type="small" themeColor="textSecondary">
          Última sincronização: {formatarDataHora(ultimaSincronizacao)}
        </ThemedText>
      )}

      {comFalha.length > 0 && (
        <ThemedView style={styles.listaFalhas}>
          {comFalha.map((op, indice) => (
            <ThemedView key={indice} style={[styles.itemFalha, { borderColor: theme.border }]}>
              <ThemedView style={styles.itemFalhaTexto}>
                <ThemedText type="small">{descricaoOperacao(op.tipo)}</ThemedText>
                {op.ultimoErro && (
                  <ThemedText type="small" themeColor="expense">
                    {op.ultimoErro}
                  </ThemedText>
                )}
              </ThemedView>
              <ThemedText type="small" themeColor="primary" onPress={() => descartarItem(op)}>
                Descartar
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      <Button
        title={sincronizando ? 'Sincronizando...' : 'Sincronizar agora'}
        icon="refresh-cw"
        variant="secondary"
        loading={sincronizando}
        disabled={fila.length === 0 || !isConnected}
        onPress={() => processarFila()}
        style={styles.botao}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listaFalhas: { gap: Spacing.one },
  itemFalha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
  },
  itemFalhaTexto: { flex: 1, gap: Spacing.half },
  botao: { marginTop: Spacing.one },
});
