import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Heart, Ruler, Truck, X } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppButton,
  AppText,
  CompatibilityBadge,
  ErrorState,
  IconButton,
  MerchantBadge,
  ProductCarousel,
  ProductPrice,
  Skeleton,
  StyleTag,
} from '@/components';
import { ImageGallery } from '@/features/products/ImageGallery';
import { compatibilityPercent, explainRecommendation } from '@/features/recommendations';
import { useProduct, useSimilarProducts } from '@/hooks/useProducts';
import { getMerchant } from '@/services/productsService';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import { colors, radius, screenPadding, spacing, zIndex } from '@/theme';
import { CATEGORY_LABELS, STYLE_LABELS, type Product } from '@/types';

/** Fiche produit en modal plein écran. */
export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: product, isLoading, isError, refetch } = useProduct(id);
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
    void WebBrowser.openBrowserAsync(product.url);
  };

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={[styles.loading, { paddingTop: insets.top + spacing.xl }]}>
          <Skeleton height={360} borderRadius={0} />
          <View style={styles.loadingBody}>
            <Skeleton height={22} width="40%" />
            <Skeleton height={30} width="80%" />
            <Skeleton height={18} width="60%" />
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

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ImageGallery images={product.images} productName={product.name} />

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <AppText variant="caption" style={styles.brand}>
                {product.brand}
              </AppText>
              <AppText variant="title">{product.name}</AppText>
            </View>
            <IconButton
              icon={Heart}
              onPress={toggleFavorite}
              accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              color={isFavorite ? colors.textInverse : colors.superlike}
              backgroundColor={isFavorite ? colors.superlike : colors.surface}
              bordered={!isFavorite}
            />
          </View>

          <View style={styles.priceRow}>
            <ProductPrice price={product.price} previousPrice={product.previousPrice} variant="heading" />
            <CompatibilityBadge percent={compatibilityPercent(profile, product)} />
          </View>

          <View style={styles.reasonCard}>
            <AppText variant="caption" style={styles.reasonTitle}>
              Pourquoi ce produit
            </AppText>
            <AppText variant="bodySmall" style={styles.reasonText}>
              {reason}
            </AppText>
          </View>

          <AppText variant="body">{product.description}</AppText>

          <View style={styles.tags}>
            <StyleTag label={CATEGORY_LABELS[product.category]} />
            {product.styles.map((style) => (
              <StyleTag key={style} label={STYLE_LABELS[style]} tone="accent" />
            ))}
            {product.colors.map((color) => (
              <StyleTag key={color} label={color} />
            ))}
            {product.materials.map((material) => (
              <StyleTag key={material} label={material} />
            ))}
          </View>

          <View style={styles.specCard}>
            <View style={styles.specRow}>
              <Ruler size={17} color={colors.textSecondary} strokeWidth={2} />
              <AppText variant="bodySmall">{product.dimensions}</AppText>
            </View>
            {merchant?.shippingInfo ? (
              <View style={styles.specRow}>
                <Truck size={17} color={colors.textSecondary} strokeWidth={2} />
                <AppText variant="bodySmall">{merchant.shippingInfo}</AppText>
              </View>
            ) : null}
            {merchant ? (
              <View style={styles.specRow}>
                <MerchantBadge name={merchant.name} />
              </View>
            ) : null}
          </View>
        </View>

        <ProductCarousel
          title="Dans le même esprit"
          products={similar}
          onProductPress={(candidate: Product) =>
            router.push({ pathname: '/product/[id]', params: { id: candidate.id } })
          }
          compatibilityFor={(candidate) => compatibilityPercent(profile, candidate)}
        />

        <View style={{ height: insets.bottom + 120 }} />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  brand: {
    color: colors.textTertiary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reasonCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xxs,
  },
  reasonTitle: {
    color: colors.accentDeep,
  },
  reasonText: {
    color: colors.textPrimary,
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
    gap: spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    backgroundColor: colors.frost,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
