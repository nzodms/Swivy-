import { Heart } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { AppText } from './AppText';
import { ProductPrice } from './ProductPrice';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, radius, spacing } from '@/theme';
import type { Product } from '@/types';

interface ProductGridCardProps {
  product: Product;
  onPress: () => void;
  onLongPress?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  style?: ViewStyle;
}

const IMAGE_PLACEHOLDER = { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' } as const;

/**
 * Carte produit compacte V2 — dense, sans pourcentage.
 * Une baisse de prix est signalée en cuivre (donnée réelle du catalogue).
 */
export function ProductGridCard({
  product,
  onPress,
  onLongPress,
  onToggleFavorite,
  isFavorite = false,
  style,
}: ProductGridCardProps) {
  const haptics = useHaptics();
  const discount =
    product.previousPrice !== undefined && product.previousPrice > product.price
      ? Math.round((1 - product.price / product.previousPrice) * 100)
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.brand}, ${product.price} euros`}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={180}
          placeholder={IMAGE_PLACEHOLDER}
          cachePolicy="memory-disk"
        />
        {discount !== null ? (
          <View style={styles.discount}>
            <AppText variant="micro" style={styles.discountText}>
              −{discount} %
            </AppText>
          </View>
        ) : null}
        {onToggleFavorite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            hitSlop={8}
            onPress={() => {
              haptics.light();
              onToggleFavorite();
            }}
            style={styles.heart}
          >
            <Heart
              size={15}
              color={isFavorite ? colors.copper : colors.textPrimary}
              fill={isFavorite ? colors.copper : 'transparent'}
              strokeWidth={2.2}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.info}>
        <AppText variant="micro" numberOfLines={1} style={styles.brand}>
          {product.brand}
        </AppText>
        <AppText variant="caption" numberOfLines={1} style={styles.name}>
          {product.name}
        </AppText>
        <ProductPrice price={product.price} previousPrice={product.previousPrice} variant="caption" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  imageWrap: {
    borderRadius: radius.sm,
    overflow: 'hidden',
    aspectRatio: 0.85,
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discount: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.copper,
    borderRadius: radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: colors.textInverse,
  },
  heart: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.frost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingTop: 6,
    gap: 1,
  },
  brand: {
    color: colors.textTertiary,
  },
  name: {
    color: colors.textPrimary,
  },
});
