import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChipProps = Omit<PressableProps, 'style'> & {
  label: string;
  selected?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: PressableProps['style'];
};

export function Chip({ label, selected, icon, style, disabled, ...rest }: ChipProps) {
  const theme = useTheme();

  const fg = selected ? theme.primary : theme.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      style={(state) => [
        styles.base,
        {
          backgroundColor: selected ? theme.primarySoft : theme.card,
          borderColor: selected ? theme.primary : theme.border,
          opacity: disabled ? 0.5 : state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {icon ? <Feather name={icon} size={14} color={fg} /> : null}
      <ThemedText type="label" style={{ color: fg }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    height: 38,
    borderWidth: 1,
    borderRadius: Radius.pill,
  },
});
