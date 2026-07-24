import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, spacing, type TypographyVariant } from '@/theme';

interface ProductPriceProps {
  price: number;
  previousPrice?: number;
  variant?: TypographyVariant;
  onDark?: boolean;
}

function formatEuro(value: number): string {
  return `${value.toLocaleString('fr-FR')} €`;
}

/** Prix produit, avec ancien prix barré en cas de promotion. */
export function ProductPrice({ price, previousPrice, variant = 'subheading', onDark = false }: ProductPriceProps) {
  return (
    <View style={styles.row}>
      <AppText variant={variant} style={onDark ? styles.onDark : undefined}>
        {formatEuro(price)}
      </AppText>
      {previousPrice !== undefined && previousPrice > price ? (
        <AppText variant="caption" style={[styles.previous, onDark && styles.previousOnDark]}>
          {formatEuro(previousPrice)}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  onDark: {
    color: colors.textInverse,
  },
  previous: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  previousOnDark: {
    color: 'rgba(255,255,255,0.75)',
  },
});
