import { useRouter } from 'expo-router';
import { Compass, SlidersHorizontal } from 'lucide-react-native';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppScreen,
  EmptyState,
  ErrorState,
  IconButton,
  Skeleton,
} from '@/components';
import { SwipeActionBar } from '@/features/discovery/SwipeActionBar';
import { SwipeDeck, type SwipeDeckHandle } from '@/features/discovery/SwipeDeck';
import { useSwipeDeck } from '@/features/discovery/useSwipeDeck';
import { useTasteStore } from '@/stores/tasteStore';
import { radius } from '@/theme';

/** Écran principal : le feed de découverte par swipe. */
export default function DiscoverScreen() {
  const router = useRouter();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const { deck, isLoading, isError, refetch, swipe, undo, canUndo, exhausted, compatibilityFor } =
    useSwipeDeck();
  const resetAll = useTasteStore((state) => state.resetAll);

  const topProduct = deck[0];

  return (
    <AppScreen withBottomNav>
      <AppHeader
        title="Découvrir"
        subtitle="Swipe pour affiner ton style"
        trailing={
          <IconButton
            icon={SlidersHorizontal}
            onPress={() => router.push('/modals/filters')}
            accessibilityLabel="Ouvrir les filtres"
            size={44}
            iconSize={19}
          />
        }
      />

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
            products={deck}
            compatibilityFor={compatibilityFor}
            onSwipe={swipe}
            onPressDetails={(product) => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
          />
        )}
      </View>

      <SwipeActionBar
        onUndo={() => {
          undo();
        }}
        canUndo={canUndo}
        disabled={!topProduct}
        onDislike={() => deckRef.current?.swipeTop('dislike')}
        onSimilar={() => {
          if (topProduct) {
            router.push({ pathname: '/similar/[id]', params: { id: topProduct.id } });
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
  deckArea: {
    flex: 1,
  },
  skeletonCard: {
    flex: 1,
  },
  navClearance: {
    height: 84,
  },
});
