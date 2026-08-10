import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: PressableProps['style'];
};

export function Button({ title, variant = 'primary', loading, disabled, style, ...rest }: ButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;

  const variantStyle = {
    primary: { backgroundColor: theme.primary, borderWidth: 0 },
    secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
    ghost: { backgroundColor: 'transparent', borderWidth: 0 },
    destructive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.destructive },
  }[variant];

  const textColor = {
    primary: theme.primaryForeground,
    secondary: theme.text,
    ghost: theme.textSecondary,
    destructive: theme.destructive,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      style={(state) => [
        styles.base,
        variantStyle,
        { opacity: inactive ? 0.5 : state.pressed ? 0.85 : 1 },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <ThemedText type="smallBold" style={{ color: textColor }}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
