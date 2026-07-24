import { Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

interface CompatibilityBadgeProps {
  percent: number;
  /** Variante posée sur une photo (fond givré). */
  onImage?: boolean;
}

/** "92 % pour ton style" — la signature du personal shopper Swivy. */
export function CompatibilityBadge({ percent, onImage = false }: CompatibilityBadgeProps) {
  return (
    <View
      accessibilityLabel={`Compatibilité ${percent} pour cent avec ton style`}
      style={[styles.base, onImage ? styles.onImage : styles.onSurface]}
    >
      <Sparkles size={13} color={onImage ? colors.textPrimary : colors.accentDeep} strokeWidth={2.4} />
      <AppText variant="micro" style={onImage ? styles.textOnImage : styles.textOnSurface}>
        {percent} % pour ton style
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  onImage: {
    backgroundColor: colors.frost,
  },
  onSurface: {
    backgroundColor: colors.accentSoft,
  },
  textOnImage: {
    color: colors.textPrimary,
  },
  textOnSurface: {
    color: colors.accentDeep,
  },
});
