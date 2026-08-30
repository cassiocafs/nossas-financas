import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';

import { corCategoria, iconeCategoria } from '@/lib/categoria-visual';

interface CategoryIconProps {
  categoriaId: string | null | undefined;
  size?: number;
}

/** Círculo com a cor estável da categoria (fg + tint de fundo) e um glifo de interface. */
export function CategoryIcon({ categoriaId, size = 40 }: CategoryIconProps) {
  const { fg, bg } = corCategoria(categoriaId);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Feather name={iconeCategoria(categoriaId)} size={Math.round(size * 0.44)} color={fg} />
    </View>
  );
}
