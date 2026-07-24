import { StyleSheet, View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { AppText } from '@/components';
import { colors, radius, spacing, zIndex } from '@/theme';

type BadgeKind = 'like' | 'dislike' | 'superlike';

interface SwipeBadgeProps {
  kind: BadgeKind;
  /** Opacité pilotée par le geste (0 → 1). */
  progress: SharedValue<number>;
}

const CONFIG: Record<BadgeKind, { label: string; color: string; rotate: string }> = {
  like: { label: 'J’aime', color: colors.like, rotate: '-8deg' },
  dislike: { label: 'Pas pour moi', color: colors.dislike, rotate: '8deg' },
  superlike: { label: 'Coup de cœur', color: colors.superlike, rotate: '0deg' },
};

/** Étiquette de feedback qui apparaît pendant le geste de swipe. */
export function SwipeBadge({ kind, progress }: SwipeBadgeProps) {
  const config = CONFIG[kind];
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, progress.value)),
    transform: [{ scale: 0.9 + Math.min(1, Math.max(0, progress.value)) * 0.1 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        kind === 'like' && styles.likePosition,
        kind === 'dislike' && styles.dislikePosition,
        kind === 'superlike' && styles.superlikePosition,
        animatedStyle,
      ]}
    >
      <View style={[styles.badge, { borderColor: config.color, transform: [{ rotate: config.rotate }] }]}>
        <AppText variant="subheading" style={{ color: config.color }}>
          {config.label}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: spacing.xl,
    zIndex: zIndex.badge,
  },
  likePosition: {
    left: spacing.lg,
  },
  dislikePosition: {
    right: spacing.lg,
  },
  superlikePosition: {
    alignSelf: 'center',
    top: undefined,
    bottom: spacing.huge,
  },
  badge: {
    borderWidth: 2.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.frost,
  },
});
