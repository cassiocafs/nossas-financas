import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: PressableProps['style'];
};

const HEIGHT: Record<ButtonSize, number> = { sm: 36, md: 48, lg: 52 };

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  icon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const inactive = disabled || loading;

  const variantStyle = {
    primary: { backgroundColor: theme.brandSurface, borderWidth: 0 },
    secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border },
    tertiary: { backgroundColor: 'transparent', borderWidth: 0 },
    ghost: { backgroundColor: 'transparent', borderWidth: 0 },
    destructive: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.destructive },
  }[variant];

  const textColor = {
    primary: theme.primaryForeground,
    secondary: theme.text,
    tertiary: theme.primary,
    ghost: theme.textSecondary,
    destructive: theme.destructive,
  }[variant];

  const textType = size === 'sm' ? 'label' : 'smallBold';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      style={(state) => [
        styles.base,
        { height: HEIGHT[size] },
        variantStyle,
        fullWidth && styles.fullWidth,
        { opacity: inactive ? 0.5 : 1, transform: [{ translateY: state.pressed ? 1 : 0 }] },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon ? <Feather name={icon} size={16} color={textColor} /> : null}
          <ThemedText type={textType} style={{ color: textColor }}>
            {title}
          </ThemedText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderRadius: Radius.button,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
});
