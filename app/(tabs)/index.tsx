import { useRouter } from 'expo-router';
import { Compass, SlidersHorizontal } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import {
  AppScreen,
  AppText,
  EmptyState,
  ErrorState,
  IconButton,
  Skeleton,
} from '@/components';
import { SwipeActionBar } from '@/features/discovery/SwipeActionBar';
import { SwipeDeck, type SwipeDeckHandle } from '@/features/discovery/SwipeDeck';
import { useSwipeDeck } from '@/features/discovery/useSwipeDeck';
import { useTasteStore } from '@/stores/tasteStore';
import { colors, motion, radius, spacing } from '@/theme';

/** Nombre de signaux pour un profil considéré comme mûr. */
const MATURE_SIGNALS = 60;

/** Jauge de compréhension — fine, discrète, progresse par paliers réels. */
function UnderstandingGauge() {
  const signalCount = useTasteStore((state) => state.profile.signalCount);
  const share = Math.min(1, signalCount / MATURE_SIGNALS);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(share, motion.spring.enter);
  }, [share, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.max(3, progress.value * 100)}%` }));

  const label =
    share >= 1
      ? 'Profil mûr'
      : share >= 0.5
        ? 'Ton style se précise'
        : share >= 0.15
          ? 'Swivy apprend tes goûts'
          : 'Swipe pour affiner ton style';

  return (
    <View accessibilityLabel={`Compréhension du style : ${Math.round(share * 100)} pour cent`}>
      <AppText variant="caption">{label}</AppText>
      <View style={styles.gaugeTrack}>
        <Animated.View style={[styles.gaugeFill, fillStyle]} />
      </View>
    </View>
  );
}

/** Écran principal : le feed de découverte par swipe. */
export default function DiscoverScreen() {
  const router = useRouter();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const { items, isLoading, isError, refetch, swipe, undo, canUndo, exhausted } = useSwipeDeck();
  const resetAll = useTasteStore((state) => state.resetAll);

  const topItem = items[0];
  const topProductId = topItem?.kind === 'product' ? topItem.id : null;

  return (
    <AppScreen withBottomNav>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="title" accessibilityRole="header">
            Découvrir
          </AppText>
          <UnderstandingGauge />
        </View>
        <IconButton
          icon={SlidersHorizontal}
          onPress={() => router.push('/modals/filters')}
          accessibilityLabel="Ouvrir les filtres"
          size={42}
          iconSize={18}
        />
      </View>

      <View style={styles.deckArea}>
        {isLoading ? (
          <View style={styles.skeletonCard}>
            <Skeleton width="100%" height="100%" borderRadius={radius.card} />
          </View>
        ) : isError ? (
          <ErrorState
            message="Impossible de charger les produits. Vérifie ta connexion."
            onRetry={() => {
              void refetch();
            }}
          />
        ) : exhausted ? (
          <EmptyState
            icon={Compass}
            title="Tu as tout vu — bravo"
            message="Tu as parcouru toute la sélection du moment. Reviens bientôt pour de nouvelles pièces, ou repars de zéro."
            actionLabel="Réinitialiser mes swipes"
            onAction={resetAll}
          />
        ) : (
          <SwipeDeck
            ref={deckRef}
            items={items}
            onSwipe={swipe}
            onPressDetails={(item) => {
              if (item.kind === 'product') {
                router.push({ pathname: '/product/[id]', params: { id: item.id } });
              }
            }}
          />
        )}
      </View>

      <SwipeActionBar
        onUndo={() => {
          undo();
        }}
        canUndo={canUndo}
        disabled={!topItem}
        onDislike={() => deckRef.current?.swipeTop('dislike')}
        onSimilar={() => {
          if (topProductId) {
            router.push({ pathname: '/similar/[id]', params: { id: topProductId } });
          }
        }}
        onLike={() => deckRef.current?.swipeTop('like')}
        onSuperlike={() => deckRef.current?.swipeTop('superlike')}
      />
      <View style={styles.navClearance} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  gaugeTrack: {
    height: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    marginTop: 4,
    maxWidth: 220,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: radius.xs,
    backgroundColor: colors.accent,
  },
  deckArea: {
    flex: 1,
  },
  skeletonCard: {
    flex: 1,
  },
  navClearance: {
    height: 76,
  },
});
