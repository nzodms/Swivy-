import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText } from './AppText';
import { colors, motion, radius, spacing } from '@/theme';

interface PreferenceBarProps {
  label: string;
  /** Part ∈ [0, 1]. */
  share: number;
}

/** Barre de préférence de l'ADN esthétique (ex. "Japandi — 19 %"). */
export function PreferenceBar({ label, share }: PreferenceBarProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(Math.max(0.04, Math.min(1, share)), motion.spring.enter);
  }, [share, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const percent = Math.round(share * 100);

  return (
    <View style={styles.row} accessibilityLabel={`${label}: ${percent} pour cent`}>
      <View style={styles.labels}>
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
        <AppText variant="caption" style={styles.percent}>
          {percent} %
        </AppText>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xxs,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textPrimary,
  },
  percent: {
    color: colors.textSecondary,
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
