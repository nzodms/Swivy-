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
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  compatibilityPercent?: number;
  style?: ViewStyle;
}

const IMAGE_PLACEHOLDER = { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' } as const;

/** Carte produit compacte pour grilles et carrousels. */
export function ProductGridCard({
  product,
  onPress,
  onToggleFavorite,
  isFavorite = false,
  compatibilityPercent,
  style,
}: ProductGridCardProps) {
  const haptics = useHaptics();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${product.brand}, ${product.price} euros`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={IMAGE_PLACEHOLDER}
          cachePolicy="memory-disk"
        />
        {compatibilityPercent !== undefined ? (
          <View style={styles.compatPill}>
            <AppText variant="micro" style={styles.compatText}>
              {compatibilityPercent} %
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
              size={16}
              color={isFavorite ? colors.superlike : colors.textPrimary}
              fill={isFavorite ? colors.superlike : 'transparent'}
              strokeWidth={2.2}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.info}>
        <AppText variant="caption" numberOfLines={1} style={styles.brand}>
          {product.brand}
        </AppText>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {product.name}
        </AppText>
        <ProductPrice price={product.price} previousPrice={product.previousPrice} variant="caption" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.92,
  },
  imageWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    aspectRatio: 0.82,
    backgroundColor: colors.surfaceMuted,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  compatPill: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.frost,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  compatText: {
    color: colors.textPrimary,
  },
  heart: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.frost,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: 2,
  },
  brand: {
    color: colors.textTertiary,
  },
});
