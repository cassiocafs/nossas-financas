import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { listarMetas } from '@/api/metas';
import { ThemedText } from '@/components/themed-text';
import { MetaCard } from '@/components/metas/MetaCard';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { ordenarMetasHome } from '@/lib/metas';

const LIMITE = 3;

export function MetasResumoCard() {
  const router = useRouter();

  const { data: metas } = useQuery({
    queryKey: ['metas', 'home'],
    queryFn: () => listarMetas(false),
  });

  const top = metas ? ordenarMetasHome(metas).slice(0, LIMITE) : [];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Suas metas</ThemedText>
        <Pressable onPress={() => router.push('/metas?nova=1')} hitSlop={8}>
          <ThemedText type="smallBold" themeColor="primary">
            + Nova
          </ThemedText>
        </Pressable>
      </View>

      {metas && metas.length === 0 ? (
        <Card style={styles.vazio}>
          <ThemedText type="smallBold">Defina uma meta de economia</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Dê um objetivo ao seu dinheiro e acompanhe o progresso aqui.
          </ThemedText>
          <Pressable onPress={() => router.push('/metas?nova=1')} hitSlop={8}>
            <ThemedText type="smallBold" themeColor="primary">
              Criar minha primeira meta
            </ThemedText>
          </Pressable>
        </Card>
      ) : (
        <View style={styles.lista}>
          {top.map((meta) => (
            <MetaCard key={meta.id} meta={meta} onAbrir={() => router.push('/metas')} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vazio: { gap: Spacing.two, alignItems: 'flex-start' },
  lista: { gap: Spacing.three },
});
