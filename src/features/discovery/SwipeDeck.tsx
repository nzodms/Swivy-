import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ProductSwipeCard } from './ProductSwipeCard';
import { SwipeBadge } from './SwipeBadge';
import { motion } from '@/theme';
import type { Product, SwipeAction } from '@/types';

interface SwipeDeckProps {
  /** Cartes à afficher, la première est au sommet. */
  products: Product[];
  compatibilityFor: (product: Product) => number;
  onSwipe: (product: Product, action: SwipeAction) => void;
  /** Absent = bouton info masqué sur les cartes (mode calibration). */
  onPressDetails?: (product: Product) => void;
}

export interface SwipeDeckHandle {
  /** Déclenche un swipe programmatique sur la carte du dessus (boutons). */
  swipeTop: (action: SwipeAction) => void;
}

const VISIBLE_CARDS = 3;
const EXIT_DURATION = 260;

/**
 * Pile de cartes swipables.
 * Geste physique crédible : translation + rotation légère,
 * badges de feedback, carte suivante déjà visible derrière.
 */
export const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(function SwipeDeck(
  { products, compatibilityFor, onSwipe, onPressDetails },
  ref,
) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isAnimatingOut = useSharedValue(false);

  const topProduct = products[0];

  const likeProgress = useDerivedValue(() => translateX.value / motion.swipeThreshold);
  const dislikeProgress = useDerivedValue(() => -translateX.value / motion.swipeThreshold);
  const superlikeProgress = useDerivedValue(() =>
    translateY.value < 0 && Math.abs(translateY.value) > Math.abs(translateX.value)
      ? -translateY.value / (motion.swipeThreshold * 1.15)
      : 0,
  );

  const commitSwipe = (action: SwipeAction) => {
    if (topProduct) onSwipe(topProduct, action);
    translateX.value = 0;
    translateY.value = 0;
    isAnimatingOut.value = false;
  };

  const animateOut = (action: SwipeAction) => {
    'worklet';
    if (isAnimatingOut.value) return;
    isAnimatingOut.value = true;
    const targetX = action === 'like' ? screenWidth * 1.3 : action === 'dislike' ? -screenWidth * 1.3 : 0;
    const targetY = action === 'superlike' ? -screenHeight : translateY.value * 0.4;
    translateX.value = withTiming(targetX, { duration: EXIT_DURATION });
    translateY.value = withTiming(targetY, { duration: EXIT_DURATION }, (finished) => {
      if (finished) runOnJS(commitSwipe)(action);
    });
  };

  useImperativeHandle(ref, () => ({
    swipeTop: (action: SwipeAction) => {
      // Petit élan avant la sortie pour garder un mouvement naturel.
      if (action === 'like') translateX.value = withTiming(40, { duration: 80 });
      if (action === 'dislike') translateX.value = withTiming(-40, { duration: 80 });
      if (action === 'superlike') translateY.value = withTiming(-40, { duration: 80 });
      animateOut(action);
    },
  }));

  const pan = Gesture.Pan()
    .enabled(topProduct !== undefined)
    .onChange((event) => {
      if (isAnimatingOut.value) return;
      translateX.value += event.changeX;
      translateY.value += event.changeY;
    })
    .onEnd((event) => {
      if (isAnimatingOut.value) return;
      const { swipeThreshold, swipeVelocityThreshold } = motion;
      const upIntent =
        translateY.value < -swipeThreshold * 1.15 || event.velocityY < -swipeVelocityThreshold;
      const horizontalIntent =
        Math.abs(translateX.value) > swipeThreshold ||
        Math.abs(event.velocityX) > swipeVelocityThreshold;

      if (upIntent && Math.abs(translateY.value) > Math.abs(translateX.value)) {
        animateOut('superlike');
      } else if (horizontalIntent) {
        animateOut(translateX.value > 0 || event.velocityX > 0 ? 'like' : 'dislike');
      } else {
        translateX.value = withSpring(0, motion.spring.settle);
        translateY.value = withSpring(0, motion.spring.settle);
      }
    });

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-screenWidth, 0, screenWidth], [-11, 0, 11])}deg` },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => {
    const drag = Math.min(
      1,
      (Math.abs(translateX.value) + Math.abs(translateY.value)) / (motion.swipeThreshold * 2),
    );
    return {
      transform: [
        { scale: interpolate(drag, [0, 1], [0.95, 1]) },
        { translateY: interpolate(drag, [0, 1], [14, 0]) },
      ],
      opacity: interpolate(drag, [0, 1], [0.9, 1]),
    };
  });

  const thirdCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 }, { translateY: 26 }],
    opacity: 0.55,
  }));

  const visible = products.slice(0, VISIBLE_CARDS);

  return (
    <View style={styles.stack}>
      {visible
        .map((product, index) => {
          if (index === 0) {
            return (
              <GestureDetector key={product.id} gesture={pan}>
                <Animated.View style={[styles.cardWrapper, topCardStyle]}>
                  <ProductSwipeCard
                    product={product}
                    compatibilityPercent={compatibilityFor(product)}
                    onPressDetails={onPressDetails ? () => onPressDetails(product) : undefined}
                  />
                  <SwipeBadge kind="like" progress={likeProgress} />
                  <SwipeBadge kind="dislike" progress={dislikeProgress} />
                  <SwipeBadge kind="superlike" progress={superlikeProgress} />
                </Animated.View>
              </GestureDetector>
            );
          }
          return (
            <Animated.View
              key={product.id}
              pointerEvents="none"
              // Les cartes d'arrière-plan sont invisibles pour l'accessibilité
              // (VoiceOver / TalkBack ne doivent lire que la carte du dessus).
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.cardWrapper, index === 1 ? nextCardStyle : thirdCardStyle]}
            >
              <ProductSwipeCard
                product={product}
                compatibilityPercent={compatibilityFor(product)}
              />
            </Animated.View>
          );
        })
        .reverse()}
    </View>
  );
});

const styles = StyleSheet.create({
  stack: {
    flex: 1,
  },
  cardWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
});
