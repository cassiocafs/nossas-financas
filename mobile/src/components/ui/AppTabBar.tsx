import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'home',
  transacoes: 'repeat',
  relatorios: 'pie-chart',
  perfil: 'settings',
};

const LABELS: Record<string, string> = {
  index: 'Início',
  transacoes: 'Transações',
  relatorios: 'Relatórios',
  perfil: 'Ajustes',
};

/** Barra de navegação inferior com botão flutuante central para lançar uma transação a partir de qualquer aba. */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const router = useRouter();

  function abrirNovaTransacao() {
    router.push({ pathname: '/transacoes', params: { novo: String(Date.now()) } });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const label = LABELS[route.name] ?? descriptors[route.key].options.title ?? route.name;
        const icon = ICONS[route.name] ?? 'circle';

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        const itens = [
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.item}>
            <Feather name={icon} size={21} color={isFocused ? theme.primary : theme.textTertiary} />
            <ThemedText type="small" style={styles.label} themeColor={isFocused ? 'primary' : 'textTertiary'}>
              {label}
            </ThemedText>
          </Pressable>,
        ];

        if (route.name === 'transacoes') {
          itens.push(
            <Pressable
              key="nova-transacao"
              accessibilityRole="button"
              accessibilityLabel="Nova transação"
              onPress={abrirNovaTransacao}
              style={(pressState) => [
                styles.fab,
                { backgroundColor: theme.primary, opacity: pressState.pressed ? 0.9 : 1 },
                Shadow.lift,
              ]}>
              <Feather name="plus" size={24} color={theme.primaryForeground} />
            </Pressable>,
          );
        }

        return itens;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    paddingBottom: Platform.select({ ios: Spacing.six, default: Spacing.three }),
    paddingHorizontal: Spacing.one,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  label: { fontSize: 10.5 },
  fab: {
    position: 'relative',
    top: -22,
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -Spacing.two,
  },
});
