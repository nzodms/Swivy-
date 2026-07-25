import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  AppScreen,
  AppText,
  EmptyState,
  ProductCarousel,
  ProductGridCard,
  SignalLine,
  Skeleton,
  TasteSpectrum,
} from '@/components';
import {
  buildStyleSummary,
  rawAffinity,
  similarProducts,
} from '@/features/recommendations';
import { useLikedProducts } from '@/hooks/useLikedProducts';
import { useCatalog } from '@/hooks/useProducts';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, radius, screenPadding, spacing } from '@/theme';
import { STYLE_LABELS, priceBandOf, type Product } from '@/types';

/** Écran "Pour toi" V2 : destination éditoriale, composition mixte. */
export default function ForYouScreen() {
  const router = useRouter();
  const { data: catalog, isLoading } = useCatalog();
  const profile = useTasteStore((state) => state.profile);
  const selections = useTasteStore((state) => state.selections);
  const swipes = useTasteStore((state) => state.swipes);
  const likedProducts = useLikedProducts();

  const summary = useMemo(() => buildStyleSummary(profile, likedProducts), [profile, likedProducts]);

  const content = useMemo(() => {
    if (!catalog) return null;
    const dislikedIds = new Set(
      swipes.filter((swipe) => swipe.action === 'dislike').map((swipe) => swipe.productId),
    );
    const likedIds = new Set(likedProducts.map((product) => product.id));
    const pool = catalog.filter((product) => !dislikedIds.has(product.id) && !likedIds.has(product.id));
    const byAffinity = [...pool].sort((a, b) => rawAffinity(profile, b) - rawAffinity(profile, a));

    const hero = byAffinity[0] ?? null;
    const newMatches = byAffinity.slice(1, 5);

    // Alternative moins chère au dernier like.
    const lastLiked = likedProducts[0] ?? null;
    const cheaperAlt = lastLiked
      ? (byAffinity.find(
          (product) =>
            product.category === lastLiked.category && product.price < lastLiked.price * 0.8,
        ) ?? null)
      : null;

    const inBudget = selections.priceBand
      ? byAffinity.filter((product) => priceBandOf(product.price) === selections.priceBand).slice(0, 8)
      : byAffinity.slice(5, 13);

    const superliked = likedProducts.find((product) =>
      swipes.some((swipe) => swipe.productId === product.id && swipe.action === 'superlike'),
    );
    const crushEcho = superliked ? similarProducts(superliked, pool, 8) : [];

    const newest = [...pool]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, 8);

    return { hero, newMatches, lastLiked, cheaperAlt, inBudget, crushEcho, newest };
  }, [catalog, profile, selections, swipes, likedProducts]);

  const openProduct = (product: Product) =>
    router.push({ pathname: '/product/[id]', params: { id: product.id } });

  const dominantStyle = summary.dominantStyles[0];

  return (
    <AppScreen padded={false} withBottomNav>
      {isLoading || !content ? (
        <View style={styles.skeletons}>
          <Skeleton height={280} borderRadius={radius.lg} />
          <Skeleton height={20} width="55%" />
          <View style={styles.skeletonRow}>
            <Skeleton height={180} style={styles.skeletonCard} borderRadius={radius.sm} />
            <Skeleton height={180} style={styles.skeletonCard} borderRadius={radius.sm} />
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
          {/* Hero éditorial personnalisé */}
          {content.hero ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Sélection du jour : ${content.hero.name}`}
              onPress={() => content.hero && openProduct(content.hero)}
              style={styles.hero}
            >
              <Image
                source={{ uri: content.hero.images[0] }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={220}
                cachePolicy="memory-disk"
              />
              <LinearGradient
                colors={[colors.scrimTransparent, colors.scrimBottom]}
                style={styles.heroScrim}
              />
              <View style={styles.heroContent}>
                <AppText variant="micro" style={styles.heroEyebrow}>
                  Sélection du jour
                </AppText>
                <AppText variant="editorialTitle" style={styles.heroTitle} numberOfLines={2}>
                  {dominantStyle
                    ? `Pour ton œil ${STYLE_LABELS[dominantStyle.style].toLowerCase()}`
                    : 'Pour toi, aujourd’hui'}
                </AppText>
                <AppText variant="caption" style={styles.heroProduct} numberOfLines={1}>
                  {content.hero.brand} · {content.hero.name} · {content.hero.price.toLocaleString('fr-FR')} €
                </AppText>
              </View>
            </Pressable>
          ) : null}

          {/* Nouveaux matchs — grille */}
          {content.newMatches.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="heading" style={styles.sectionTitle}>
                Nouveaux matchs
              </AppText>
              <View style={styles.grid}>
                {content.newMatches.map((product) => (
                  <ProductGridCard
                    key={product.id}
                    product={product}
                    onPress={() => openProduct(product)}
                    style={styles.gridCard}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {/* Duo : ton like + l'alternative moins chère */}
          {content.lastLiked && content.cheaperAlt ? (
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <SignalLine
                  text={`Moins cher que « ${content.lastLiked.name.split(' — ')[0] ?? content.lastLiked.name} »`}
                />
              </View>
              <View style={styles.grid}>
                <ProductGridCard
                  product={content.lastLiked}
                  onPress={() => content.lastLiked && openProduct(content.lastLiked)}
                  style={styles.gridCard}
                />
                <ProductGridCard
                  product={content.cheaperAlt}
                  onPress={() => content.cheaperAlt && openProduct(content.cheaperAlt)}
                  style={styles.gridCard}
                />
              </View>
            </View>
          ) : null}

          {/* Spectre de goût compact */}
          <View style={styles.spectrumBlock}>
            <View style={styles.spectrumHeader}>
              <AppText variant="heading">Ton style en ce moment</AppText>
              <AppText
                variant="caption"
                style={styles.spectrumLink}
                accessibilityRole="link"
                onPress={() => router.push('/(tabs)/profile')}
              >
                Détails
              </AppText>
            </View>
            <TasteSpectrum summary={summary} />
          </View>

          <ProductCarousel
            title="Dans ton budget"
            products={content.inBudget}
            onProductPress={openProduct}
          />

          {content.crushEcho.length > 0 ? (
            <ProductCarousel
              title="Même esprit que ton coup de cœur"
              products={content.crushEcho}
              onProductPress={openProduct}
            />
          ) : null}

          <ProductCarousel title="Nouveautés" products={content.newest} onProductPress={openProduct} />
        </ScrollView>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.xl,
    paddingBottom: 110,
  },
  hero: {
    marginHorizontal: screenPadding,
    marginTop: spacing.xs,
    height: 300,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  heroContent: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    gap: 4,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
  },
  heroTitle: {
    color: colors.textInverse,
  },
  heroProduct: {
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    paddingHorizontal: screenPadding,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: screenPadding,
  },
  gridCard: {
    width: '47%',
    flexGrow: 1,
  },
  spectrumBlock: {
    marginHorizontal: screenPadding,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  spectrumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spectrumLink: {
    color: colors.accentDeep,
    textDecorationLine: 'underline',
  },
  skeletons: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.xs,
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
