import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { track } from '@/features/analytics/track';
import {
  buildDeck,
  compatibilityPercent,
  explainRecommendation,
} from '@/features/recommendations';
import { useCatalog } from '@/hooks/useProducts';
import { useDebugStore } from '@/stores/debugStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import type { Product, SwipeAction } from '@/types';

/** Taille minimale du deck avant réapprovisionnement. */
const REFILL_BELOW = 4;
const REFILL_BATCH = 12;
/** Nombre d'images préchargées en avance de phase. */
const PREFETCH_AHEAD = 4;

const SWIPE_EVENT: Record<SwipeAction, 'product_like' | 'product_dislike' | 'product_superlike'> = {
  like: 'product_like',
  dislike: 'product_dislike',
  superlike: 'product_superlike',
};

/**
 * État du feed de découverte : deck ordonné par le moteur de
 * recommandation, swipe, annulation, réapprovisionnement, préchargement
 * d'images et instrumentation (impressions, exposition, actions).
 */
export function useSwipeDeck() {
  const { data: catalog, isLoading, isError, refetch } = useCatalog();

  const profile = useTasteStore((state) => state.profile);
  const selections = useTasteStore((state) => state.selections);
  const swipes = useTasteStore((state) => state.swipes);
  const hiddenProductIds = useTasteStore((state) => state.hiddenProductIds);
  const recordSwipe = useTasteStore((state) => state.recordSwipe);
  const undoLastSwipe = useTasteStore((state) => state.undoLastSwipe);

  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const showToast = useToastStore((state) => state.show);

  const [deck, setDeck] = useState<Product[]>([]);

  // Instrumentation : position globale dans le feed et temps d'exposition.
  const feedPosition = useRef(0);
  const impressionStartedAt = useRef(0);
  const lastImpressionId = useRef<string | null>(null);

  const swipedIds = useMemo(() => new Set(swipes.map((swipe) => swipe.productId)), [swipes]);

  // Réapprovisionne le deck dès qu'il devient trop court.
  useEffect(() => {
    if (!catalog || deck.length >= REFILL_BELOW) return;
    const seenIds = new Set<string>([
      ...swipedIds,
      ...hiddenProductIds,
      ...deck.map((product) => product.id),
    ]);
    const batch = buildDeck({ catalog, profile, selections, seenIds, count: REFILL_BATCH });
    if (batch.length > 0) {
      // Réapprovisionnement volontairement piloté par effet : le deck est une
      // file locale alimentée depuis une source externe (catalogue + moteur).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeck((current) => [...current, ...batch.filter((p) => !current.some((c) => c.id === p.id))]);
    }
    // `profile` est volontairement absent des dépendances : le deck en cours
    // ne doit pas être rebattu à chaque swipe, seulement complété.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, deck.length]);

  // Précharge les images des prochaines cartes (pas de flash d'image).
  useEffect(() => {
    const upcoming = deck.slice(1, 1 + PREFETCH_AHEAD);
    for (const product of upcoming) {
      const uri = product.images[0];
      if (uri) void Image.prefetch(uri);
    }
  }, [deck]);

  // Instantané pour l'écran de diagnostic (aucune persistance).
  useEffect(() => {
    useDebugStore.getState().setDeck(deck);
  }, [deck]);

  // Impression : la carte du dessus vient de changer.
  const topProduct = deck[0];
  useEffect(() => {
    if (!topProduct || topProduct.id === lastImpressionId.current) return;
    lastImpressionId.current = topProduct.id;
    impressionStartedAt.current = Date.now();
    track('product_impression', {
      productId: topProduct.id,
      position: feedPosition.current,
      score: compatibilityPercent(profile, topProduct),
      screen: 'discovery',
    });
    // Le score au moment de l'impression suffit ; pas de re-tracking quand le profil bouge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topProduct?.id]);

  const swipe = useCallback(
    (product: Product, action: SwipeAction) => {
      track(SWIPE_EVENT[action], {
        productId: product.id,
        position: feedPosition.current,
        exposureMs: Date.now() - impressionStartedAt.current,
        score: compatibilityPercent(profile, product),
        reason: explainRecommendation(profile, product),
        screen: 'discovery',
      });
      feedPosition.current += 1;

      recordSwipe(product, action, 'discovery');
      if (action === 'like') addFavorite(product.id, false);
      if (action === 'superlike') {
        addFavorite(product.id, true);
        showToast('Ajouté à tes coups de cœur', 'success');
      }
      setDeck((current) => current.filter((candidate) => candidate.id !== product.id));
    },
    [profile, recordSwipe, addFavorite, showToast],
  );

  const undo = useCallback((): Product | null => {
    const lastSwipe = undoLastSwipe();
    if (!lastSwipe || !catalog) return null;
    const product = catalog.find((candidate) => candidate.id === lastSwipe.productId);
    if (!product) return null;
    if (lastSwipe.action === 'like' || lastSwipe.action === 'superlike') {
      removeFavorite(product.id);
    }
    track('product_undo', {
      productId: product.id,
      previousAction: lastSwipe.action,
      screen: 'discovery',
    });
    feedPosition.current = Math.max(0, feedPosition.current - 1);
    // Permet un nouvel événement d'impression pour la carte restaurée.
    lastImpressionId.current = null;
    setDeck((current) => [product, ...current.filter((candidate) => candidate.id !== product.id)]);
    showToast('Dernier swipe annulé', 'info');
    return product;
  }, [undoLastSwipe, catalog, removeFavorite, showToast]);

  const compatibilityFor = useCallback(
    (product: Product) => compatibilityPercent(profile, product),
    [profile],
  );

  return {
    deck,
    isLoading,
    isError,
    refetch,
    swipe,
    undo,
    canUndo: swipes.length > 0,
    /** Catalogue entièrement parcouru. */
    exhausted: !isLoading && !isError && deck.length === 0 && Boolean(catalog),
    compatibilityFor,
  };
}
