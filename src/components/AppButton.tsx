import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText } from './AppText';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, minTouchTarget, motion, opacity, radius, spacing } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Bouton principal de l'application, avec micro-réaction à la pression. */
export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityHint,
}: AppButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isInactive = disabled || loading;

  const textColor =
    variant === 'primary' ? 'textInverse' : variant === 'accent' ? 'textInverse' : 'textPrimary';

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPressIn={() => {
        scale.value = withSpring(0.97, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      onPress={() => {
        haptics.light();
        onPress();
      }}
      style={[styles.base, styles[variant], isInactive && styles.disabled, animatedStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'accent' ? colors.textInverse : colors.textPrimary} />
      ) : (
        <AppText variant="bodyMedium" color={textColor} style={styles.label}>
          {label}
        </AppText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: Math.max(52, minTouchTarget),
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.textPrimary,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: opacity.disabled,
  },
  label: {
    fontSize: 16,
  },
});
