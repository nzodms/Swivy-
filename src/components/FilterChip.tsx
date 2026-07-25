import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, radius, spacing } from '@/theme';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Chip de filtre V2 — rayon 10, sélection cyprès, hauteur 34. */
export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const haptics = useHaptics();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={8}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={({ pressed }) => [styles.base, selected && styles.selected, pressed && styles.pressed]}
    >
      <AppText variant="caption" style={selected ? styles.labelSelected : styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.accentDeep,
  },
});
