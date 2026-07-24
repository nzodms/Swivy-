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
 * Actions sous la carte — interprétation Swivy, volontairement
 * éloignée des codes visuels de Tinder : boutons sobres, hiérarchie
 * par la taille, accent porté sur like et coup de cœur.
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
          size={46}
          iconSize={19}
          color={colors.textSecondary}
          disabled={!canUndo}
        />
      ) : null}
      <IconButton
        icon={X}
        onPress={onDislike}
        accessibilityLabel="Pas pour moi"
        size={58}
        iconSize={26}
        color={colors.dislike}
        disabled={disabled}
        elevated
      />
      {onSimilar ? (
        <IconButton
          icon={Layers}
          onPress={onSimilar}
          accessibilityLabel="Voir des produits similaires"
          size={46}
          iconSize={19}
          color={colors.textSecondary}
          disabled={disabled}
        />
      ) : null}
      <IconButton
        icon={Heart}
        onPress={onLike}
        accessibilityLabel="J’aime"
        size={58}
        iconSize={26}
        color={colors.textInverse}
        backgroundColor={colors.like}
        bordered={false}
        disabled={disabled}
        elevated
      />
      <IconButton
        icon={Sparkles}
        onPress={onSuperlike}
        accessibilityLabel="Coup de cœur"
        size={46}
        iconSize={20}
        color={colors.superlike}
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
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
});
