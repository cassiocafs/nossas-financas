import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChipProps = Omit<PressableProps, 'style'> & {
  label: string;
  selected?: boolean;
  style?: PressableProps['style'];
};

export function Chip({ label, selected, style, ...rest }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={(state) => [
        styles.base,
        {
          backgroundColor: selected ? theme.primary : theme.surface,
          opacity: state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      <ThemedText type="small" themeColor={selected ? 'primaryForeground' : 'text'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.three,
    height: 40,
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
});
