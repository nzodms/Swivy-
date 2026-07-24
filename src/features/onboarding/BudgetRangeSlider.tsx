import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { AppText } from '@/components';
import { colors, radius, spacing } from '@/theme';

interface BudgetRangeSliderProps {
  min: number;
  max: number;
  step: number;
  initialMin: number;
  initialMax: number;
  onChange: (min: number, max: number) => void;
}

const THUMB_SIZE = 28;

/**
 * Range slider à deux poignées pour affiner le budget.
 * Facultatif : les options rapides restent le chemin principal.
 */
export function BudgetRangeSlider({
  min,
  max,
  step,
  initialMin,
  initialMax,
  onChange,
}: BudgetRangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [values, setValues] = useState({ low: initialMin, high: initialMax });

  const usable = Math.max(1, trackWidth - THUMB_SIZE);
  const lowX = useSharedValue(((initialMin - min) / (max - min)) * usable);
  const highX = useSharedValue(((initialMax - min) / (max - min)) * usable);

  const positionToValue = (position: number): number => {
    const ratio = Math.min(1, Math.max(0, position / usable));
    const raw = min + ratio * (max - min);
    return Math.round(raw / step) * step;
  };

  const report = (lowPos: number, highPos: number) => {
    const low = positionToValue(lowPos);
    const high = positionToValue(highPos);
    setValues({ low, high });
    onChange(low, high);
  };

  const lowPan = Gesture.Pan().onChange((event) => {
    lowX.value = Math.min(highX.value - THUMB_SIZE / 2, Math.max(0, lowX.value + event.changeX));
    runOnJS(report)(lowX.value, highX.value);
  });

  const highPan = Gesture.Pan().onChange((event) => {
    highX.value = Math.max(lowX.value + THUMB_SIZE / 2, Math.min(usable, highX.value + event.changeX));
    runOnJS(report)(lowX.value, highX.value);
  });

  const lowThumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: lowX.value }] }));
  const highThumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: highX.value }] }));
  const rangeStyle = useAnimatedStyle(() => ({
    left: lowX.value + THUMB_SIZE / 2,
    width: Math.max(0, highX.value - lowX.value),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <AppText variant="caption">Affiner : {values.low} €</AppText>
        <AppText variant="caption">
          {values.high >= max ? `${max} € et plus` : `${values.high} €`}
        </AppText>
      </View>
      <View
        style={styles.trackArea}
        onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      >
        <View style={styles.track} />
        <Animated.View style={[styles.range, rangeStyle]} />
        <GestureDetector gesture={lowPan}>
          <Animated.View
            style={[styles.thumb, lowThumbStyle]}
            accessibilityRole="adjustable"
            accessibilityLabel={`Budget minimum ${values.low} euros`}
          />
        </GestureDetector>
        <GestureDetector gesture={highPan}>
          <Animated.View
            style={[styles.thumb, highThumbStyle]}
            accessibilityRole="adjustable"
            accessibilityLabel={`Budget maximum ${values.high} euros`}
          />
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackArea: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
  },
  track: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  range: {
    position: 'absolute',
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
  },
});
