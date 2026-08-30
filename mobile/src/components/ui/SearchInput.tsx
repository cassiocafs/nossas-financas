import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchInputProps = Omit<TextInputProps, 'style'> & {
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchInput({ value, onChangeText, placeholder = 'Buscar', ...rest }: SearchInputProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Feather name="search" size={16} color={theme.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        style={[styles.input, { color: theme.text }]}
        {...rest}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Limpar busca">
          <Feather name="x" size={16} color={theme.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.input,
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
});
