import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Info } from 'lucide-react-native';
import { memo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, CompatibilityBadge, MerchantBadge, ProductPrice, StyleTag } from '@/components';
import { getMerchant } from '@/services/productsService';
import { colors, radius, shadows, spacing } from '@/theme';
import { BADGE_LABELS, CATEGORY_LABELS, STYLE_LABELS, type Product } from '@/types';

interface ProductSwipeCardProps {
  product: Product;
  compatibilityPercent: number;
  /** Absent = bouton info masqué (calibration, cartes d'arrière-plan). */
  onPressDetails?: () => void;
}

const IMAGE_PLACEHOLDER = { blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' } as const;

/**
 * Grande carte produit du feed de découverte.
 * Image plein cadre, dégradé bas très léger, informations lisibles.
 * Mémoïsée : une carte ne se re-rend que si son produit ou son score change
 * (le geste de swipe n'anime que le conteneur, jamais ce contenu).
 */
export const ProductSwipeCard = memo(
  function ProductSwipeCard({ product, compatibilityPercent, onPressDetails }: ProductSwipeCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const merchant = getMerchant(product.merchantId);
  const primaryStyle = product.styles[0];
  const imageCount = product.images.length;

  const goTo = (direction: -1 | 1) => {
    setImageIndex((current) => (current + direction + imageCount) % imageCount);
  };

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.images[imageIndex] ?? product.images[0] }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={220}
        placeholder={IMAGE_PLACEHOLDER}
        cachePolicy="memory-disk"
        accessibilityLabel={`Photo de ${product.name}`}
      />

      {/* Zones tactiles gauche/droite pour changer de photo. */}
      {imageCount > 1 ? (
        <View style={styles.tapZones} pointerEvents="box-none">
          <Pressable
            accessibilityLabel="Photo précédente"
            style={styles.tapZone}
            onPress={() => goTo(-1)}
          />
          <View style={styles.tapZoneCenter} pointerEvents="none" />
          <Pressable
            accessibilityLabel="Photo suivante"
            style={styles.tapZone}
            onPress={() => goTo(1)}
          />
        </View>
      ) : null}

      {/* Pagination d'images. */}
      {imageCount > 1 ? (
        <View style={styles.pagination} pointerEvents="none">
          {product.images.map((uri, index) => (
            <View key={uri} style={[styles.dot, index === imageIndex && styles.dotActive]} />
          ))}
        </View>
      ) : null}

      <View style={styles.topRow} pointerEvents="none">
        <CompatibilityBadge percent={compatibilityPercent} onImage />
        {product.badges[0] ? (
          <View style={styles.productBadge}>
            <AppText variant="micro" style={styles.productBadgeText}>
              {BADGE_LABELS[product.badges[0]]}
            </AppText>
          </View>
        ) : null}
      </View>

      <LinearGradient
        colors={[colors.scrimTransparent, colors.scrimBottom]}
        style={styles.scrim}
        pointerEvents="none"
      />

      <View style={styles.info} pointerEvents="box-none">
        <View style={styles.infoText} pointerEvents="none">
          <AppText variant="caption" style={styles.brand}>
            {product.brand}
          </AppText>
          <AppText variant="heading" style={styles.name} numberOfLines={2}>
            {product.name}
          </AppText>
          <ProductPrice price={product.price} previousPrice={product.previousPrice} onDark />
          <View style={styles.tags}>
            <StyleTag label={CATEGORY_LABELS[product.category]} />
            {primaryStyle ? <StyleTag label={STYLE_LABELS[primaryStyle]} tone="accent" /> : null}
          </View>
          {merchant ? <MerchantBadge name={merchant.name} onDark /> : null}
        </View>
        {onPressDetails ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voir la fiche produit"
            hitSlop={10}
            onPress={onPressDetails}
            style={styles.infoButton}
          >
            <Info size={20} color={colors.textPrimary} strokeWidth={2.2} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
  },
  (previous, next) =>
    previous.product.id === next.product.id &&
    previous.compatibilityPercent === next.compatibilityPercent,
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    ...shadows.card,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  tapZoneCenter: {
    flex: 1.4,
  },
  pagination: {
    position: 'absolute',
    top: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  dot: {
    width: 18,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: colors.textInverse,
  },
  topRow: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productBadge: {
    backgroundColor: colors.frost,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  productBadgeText: {
    color: colors.textPrimary,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
  },
  info: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    gap: spacing.xxs,
  },
  brand: {
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'none',
  },
  name: {
    color: colors.textInverse,
  },
  tags: {
    flexDirection: 'row',
    gap: spacing.xxs,
    marginTop: 2,
    marginBottom: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.frost,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
