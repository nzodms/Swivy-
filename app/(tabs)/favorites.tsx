import { useRouter } from 'expo-router';
import { Heart, Share2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Platform, ScrollView, Share, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppScreen,
  EmptyState,
  FilterChip,
  IconButton,
  ProductGridCard,
} from '@/components';
import { compatibilityPercent } from '@/features/recommendations';
import { productById } from '@/mocks/products';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import { screenPadding, spacing } from '@/theme';
import { CATEGORY_LABELS, type CategorySlug, type Product } from '@/types';

type SortMode = 'recent' | 'price' | 'compatibility';

const SORT_LABELS: Record<SortMode, string> = {
  recent: 'Récents',
  price: 'Prix',
  compatibility: 'Compatibilité',
};

interface FavoriteProduct {
  product: Product;
  at: number;
  superlike: boolean;
}

/** Wishlist : les produits aimés, filtrables et triables. */
export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const profile = useTasteStore((state) => state.profile);
  const showToast = useToastStore((state) => state.show);

  const [categoryFilter, setCategoryFilter] = useState<CategorySlug | 'all' | 'crushes'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const favoriteProducts = useMemo<FavoriteProduct[]>(
    () =>
      favorites
        .map((entry) => {
          const product = productById.get(entry.productId);
          return product ? { product, at: entry.at, superlike: entry.superlike } : null;
        })
        .filter((entry): entry is FavoriteProduct => entry !== null),
    [favorites],
  );

  const availableCategories = useMemo(
    () => [...new Set(favoriteProducts.map((entry) => entry.product.category))],
    [favoriteProducts],
  );

  const visible = useMemo(() => {
    let list = favoriteProducts;
    if (categoryFilter === 'crushes') {
      list = list.filter((entry) => entry.superlike);
    } else if (categoryFilter !== 'all') {
      list = list.filter((entry) => entry.product.category === categoryFilter);
    }
    const sorted = [...list];
    if (sortMode === 'recent') sorted.sort((a, b) => b.at - a.at);
    if (sortMode === 'price') sorted.sort((a, b) => a.product.price - b.product.price);
    if (sortMode === 'compatibility') {
      sorted.sort(
        (a, b) => compatibilityPercent(profile, b.product) - compatibilityPercent(profile, a.product),
      );
    }
    return sorted;
  }, [favoriteProducts, categoryFilter, sortMode, profile]);

  const shareWishlist = async () => {
    const lines = visible
      .slice(0, 12)
      .map((entry) => `• ${entry.product.name} (${entry.product.price} €) — ${entry.product.url}`);
    const message = `Ma wishlist déco sur Swivy :\n\n${lines.join('\n')}`;
    try {
      await Share.share({ message });
    } catch {
      // Web sans API de partage : copie dans le presse-papiers.
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        showToast('Wishlist copiée dans le presse-papiers', 'success');
      } else {
        showToast('Partage indisponible sur cet appareil', 'error');
      }
    }
  };

  return (
    <AppScreen padded={false} withBottomNav>
      <View style={styles.headerWrap}>
        <AppHeader
          title="Favoris"
          subtitle={
            favoriteProducts.length > 0
              ? `${favoriteProducts.length} produit${favoriteProducts.length > 1 ? 's' : ''} sauvegardé${favoriteProducts.length > 1 ? 's' : ''}`
              : undefined
          }
          trailing={
            favoriteProducts.length > 0 ? (
              <IconButton
                icon={Share2}
                onPress={() => {
                  void shareWishlist();
                }}
                accessibilityLabel="Partager ma wishlist"
                size={44}
                iconSize={19}
              />
            ) : undefined
          }
        />
      </View>

      {favoriteProducts.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Tes prochains coups de cœur apparaîtront ici."
          message="Chaque produit aimé dans le feed est sauvegardé automatiquement dans ta wishlist."
          actionLabel="Découvrir des produits"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <>
          <View style={styles.filters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <FilterChip label="Tous" selected={categoryFilter === 'all'} onPress={() => setCategoryFilter('all')} />
              <FilterChip
                label="Coups de cœur"
                selected={categoryFilter === 'crushes'}
                onPress={() => setCategoryFilter('crushes')}
              />
              {availableCategories.map((category) => (
                <FilterChip
                  key={category}
                  label={CATEGORY_LABELS[category]}
                  selected={categoryFilter === category}
                  onPress={() => setCategoryFilter(category)}
                />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                <FilterChip
                  key={mode}
                  label={`Tri : ${SORT_LABELS[mode]}`}
                  selected={sortMode === mode}
                  onPress={() => setSortMode(mode)}
                />
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={visible}
            keyExtractor={(entry) => entry.product.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductGridCard
                product={item.product}
                onPress={() =>
                  router.push({ pathname: '/product/[id]', params: { id: item.product.id } })
                }
                isFavorite
                onToggleFavorite={() => {
                  removeFavorite(item.product.id);
                  showToast('Retiré des favoris', 'info');
                }}
                compatibilityPercent={compatibilityPercent(profile, item.product)}
                style={styles.gridCard}
              />
            )}
          />
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: screenPadding,
  },
  filters: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  chipRow: {
    paddingHorizontal: screenPadding,
    gap: spacing.xs,
  },
  grid: {
    paddingHorizontal: screenPadding,
    paddingBottom: 120,
    gap: spacing.md,
  },
  gridRow: {
    gap: spacing.md,
  },
  gridCard: {
    flex: 1,
  },
});
