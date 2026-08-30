import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface IconButtonProps {
  icon: keyof typeof Feather.glyphMap;
  /** Rótulo acessível — obrigatório em botões só de ícone. */
  label: string;
  onPress: () => void;
  variant?: 'soft' | 'ghost';
  size?: number;
  disabled?: boolean;
  color?: string;
}

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'soft',
  size = 40,
  disabled,
  color,
}: IconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={(state) => [
        styles.base,
        {
          width: size,
          height: size,
          backgroundColor: variant === 'soft' ? theme.surface : 'transparent',
          opacity: disabled ? 0.5 : state.pressed ? 0.7 : 1,
        },
      ]}>
      <Feather name={icon} size={Math.round(size * 0.45)} color={color ?? theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
