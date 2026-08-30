import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { listarContas } from '@/api/contas';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Radius, Spacing } from '@/constants/theme';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useFormatarValor } from '@/hooks/use-formatar-valor';
import { useTheme } from '@/hooks/use-theme';

const ON_BRAND_SOFT = 'rgba(255,255,255,0.78)';
const ON_BRAND_CONTROL = 'rgba(255,255,255,0.16)';

interface FinancialCardProps {
  /** Texto de variação do mês, ex.: "R$ 1.860 este mês". */
  delta?: string;
}

/** Card herói verde: saldo consolidado das contas, olho para mascarar, ação "Ver extrato". */
export function FinancialCard({ delta }: FinancialCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const formatarValor = useFormatarValor();
  const { hideValues, toggleHideValues } = usePreferences();

  const { data: contas, isLoading } = useQuery({
    queryKey: ['contas', 'ativas'],
    queryFn: () => listarContas(false),
  });

  const saldoTotal = contas?.reduce((soma, conta) => soma + conta.saldoAtual, 0) ?? 0;
  const qtd = contas?.length ?? 0;
  const label = qtd === 1 ? 'Seu saldo em uma conta' : `Seu saldo em ${qtd || 'suas'} contas`;

  return (
    <Card variant="brand" style={styles.card}>
      <View style={styles.topRow}>
        <ThemedText type="small" style={styles.soft}>
          {label}
        </ThemedText>
        <Pressable
          onPress={toggleHideValues}
          accessibilityLabel={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
          hitSlop={8}
          style={styles.eye}>
          <Feather name={hideValues ? 'eye-off' : 'eye'} size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      <ThemedText type="moneyLg" themeColor="primaryForeground" numberOfLines={1} adjustsFontSizeToFit>
        {isLoading ? '···' : formatarValor(saldoTotal)}
      </ThemedText>

      {!isLoading && saldoTotal < 0 ? (
        <View style={styles.alertPill}>
          <Feather name="alert-triangle" size={12} color={theme.moneyAlert} />
          <ThemedText type="caption" themeColor="moneyAlert" style={styles.alertText}>
            Saldo negativo
          </ThemedText>
        </View>
      ) : delta ? (
        <ThemedText type="small" style={styles.soft}>
          {delta}
        </ThemedText>
      ) : null}

      <Pressable
        onPress={() => router.push('/transacoes')}
        style={(state) => [styles.action, { opacity: state.pressed ? 0.85 : 1 }]}>
        <ThemedText type="smallBold" themeColor="primaryForeground">
          Ver extrato
        </ThemedText>
        <Feather name="arrow-right" size={15} color="#FFFFFF" />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  soft: { color: ON_BRAND_SOFT },
  eye: { padding: 2 },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.half,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
  },
  alertText: { textTransform: 'none', letterSpacing: 0 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.one,
    marginTop: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: ON_BRAND_CONTROL,
  },
});
