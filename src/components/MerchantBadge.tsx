import { Store } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, spacing } from '@/theme';

interface MerchantBadgeProps {
  name: string;
  onDark?: boolean;
}

/** Indique la provenance marchande d'un produit. */
export function MerchantBadge({ name, onDark = false }: MerchantBadgeProps) {
  const color = onDark ? 'rgba(255,255,255,0.85)' : colors.textSecondary;
  return (
    <View style={styles.row} accessibilityLabel={`Vendu par ${name}`}>
      <Store size={13} color={color} strokeWidth={2} />
      <AppText variant="micro" style={{ color }}>
        {name}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
});
