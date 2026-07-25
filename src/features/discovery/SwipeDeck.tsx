import { forwardRef, useEffect, useImperativeHandle } from 'react';
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
import { RevealCard } from './RevealCard';
import { SwipeBadge } from './SwipeBadge';
import { useHaptics } from '@/hooks/useHaptics';
import { motion } from '@/theme';
import type { SwipeAction } from '@/types';
import type { DeckItem } from './deckTypes';

interface SwipeDeckProps {
  /** Éléments à afficher, le premier est au sommet. */
  items: DeckItem[];
  onSwipe: (item: DeckItem, action: SwipeAction) => void;
  /** Absent = bouton info masqué sur les cartes (mode calibration). */
  onPressDetails?: (item: DeckItem) => void;
}

export interface SwipeDeckHandle {
  /** Déclenche un swipe programmatique sur la carte du dessus (boutons). */
  swipeTop: (action: SwipeAction) => void;
}

const VISIBLE_CARDS = 3;

/**
 * Pile de cartes swipables V2.
 * Geste calibré (docs/MOTION_SYSTEM.md) : résistance verticale, haptique au
 * franchissement du seuil, arrivée en ressort de chaque nouvelle carte.
 */
export const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(function SwipeDeck(
  { items, onSwipe, onPressDetails },
  ref,
) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const haptics = useHaptics();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isAnimatingOut = useSharedValue(false);
  const thresholdCrossed = useSharedValue(false);
  /** Progression d'entrée de la carte du dessus (0 → 1). */
  const enterProgress = useSharedValue(1);

  const topItem = items[0];

  // Arrivée en ressort de chaque nouvelle carte du dessus.
  const topItemId = topItem?.id;
  useEffect(() => {
    if (!topItemId) return;
    enterProgress.value = 0;
    enterProgress.value = withSpring(1, motion.spring.enter);
  }, [topItemId, enterProgress]);

  const likeProgress = useDerivedValue(() => translateX.value / motion.swipeThreshold);
  const dislikeProgress = useDerivedValue(() => -translateX.value / motion.swipeThreshold);
  const superlikeProgress = useDerivedValue(() =>
    translateY.value < 0 && Math.abs(translateY.value) > Math.abs(translateX.value)
      ? -translateY.value / motion.swipeUpThreshold
      : 0,
  );

  const commitSwipe = (action: SwipeAction) => {
    if (topItem) onSwipe(topItem, action);
    translateX.value = 0;
    translateY.value = 0;
    isAnimatingOut.value = false;
    thresholdCrossed.value = false;
  };

  const animateOut = (action: SwipeAction) => {
    'worklet';
    if (isAnimatingOut.value) return;
    isAnimatingOut.value = true;
    const targetX = action === 'like' ? screenWidth * 1.3 : action === 'dislike' ? -screenWidth * 1.3 : 0;
    const targetY = action === 'superlike' ? -screenHeight : translateY.value * 0.4;
    translateX.value = withTiming(targetX, { duration: motion.swipeExitDuration });
    translateY.value = withTiming(targetY, { duration: motion.swipeExitDuration }, (finished) => {
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

  const notifyThreshold = () => {
    haptics.selection();
  };

  const pan = Gesture.Pan()
    .enabled(topItem !== undefined)
    .onChange((event) => {
      if (isAnimatingOut.value) return;
      translateX.value += event.changeX;
      // Résistance verticale : le superlike se mérite.
      translateY.value += event.changeY * 0.9;

      const overH = Math.abs(translateX.value) > motion.swipeThreshold;
      const overV = -translateY.value > motion.swipeUpThreshold;
      if ((overH || overV) && !thresholdCrossed.value) {
        thresholdCrossed.value = true;
        runOnJS(notifyThreshold)();
      } else if (!overH && !overV && thresholdCrossed.value) {
        thresholdCrossed.value = false;
      }
    })
    .onEnd((event) => {
      if (isAnimatingOut.value) return;
      const upIntent =
        -translateY.value > motion.swipeUpThreshold ||
        event.velocityY < -motion.swipeVelocityThreshold;
      const horizontalIntent =
        Math.abs(translateX.value) > motion.swipeThreshold ||
        Math.abs(event.velocityX) > motion.swipeVelocityThreshold;

      if (upIntent && Math.abs(translateY.value) > Math.abs(translateX.value)) {
        animateOut('superlike');
      } else if (horizontalIntent) {
        animateOut(translateX.value > 0 || event.velocityX > 0 ? 'like' : 'dislike');
      } else {
        translateX.value = withSpring(0, motion.spring.settle);
        translateY.value = withSpring(0, motion.spring.settle);
        thresholdCrossed.value = false;
      }
    });

  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value + interpolate(enterProgress.value, [0, 1], [10, 0]) },
      { rotate: `${interpolate(translateX.value, [-screenWidth, 0, screenWidth], [-10, 0, 10])}deg` },
      { scale: interpolate(enterProgress.value, [0, 1], [0.965, 1]) },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => {
    const drag = Math.min(
      1,
      (Math.abs(translateX.value) + Math.abs(translateY.value)) / (motion.swipeThreshold * 2),
    );
    return {
      transform: [
        { scale: interpolate(drag, [0, 1], [0.955, 1]) },
        { translateY: interpolate(drag, [0, 1], [12, 0]) },
      ],
      opacity: interpolate(drag, [0, 1], [0.92, 1]),
    };
  });

  const thirdCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.91 }, { translateY: 22 }],
    opacity: 0.4,
  }));

  const renderCard = (item: DeckItem, isTop: boolean) => {
    if (item.kind === 'reveal') {
      return <RevealCard reveal={item.reveal} />;
    }
    return (
      <ProductSwipeCard
        product={item.product}
        presentation={item.presentation}
        signal={item.signal}
        isTop={isTop}
        onPressDetails={isTop && onPressDetails ? () => onPressDetails(item) : undefined}
      />
    );
  };

  const visible = items.slice(0, VISIBLE_CARDS);

  return (
    <View style={styles.stack}>
      {visible
        .map((item, index) => {
          if (index === 0) {
            return (
              <GestureDetector key={item.id} gesture={pan}>
                <Animated.View style={[styles.cardWrapper, topCardStyle]}>
                  {renderCard(item, true)}
                  <SwipeBadge kind="like" progress={likeProgress} />
                  <SwipeBadge kind="dislike" progress={dislikeProgress} />
                  <SwipeBadge kind="superlike" progress={superlikeProgress} />
                </Animated.View>
              </GestureDetector>
            );
          }
          return (
            <Animated.View
              key={item.id}
              pointerEvents="none"
              // Les cartes d'arrière-plan sont invisibles pour l'accessibilité
              // (VoiceOver / TalkBack ne doivent lire que la carte du dessus).
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.cardWrapper, index === 1 ? nextCardStyle : thirdCardStyle]}
            >
              {renderCard(item, false)}
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
