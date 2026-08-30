import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  /** 0 a 1. */
  value: number;
  /** Cor do preenchimento. Padrão: amarelo (conquista). */
  color?: string;
  height?: number;
  accessibilityLabel?: string;
}

export function ProgressBar({ value, color, height = 10, accessibilityLabel }: ProgressBarProps) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={[styles.track, { backgroundColor: theme.surface, height, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: color ?? theme.warning,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: Radius.pill },
});
