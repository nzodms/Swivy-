import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, ErrorState, IconButton, LoadingState, ProductGridCard } from '@/components';
import { track } from '@/features/analytics/track';
import { useProduct, useSimilarProducts } from '@/hooks/useProducts';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { colors, screenPadding, spacing } from '@/theme';

/** "Plus de produits comme celui-ci" — grille de similaires. */
export default function SimilarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const similar = useSimilarProducts(product, 12);
  const favorites = useFavoritesStore((state) => state.favorites);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  useEffect(() => {
    if (id) track('similar_product_opened', { productId: id, screen: 'similar' });
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.root}>
        <LoadingState label="Recherche de produits similaires…" />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.root}>
        <ErrorState
          message="Impossible de charger les produits similaires."
          onRetry={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="heading">Dans le même esprit</AppText>
          <AppText variant="caption" numberOfLines={1}>
            que « {product.name} »
          </AppText>
        </View>
        <IconButton icon={X} onPress={() => router.back()} accessibilityLabel="Fermer" size={40} iconSize={18} />
      </View>

      <FlatList
        data={similar}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isFavorite = favorites.some((entry) => entry.productId === item.id);
          return (
            <ProductGridCard
              product={item}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
              isFavorite={isFavorite}
              onToggleFavorite={() => (isFavorite ? removeFavorite(item.id) : addFavorite(item.id))}
              style={styles.gridCard}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  grid: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  gridRow: {
    gap: spacing.md,
  },
  gridCard: {
    flex: 1,
  },
});
