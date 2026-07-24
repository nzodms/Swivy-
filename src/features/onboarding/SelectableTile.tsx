import { Image } from 'expo-image';
import { Check } from 'lucide-react-native';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText } from '@/components';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, motion, radius, spacing } from '@/theme';

interface SelectableTileProps {
  label: string;
  imageUri: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Tuile visuelle sélectionnable (pièces, catégories) — état actif premium. */
export function SelectableTile({ label, imageUri, selected, onPress, style }: SelectableTileProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPressIn={() => {
        scale.value = withSpring(0.96, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={[styles.tile, selected && styles.tileSelected, animatedStyle, style]}
    >
      <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" transition={180} cachePolicy="memory-disk" />
      <View style={[styles.labelBar, selected && styles.labelBarSelected]}>
        <AppText variant="caption" style={selected ? styles.labelSelected : styles.label} numberOfLines={1}>
          {label}
        </AppText>
        {selected ? <Check size={14} color={colors.accentDeep} strokeWidth={3} /> : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  tileSelected: {
    borderColor: colors.accent,
  },
  image: {
    width: '100%',
    aspectRatio: 1.35,
    backgroundColor: colors.surfaceMuted,
  },
  labelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  labelBarSelected: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.accentDeep,
  },
});
