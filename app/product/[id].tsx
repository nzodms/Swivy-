import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Heart, Ruler, Truck, X } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppButton,
  AppText,
  ErrorState,
  IconButton,
  MerchantBadge,
  ProductCarousel,
  ProductPrice,
  SignalLine,
  Skeleton,
  StyleTag,
} from '@/components';
import { track } from '@/features/analytics/track';
import { ImageGallery } from '@/features/products/ImageGallery';
import {
  compatibilityPercent,
  explainRecommendation,
  rawAffinity,
} from '@/features/recommendations';
import { affinityBreakdown } from '@/features/recommendations/scoring';
import { useCatalog, useProduct, useSimilarProducts } from '@/hooks/useProducts';
import { getMerchant } from '@/services/productsService';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import { colors, radius, screenPadding, shadows, spacing, zIndex } from '@/theme';
import { CATEGORY_LABELS, STYLE_LABELS, type Product } from '@/types';

/** Nom de base d'un produit décliné ("Canapé Aria — velours sauge" → "Canapé Aria"). */
function baseNameOf(name: string): string {
  return name.split(' — ')[0] ?? name;
}

/** Fiche produit V2 — le seul endroit où le score détaillé apparaît. */
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const { data: catalog } = useCatalog();
  const similar = useSimilarProducts(product, 8);

  const profile = useTasteStore((state) => state.profile);
  const isFavorite = useFavoritesStore((state) =>
    state.favorites.some((entry) => entry.productId === id),
  );
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const showToast = useToastStore((state) => state.show);

  const merchant = product ? getMerchant(product.merchantId) : undefined;
  const reason = useMemo(
    () => (product ? explainRecommendation(profile, product) : ''),
    [profile, product],
  );

  /** Déclinaisons du même produit (autres finitions). */
  const variants = useMemo(() => {
    if (!product || !catalog) return [];
    const base = baseNameOf(product.name);
    return catalog.filter((candidate) => candidate.id !== product.id && baseNameOf(candidate.name) === base);
  }, [product, catalog]);

  /** Alternatives moins chères, même esprit. */
  const cheaperAlternatives = useMemo(() => {
    if (!product || !catalog) return [];
    return catalog
      .filter(
        (candidate) =>
          candidate.id !== product.id &&
          candidate.category === product.category &&
          candidate.price < product.price * 0.85,
      )
      .sort((a, b) => rawAffinity(profile, b) - rawAffinity(profile, a))
      .slice(0, 6);
  }, [product, catalog, profile]);

  /** Décomposition du score — dimensions principales seulement. */
  const scoreDetails = useMemo(() => {
    if (!product) return [];
    return affinityBreakdown(profile, product)
      .filter((entry) => ['Styles', 'Couleurs', 'Matières', 'Catégorie'].includes(entry.dimension))
      .map((entry) => ({
        ...entry,
        // Contribution normalisée sur le poids de la dimension → part ∈ [0,1].
        share: Math.max(0, Math.min(1, 0.5 + (entry.contribution / entry.weight) * 0.5)),
      }));
  }, [profile, product]);

  useEffect(() => {
    if (!product) return;
    track('product_opened', {
      productId: product.id,
      score: compatibilityPercent(profile, product),
      reason,
      screen: 'product',
    });
    // Un seul événement par ouverture de fiche.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const toggleFavorite = () => {
    if (!product) return;
    if (isFavorite) {
      removeFavorite(product.id);
      showToast('Retiré des favoris', 'info');
    } else {
      addFavorite(product.id);
      showToast('Ajouté à tes favoris', 'success');
    }
  };

  const openMerchant = () => {
    if (!product) return;
    track('merchant_clicked', { productId: product.id, screen: 'product' });
    void WebBrowser.openBrowserAsync(product.url);
  };

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={[styles.loading, { paddingTop: insets.top + spacing.xl }]}>
          <Skeleton height={340} borderRadius={0} />
          <View style={styles.loadingBody}>
            <Skeleton height={20} width="40%" />
            <Skeleton height={28} width="80%" />
            <Skeleton height={16} width="60%" />
          </View>
        </View>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.root}>
        <ErrorState
          message="Ce produit est introuvable ou n’a pas pu être chargé."
          onRetry={() => {
            void refetch();
          }}
        />
      </View>
    );
  }

  const percent = compatibilityPercent(profile, product);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ImageGallery images={product.images} productName={product.name} />

        <View style={styles.body}>
          {/* Identité */}
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <AppText variant="micro" style={styles.brand}>
                {product.brand} · {CATEGORY_LABELS[product.category]}
              </AppText>
              <AppText variant="editorial">{product.name}</AppText>
              <View style={styles.priceRow}>
                <ProductPrice price={product.price} previousPrice={product.previousPrice} variant="heading" />
                <AppText
                  variant="caption"
                  style={product.inStock ? styles.inStock : styles.outOfStock}
                >
                  {product.inStock ? 'En stock' : 'Indisponible'}
                </AppText>
              </View>
            </View>
            <IconButton
              icon={Heart}
              onPress={toggleFavorite}
              accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              color={isFavorite ? colors.textInverse : colors.copper}
              backgroundColor={isFavorite ? colors.copper : colors.background}
              bordered={!isFavorite}
            />
          </View>

          {/* Variantes */}
          {variants.length > 0 ? (
            <View style={styles.variants}>
              <AppText variant="caption">Aussi disponible :</AppText>
              <View style={styles.variantRow}>
                {variants.map((variant: Product) => (
                  <AppText
                    key={variant.id}
                    variant="caption"
                    style={styles.variantLink}
                    accessibilityRole="link"
                    onPress={() =>
                      router.push({ pathname: '/product/[id]', params: { id: variant.id } })
                    }
                  >
                    {variant.name.split(' — ')[1] ?? variant.name}
                  </AppText>
                ))}
              </View>
            </View>
          ) : null}

          {/* Score détaillé — uniquement ici */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <AppText variant="subheading">{percent} % pour ton style</AppText>
            </View>
            <AppText variant="bodySmall">{reason}</AppText>
            <View style={styles.scoreBars}>
              {scoreDetails.map((entry) => (
                <View key={entry.dimension} style={styles.scoreBarRow}>
                  <AppText variant="micro" style={styles.scoreBarLabel}>
                    {entry.dimension}
                  </AppText>
                  <View style={styles.scoreBarTrack}>
                    <View style={[styles.scoreBarFill, { width: `${entry.share * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <AppText variant="body">{product.description}</AppText>

          {/* Style */}
          <View style={styles.tags}>
            {product.styles.slice(0, 2).map((style) => (
              <StyleTag key={style} label={STYLE_LABELS[style]} tone="accent" />
            ))}
            {product.shapes.slice(0, 1).map((shape) => (
              <StyleTag key={shape} label={shape} />
            ))}
          </View>

          {/* Caractéristiques */}
          <View style={styles.specCard}>
            <View style={styles.specRow}>
              <Ruler size={16} color={colors.textSecondary} strokeWidth={2} />
              <AppText variant="bodySmall">{product.dimensions}</AppText>
            </View>
            <View style={styles.specDivider} />
            <View style={styles.specLine}>
              <AppText variant="caption" style={styles.specLabel}>
                Matières
              </AppText>
              <AppText variant="bodySmall" style={styles.specValue}>
                {product.materials.join(', ')}
              </AppText>
            </View>
            <View style={styles.specLine}>
              <AppText variant="caption" style={styles.specLabel}>
                Couleurs
              </AppText>
              <AppText variant="bodySmall" style={styles.specValue}>
                {product.colors.join(', ')}
              </AppText>
            </View>
            {merchant?.shippingInfo ? (
              <>
                <View style={styles.specDivider} />
                <View style={styles.specRow}>
                  <Truck size={16} color={colors.textSecondary} strokeWidth={2} />
                  <AppText variant="bodySmall">{merchant.shippingInfo}</AppText>
                </View>
              </>
            ) : null}
            {merchant ? (
              <View style={styles.specRow}>
                <MerchantBadge name={merchant.name} />
              </View>
            ) : null}
          </View>
        </View>

        {cheaperAlternatives.length > 0 ? (
          <View style={styles.carouselBlock}>
            <View style={styles.carouselSignal}>
              <SignalLine text="Moins cher, même esprit" />
            </View>
            <ProductCarousel
              title="Alternatives"
              products={cheaperAlternatives}
              onProductPress={(candidate: Product) =>
                router.push({ pathname: '/product/[id]', params: { id: candidate.id } })
              }
            />
          </View>
        ) : null}

        <View style={styles.carouselBlock}>
          <ProductCarousel
            title="Dans le même esprit"
            products={similar}
            onProductPress={(candidate: Product) =>
              router.push({ pathname: '/product/[id]', params: { id: candidate.id } })
            }
          />
        </View>

        <View style={{ height: insets.bottom + 110 }} />
      </ScrollView>

      {/* Fermeture */}
      <View style={[styles.closeButton, { top: insets.top + spacing.sm }]}>
        <IconButton
          icon={X}
          onPress={() => router.back()}
          accessibilityLabel="Fermer la fiche produit"
          backgroundColor={colors.frost}
          bordered={false}
        />
      </View>

      {/* CTA marchand */}
      <View style={[styles.ctaBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppButton
          label={merchant ? `Voir chez ${merchant.name}` : 'Voir chez le marchand'}
          onPress={openMerchant}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    gap: spacing.lg,
  },
  loadingBody: {
    paddingHorizontal: screenPadding,
    gap: spacing.sm,
  },
  scroll: {
    paddingBottom: spacing.lg,
  },
  body: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  brand: {
    color: colors.textTertiary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  inStock: {
    color: colors.accent,
  },
  outOfStock: {
    color: colors.danger,
  },
  variants: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  variantLink: {
    color: colors.accentDeep,
    textDecorationLine: 'underline',
  },
  scoreCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreBars: {
    gap: 6,
    marginTop: spacing.xxs,
  },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreBarLabel: {
    width: 72,
    color: colors.accentDeep,
  },
  scoreBarTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(29, 74, 63, 0.15)',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: radius.xs,
    backgroundColor: colors.accent,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  specCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  specLine: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  specLabel: {
    width: 72,
    color: colors.textTertiary,
  },
  specValue: {
    flex: 1,
    color: colors.textPrimary,
  },
  specDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  carouselBlock: {
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  carouselSignal: {
    paddingHorizontal: screenPadding,
  },
  closeButton: {
    position: 'absolute',
    right: screenPadding,
    zIndex: zIndex.header,
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.sticky,
  },
});
