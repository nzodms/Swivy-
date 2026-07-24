import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { colors, motion, radius } from '@/theme';

interface OnboardingProgressProps {
  step: number;
  totalSteps: number;
}

/** Barre de progression discrète de l'onboarding. */
export function OnboardingProgress({ step, totalSteps }: OnboardingProgressProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(step / totalSteps, motion.spring.enter);
  }, [step, totalSteps, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityLabel={`Étape ${step} sur ${totalSteps}`}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flex: 1,
    height: 4,
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
