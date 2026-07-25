import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Info } from 'lucide-react-native';
import { memo, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, MerchantBadge, ProductPrice, SignalLine, StyleTag } from '@/components';
import { getMerchant } from '@/services/productsService';
import { colors, radius, shadows, spacing } from '@/theme';
import { CATEGORY_LABELS, type Product } from '@/types';
import type { CardPresentation } from './deckTypes';
import type { CardSignal } from '@/features/recommendations';

interface ProductSwipeCardProps {
  product: Product;
  presentation: CardPresentation;
  signal: CardSignal | null;
  /** Absent = bouton info masqué (calibration, cartes d'arrière-plan). */
  onPressDetails?: () => void;
  /** Vrai uniquement pour la carte du dessus (active la mini-story). */
  isTop?: boolean;
}

const IMAGE_PLACEHOLDER = { blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' } as const;
const STORY_INTERVAL_MS = 2200;

/**
 * Carte produit du feed — trois formats pour casser la répétition :
 * - situation : image pleine, informations sur scrim ;
 * - packshot : image sur surface claire, informations sur panneau blanc ;
 * - story : trois images en défilement automatique, jauge segmentée.
 */
export const ProductSwipeCard = memo(
  function ProductSwipeCard({
    product,
    presentation,
    signal,
    onPressDetails,
    isTop = false,
  }: ProductSwipeCardProps) {
    const [imageIndex, setImageIndex] = useState(0);
    const merchant = getMerchant(product.merchantId);
    const imageCount = product.images.length;
    const isStory = presentation === 'story' && imageCount > 1;

    // Mini-story : défilement automatique tant que la carte est au sommet.
    useEffect(() => {
      if (!isStory || !isTop) return;
      const timer = setInterval(() => {
        setImageIndex((current) => (current + 1) % imageCount);
      }, STORY_INTERVAL_MS);
      return () => clearInterval(timer);
    }, [isStory, isTop, imageCount]);

    const goTo = (direction: -1 | 1) => {
      setImageIndex((current) => (current + direction + imageCount) % imageCount);
    };

    const image = (
      <Image
        source={{ uri: product.images[imageIndex] ?? product.images[0] }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={200}
        placeholder={IMAGE_PLACEHOLDER}
        cachePolicy="memory-disk"
        accessibilityLabel={`Photo de ${product.name}`}
      />
    );

    const paginationDots =
      imageCount > 1 && !isStory ? (
        <View style={styles.pagination} pointerEvents="none">
          {product.images.map((uri, index) => (
            <View key={uri} style={[styles.dot, index === imageIndex && styles.dotActive]} />
          ))}
        </View>
      ) : null;

    const storyBars = isStory ? (
      <View style={styles.storyBars} pointerEvents="none">
        {product.images.map((uri, index) => (
          <View key={uri} style={[styles.storyBar, index === imageIndex && styles.storyBarActive]} />
        ))}
      </View>
    ) : null;

    const tapZones =
      imageCount > 1 ? (
        <View style={styles.tapZones} pointerEvents="box-none">
          <Pressable accessibilityLabel="Photo précédente" style={styles.tapZone} onPress={() => goTo(-1)} />
          <View style={styles.tapZoneCenter} pointerEvents="none" />
          <Pressable accessibilityLabel="Photo suivante" style={styles.tapZone} onPress={() => goTo(1)} />
        </View>
      ) : null;

    const infoButton = onPressDetails ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voir la fiche produit"
        hitSlop={10}
        onPress={onPressDetails}
        style={styles.infoButton}
      >
        <Info size={19} color={colors.textPrimary} strokeWidth={2.2} />
      </Pressable>
    ) : null;

    if (presentation === 'packshot') {
      return (
        <View style={[styles.card, styles.packshotCard]}>
          <View style={styles.packshotImageArea}>
            {image}
            {tapZones}
            {paginationDots}
            {signal ? (
              <View style={styles.signalOverlay} pointerEvents="none">
                <SignalLine text={signal.text} tone={signal.tone} onImage />
              </View>
            ) : null}
          </View>
          <View style={styles.packshotInfo}>
            <View style={styles.packshotTextBlock}>
              <AppText variant="micro" style={styles.packshotBrand}>
                {product.brand}
              </AppText>
              <AppText variant="heading" numberOfLines={1}>
                {product.name}
              </AppText>
              <View style={styles.packshotMetaRow}>
                <ProductPrice price={product.price} previousPrice={product.previousPrice} variant="subheading" />
                <StyleTag label={CATEGORY_LABELS[product.category]} />
              </View>
              {merchant ? <MerchantBadge name={merchant.name} /> : null}
            </View>
            {infoButton}
          </View>
        </View>
      );
    }

    // situation & story : image pleine + scrim bas.
    return (
      <View style={styles.card}>
        {image}
        {tapZones}
        {storyBars}
        {paginationDots}

        {signal ? (
          <View style={styles.signalOverlay} pointerEvents="none">
            <SignalLine text={signal.text} tone={signal.tone} onImage />
          </View>
        ) : null}

        <LinearGradient
          colors={[colors.scrimTransparent, colors.scrimBottom]}
          style={styles.scrim}
          pointerEvents="none"
        />

        <View style={styles.info} pointerEvents="box-none">
          <View style={styles.infoText} pointerEvents="none">
            <AppText variant="micro" style={styles.brandOnImage}>
              {product.brand} · {CATEGORY_LABELS[product.category]}
            </AppText>
            <AppText variant="heading" style={styles.nameOnImage} numberOfLines={2}>
              {product.name}
            </AppText>
            <View style={styles.priceRow}>
              <ProductPrice price={product.price} previousPrice={product.previousPrice} onDark />
              {merchant ? <MerchantBadge name={merchant.name} onDark /> : null}
            </View>
          </View>
          {infoButton}
        </View>
      </View>
    );
  },
  (previous, next) =>
    previous.product.id === next.product.id &&
    previous.presentation === next.presentation &&
    previous.isTop === next.isTop &&
    previous.signal?.key === next.signal?.key,
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  packshotCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packshotImageArea: {
    flex: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  packshotInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  packshotTextBlock: {
    flex: 1,
    gap: 3,
  },
  packshotBrand: {
    color: colors.textTertiary,
  },
  packshotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
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
    width: 16,
    height: 3,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: colors.textInverse,
  },
  storyBars: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  storyBar: {
    flex: 1,
    height: 3,
    borderRadius: radius.xs,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  storyBarActive: {
    backgroundColor: colors.textInverse,
  },
  signalOverlay: {
    position: 'absolute',
    top: spacing.lg + spacing.xs,
    left: spacing.md,
    right: spacing.md,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
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
    gap: 3,
  },
  brandOnImage: {
    color: 'rgba(255,255,255,0.8)',
  },
  nameOnImage: {
    color: colors.textInverse,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginTop: 2,
  },
  infoButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.frost,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
