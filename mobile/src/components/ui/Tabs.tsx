import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Altura da trilha. Padrão 48. */
  height?: number;
}

/** Controle segmentado full-width: trilha cinza, pílula ativa branca com sombra `sm`. */
export function Tabs<T extends string>({ items, value, onChange, disabled, height = 48 }: TabsProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.surface, height }]}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: !!disabled }}
            disabled={disabled}
            onPress={() => onChange(item.value)}
            style={[styles.item, active && [{ backgroundColor: theme.card }, Shadow.sm]]}>
            <ThemedText
              type={active ? 'smallBold' : 'label'}
              style={{ color: active ? theme.primary : theme.textSecondary }}
              numberOfLines={1}>
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
