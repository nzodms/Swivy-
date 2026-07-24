import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppScreen,
  AppText,
  EmptyState,
  ProductCarousel,
  Skeleton,
} from '@/components';
import { StyleDnaCard } from '@/features/profile/StyleDnaCard';
import {
  buildStyleSummary,
  compatibilityPercent,
  rawAffinity,
  similarProducts,
} from '@/features/recommendations';
import { useLikedProducts } from '@/hooks/useLikedProducts';
import { useCatalog } from '@/hooks/useProducts';
import { useTasteStore } from '@/stores/tasteStore';
import { screenPadding, spacing } from '@/theme';
import { priceBandOf, type Product } from '@/types';

/** Écran "Pour toi" : sélections éditoriales personnalisées. */
export default function ForYouScreen() {
  const router = useRouter();
  const { data: catalog, isLoading } = useCatalog();
  const profile = useTasteStore((state) => state.profile);
  const selections = useTasteStore((state) => state.selections);
  const swipes = useTasteStore((state) => state.swipes);
  const likedProducts = useLikedProducts();

  const summary = useMemo(() => buildStyleSummary(profile, likedProducts), [profile, likedProducts]);

  const sections = useMemo(() => {
    if (!catalog) return null;
    const dislikedIds = new Set(
      swipes.filter((swipe) => swipe.action === 'dislike').map((swipe) => swipe.productId),
    );
    const likedIds = new Set(likedProducts.map((product) => product.id));
    const pool = catalog.filter((product) => !dislikedIds.has(product.id) && !likedIds.has(product.id));

    const byAffinity = [...pool].sort((a, b) => rawAffinity(profile, b) - rawAffinity(profile, a));

    const daily = byAffinity.slice(0, 10);

    const inBudget = selections.priceBand
      ? byAffinity.filter((product) => priceBandOf(product.price) === selections.priceBand).slice(0, 10)
      : [];

    const superliked = likedProducts.filter((product) =>
      swipes.some((swipe) => swipe.productId === product.id && swipe.action === 'superlike'),
    );
    const sameAsCrushes =
      superliked.length > 0
        ? similarProducts(superliked[0] as Product, pool, 10)
        : [];

    const hiddenGems = byAffinity.filter((product) => product.popularity < 0.6).slice(0, 10);

    const newest = [...pool]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 10);

    return { daily, inBudget, sameAsCrushes, hiddenGems, newest };
  }, [catalog, profile, selections, swipes, likedProducts]);

  const openProduct = (product: Product) =>
    router.push({ pathname: '/product/[id]', params: { id: product.id } });

  const compatFor = (product: Product) => compatibilityPercent(profile, product);

  return (
    <AppScreen padded={false} withBottomNav>
      <View style={styles.headerWrap}>
        <AppHeader title="Pour toi" subtitle="Des sélections qui suivent ton œil" />
      </View>

      {isLoading || !sections ? (
        <View style={styles.skeletons}>
          <Skeleton height={120} borderRadius={24} />
          <Skeleton height={22} width="55%" />
          <View style={styles.skeletonRow}>
            <Skeleton height={200} style={styles.skeletonCard} borderRadius={20} />
            <Skeleton height={200} style={styles.skeletonCard} borderRadius={20} />
          </View>
        </View>
      ) : swipes.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Ton feed personnel arrive"
          message="Commence à swiper dans Découvrir : tes sélections apparaîtront ici, taillées pour ton style."
          actionLabel="Aller swiper"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.dnaSection}>
            <AppText variant="heading" style={styles.dnaTitle}>
              Ton style en ce moment
            </AppText>
            <StyleDnaCard summary={summary} compact />
          </View>

          <ProductCarousel
            title="Sélection du jour"
            subtitle="Le meilleur de ton profil, aujourd’hui"
            products={sections.daily}
            onProductPress={openProduct}
            compatibilityFor={compatFor}
          />
          {sections.inBudget.length > 0 ? (
            <ProductCarousel
              title="Dans ton budget"
              products={sections.inBudget}
              onProductPress={openProduct}
              compatibilityFor={compatFor}
            />
          ) : null}
          {sections.sameAsCrushes.length > 0 ? (
            <ProductCarousel
              title="Même style que tes coups de cœur"
              products={sections.sameAsCrushes}
              onProductPress={openProduct}
              compatibilityFor={compatFor}
            />
          ) : null}
          <ProductCarousel
            title="Pépites moins connues"
            subtitle="Encore peu vues, très toi"
            products={sections.hiddenGems}
            onProductPress={openProduct}
            compatibilityFor={compatFor}
          />
          <ProductCarousel
            title="Nouveautés"
            products={sections.newest}
            onProductPress={openProduct}
            compatibilityFor={compatFor}
          />
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerWrap: {
    paddingHorizontal: screenPadding,
  },
  scroll: {
    gap: spacing.xl,
    paddingBottom: 120,
  },
  dnaSection: {
    paddingHorizontal: screenPadding,
    gap: spacing.sm,
  },
  dnaTitle: {},
  skeletons: {
    paddingHorizontal: screenPadding,
    gap: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  skeletonCard: {
    flex: 1,
  },
});
