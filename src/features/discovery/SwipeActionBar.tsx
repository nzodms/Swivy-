import { Heart, Layers, RotateCcw, Sparkles, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components';
import { colors, spacing } from '@/theme';

interface SwipeActionBarProps {
  /** Absent = bouton masqué (ex. pendant la calibration). */
  onUndo?: () => void;
  onDislike: () => void;
  /** Absent = bouton masqué (ex. pendant la calibration). */
  onSimilar?: () => void;
  onLike: () => void;
  onSuperlike: () => void;
  canUndo?: boolean;
  disabled: boolean;
}

/**
 * Actions sous la carte V2 — hiérarchie par la taille :
 * like (marque, plein) et dislike (graphite) en 56, le reste en 42.
 */
export function SwipeActionBar({
  onUndo,
  onDislike,
  onSimilar,
  onLike,
  onSuperlike,
  canUndo = false,
  disabled,
}: SwipeActionBarProps) {
  return (
    <View style={styles.row}>
      {onUndo ? (
        <IconButton
          icon={RotateCcw}
          onPress={onUndo}
          accessibilityLabel="Annuler le dernier swipe"
          size={42}
          iconSize={17}
          color={colors.textSecondary}
          disabled={!canUndo}
        />
      ) : null}
      <IconButton
        icon={X}
        onPress={onDislike}
        accessibilityLabel="Pas pour moi"
        size={56}
        iconSize={24}
        color={colors.dislike}
        disabled={disabled}
      />
      {onSimilar ? (
        <IconButton
          icon={Layers}
          onPress={onSimilar}
          accessibilityLabel="Voir des produits similaires"
          size={42}
          iconSize={17}
          color={colors.textSecondary}
          disabled={disabled}
        />
      ) : null}
      <IconButton
        icon={Heart}
        onPress={onLike}
        accessibilityLabel="J’aime"
        size={56}
        iconSize={24}
        color={colors.textInverse}
        backgroundColor={colors.accent}
        bordered={false}
        disabled={disabled}
      />
      <IconButton
        icon={Sparkles}
        onPress={onSuperlike}
        accessibilityLabel="Coup de cœur"
        size={42}
        iconSize={18}
        color={colors.copper}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xs,
  },
});
