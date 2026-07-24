import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { ProductGridCard } from './ProductGridCard';
import { screenPadding, spacing } from '@/theme';
import type { Product } from '@/types';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  compatibilityFor?: (product: Product) => number;
}

const CARD_WIDTH = 168;

/** Carrousel horizontal éditorial (écran "Pour toi"). */
export function ProductCarousel({
  title,
  subtitle,
  products,
  onProductPress,
  compatibilityFor,
}: ProductCarouselProps) {
  if (products.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + spacing.sm}
      >
        {products.map((product) => (
          <ProductGridCard
            key={product.id}
            product={product}
            onPress={() => onProductPress(product)}
            compatibilityPercent={compatibilityFor?.(product)}
            style={styles.card}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  header: {
    paddingHorizontal: screenPadding,
    gap: 2,
  },
  subtitle: {},
  scroll: {
    paddingHorizontal: screenPadding,
    gap: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
  },
});
