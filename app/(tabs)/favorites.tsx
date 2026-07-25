import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, LayoutGrid, Rows3, Search, Share2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import {
  AppScreen,
  AppText,
  EmptyState,
  FilterChip,
  IconButton,
  ProductGridCard,
  ProductPrice,
} from '@/components';
import { compatibilityPercent } from '@/features/recommendations';
import { productById } from '@/mocks/products';
import { getMerchant } from '@/services/productsService';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import { colors, fontFamily, radius, screenPadding, spacing } from '@/theme';
import { CATEGORY_LABELS, type CategorySlug, type Product } from '@/types';

type SortMode = 'recent' | 'price' | 'compatibility';
type ViewMode = 'grid' | 'list';

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

/** Wishlist V2 : grille ou liste informative, recherche, filtres, tri. */
export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const profile = useTasteStore((state) => state.profile);
  const showToast = useToastStore((state) => state.show);

  const [categoryFilter, setCategoryFilter] = useState<CategorySlug | 'all' | 'crushes'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [query, setQuery] = useState('');

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
    if (categoryFilter === 'crushes') list = list.filter((entry) => entry.superlike);
    else if (categoryFilter !== 'all') {
      list = list.filter((entry) => entry.product.category === categoryFilter);
    }
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      list = list.filter(
        (entry) =>
          entry.product.name.toLowerCase().includes(q) ||
          entry.product.brand.toLowerCase().includes(q),
      );
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
  }, [favoriteProducts, categoryFilter, sortMode, query, profile]);

  const priceDrops = useMemo(
    () =>
      favoriteProducts.filter(
        (entry) =>
          entry.product.previousPrice !== undefined &&
          entry.product.previousPrice > entry.product.price,
      ).length,
    [favoriteProducts],
  );

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

  const openProduct = (product: Product) =>
    router.push({ pathname: '/product/[id]', params: { id: product.id } });

  const removeWithToast = (product: Product) => {
    removeFavorite(product.id);
    showToast('Retiré des favoris', 'info');
  };

  const renderListRow = ({ item }: { item: FavoriteProduct }) => {
    const merchant = getMerchant(item.product.merchantId);
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.product.name}
        onPress={() => openProduct(item.product)}
        style={({ pressed }) => [styles.listRow, pressed && styles.listRowPressed]}
      >
        <Image
          source={{ uri: item.product.images[0] }}
          style={styles.listThumb}
          contentFit="cover"
          transition={160}
          cachePolicy="memory-disk"
        />
        <View style={styles.listInfo}>
          <AppText variant="micro" style={styles.listBrand}>
            {item.product.brand}
            {merchant ? ` · ${merchant.name}` : ''}
          </AppText>
          <AppText variant="bodyMedium" numberOfLines={1}>
            {item.product.name}
          </AppText>
          <View style={styles.listMeta}>
            <ProductPrice
              price={item.product.price}
              previousPrice={item.product.previousPrice}
              variant="caption"
            />
            {!item.product.inStock ? (
              <AppText variant="micro" style={styles.unavailable}>
                Indisponible
              </AppText>
            ) : null}
          </View>
        </View>
        <IconButton
          icon={Heart}
          onPress={() => removeWithToast(item.product)}
          accessibilityLabel="Retirer des favoris"
          size={38}
          iconSize={16}
          color={colors.copper}
        />
      </Pressable>
    );
  };

  return (
    <AppScreen padded={false} withBottomNav>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title" accessibilityRole="header">
            Favoris
          </AppText>
          {favoriteProducts.length > 0 ? (
            <AppText variant="caption">
              {favoriteProducts.length} produit{favoriteProducts.length > 1 ? 's' : ''}
              {priceDrops > 0
                ? ` · ${priceDrops} baisse${priceDrops > 1 ? 's' : ''} de prix`
                : ''}
            </AppText>
          ) : null}
        </View>
        {favoriteProducts.length > 0 ? (
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'grid' ? Rows3 : LayoutGrid}
              onPress={() => setViewMode((mode) => (mode === 'grid' ? 'list' : 'grid'))}
              accessibilityLabel={viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
              size={40}
              iconSize={17}
            />
            <IconButton
              icon={Share2}
              onPress={() => {
                void shareWishlist();
              }}
              accessibilityLabel="Partager ma wishlist"
              size={40}
              iconSize={17}
            />
          </View>
        ) : null}
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
          {/* Recherche */}
          <View style={styles.searchWrap}>
            <Search size={15} color={colors.textTertiary} strokeWidth={2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Chercher un produit ou une marque"
              placeholderTextColor={colors.textTertiary}
              style={styles.searchInput}
              accessibilityLabel="Rechercher dans les favoris"
            />
          </View>

          <View style={styles.filters}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
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
              <View style={styles.chipDivider} />
              {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
                <FilterChip
                  key={mode}
                  label={SORT_LABELS[mode]}
                  selected={sortMode === mode}
                  onPress={() => setSortMode(mode)}
                />
              ))}
            </ScrollView>
          </View>

          {viewMode === 'grid' ? (
            <FlatList
              key="grid"
              data={visible}
              keyExtractor={(entry) => entry.product.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              contentContainerStyle={styles.grid}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <ProductGridCard
                  product={item.product}
                  onPress={() => openProduct(item.product)}
                  isFavorite
                  onToggleFavorite={() => removeWithToast(item.product)}
                  style={styles.gridCard}
                />
              )}
            />
          ) : (
            <FlatList
              key="list"
              data={visible}
              keyExtractor={(entry) => entry.product.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={renderListRow}
              ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            />
          )}
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: screenPadding,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: screenPadding,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: 40,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  filters: {
    paddingBottom: spacing.sm,
  },
  chipRow: {
    paddingHorizontal: screenPadding,
    gap: spacing.xs,
    alignItems: 'center',
  },
  chipDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xxs,
  },
  grid: {
    paddingHorizontal: screenPadding,
    paddingBottom: 110,
    gap: spacing.md,
  },
  gridRow: {
    gap: spacing.md,
  },
  gridCard: {
    flex: 1,
  },
  list: {
    paddingHorizontal: screenPadding,
    paddingBottom: 110,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  listRowPressed: {
    opacity: 0.85,
  },
  listThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  listInfo: {
    flex: 1,
    gap: 1,
  },
  listBrand: {
    color: colors.textTertiary,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unavailable: {
    color: colors.danger,
  },
  listSeparator: {
    height: 1,
    backgroundColor: colors.border,
  },
});
