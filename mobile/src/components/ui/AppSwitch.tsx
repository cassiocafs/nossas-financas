import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Palette, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface AppSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

/** Linha com rótulo à esquerda e switch à direita. Ligado = verde da marca. */
export function AppSwitch({ value, onValueChange, label, hint, disabled }: AppSwitchProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {label ? (
        <View style={styles.texts}>
          <ThemedText type="label">{label}</ThemedText>
          {hint ? (
            <ThemedText type="small" themeColor="textSecondary">
              {hint}
            </ThemedText>
          ) : null}
        </View>
      ) : null}
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: theme.primary, false: Palette.neutral300 }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={Palette.neutral300}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  texts: { flex: 1, gap: 2 },
});
