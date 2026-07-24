import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useHaptics } from '@/hooks/useHaptics';
import { colors, minTouchTarget, motion, opacity, radius, shadows } from '@/theme';

interface IconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  bordered?: boolean;
  elevated?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Bouton icône circulaire — la brique des actions de swipe et des headers. */
export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  size = 48,
  iconSize = 22,
  color = colors.textPrimary,
  backgroundColor = colors.surface,
  bordered = true,
  elevated = false,
  disabled = false,
  style,
}: IconButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={Math.max(0, (minTouchTarget - size) / 2)}
      onPressIn={() => {
        scale.value = withSpring(0.92, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          backgroundColor,
        },
        bordered && styles.bordered,
        elevated && shadows.card,
        disabled && { opacity: opacity.disabled },
        animatedStyle,
        style,
      ]}
    >
      <Icon size={iconSize} color={color} strokeWidth={2.2} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
