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
}

const CARD_WIDTH = 150;

/** Carrousel horizontal éditorial. */
export function ProductCarousel({ title, subtitle, products, onProductPress }: ProductCarouselProps) {
  if (products.length === 0) return null;
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
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
  scroll: {
    paddingHorizontal: screenPadding,
    gap: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
  },
});
