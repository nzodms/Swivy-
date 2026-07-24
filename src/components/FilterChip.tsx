import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, minTouchTarget, radius, spacing } from '@/theme';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Puce de filtre / sélection — état actif sauge, jamais criard. */
export function FilterChip({ label, selected, onPress }: FilterChipProps) {
  const haptics = useHaptics();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      hitSlop={6}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={[styles.base, selected && styles.selected]}
    >
      <AppText
        variant="caption"
        style={[styles.label, selected && styles.labelSelected]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: Math.max(36, minTouchTarget - 8),
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.accentDeep,
  },
});
