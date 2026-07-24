import { useCallback, useEffect, useMemo, useState } from 'react';

import { buildDeck, compatibilityPercent } from '@/features/recommendations';
import { useCatalog } from '@/hooks/useProducts';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import type { Product, SwipeAction } from '@/types';

/** Taille minimale du deck avant réapprovisionnement. */
const REFILL_BELOW = 4;
const REFILL_BATCH = 12;

/**
 * État du feed de découverte : deck ordonné par le moteur de
 * recommandation, swipe, annulation, réapprovisionnement.
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
      setDeck((current) => [...current, ...batch.filter((p) => !current.some((c) => c.id === p.id))]);
    }
    // `profile` est volontairement absent des dépendances : le deck en cours
    // ne doit pas être rebattu à chaque swipe, seulement complété.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, deck.length]);

  const swipe = useCallback(
    (product: Product, action: SwipeAction) => {
      recordSwipe(product, action, 'discovery');
      if (action === 'like') addFavorite(product.id, false);
      if (action === 'superlike') {
        addFavorite(product.id, true);
        showToast('Ajouté à tes coups de cœur', 'success');
      }
      setDeck((current) => current.filter((candidate) => candidate.id !== product.id));
    },
    [recordSwipe, addFavorite, showToast],
  );

  const undo = useCallback((): Product | null => {
    const lastSwipe = undoLastSwipe();
    if (!lastSwipe || !catalog) return null;
    const product = catalog.find((candidate) => candidate.id === lastSwipe.productId);
    if (!product) return null;
    if (lastSwipe.action === 'like' || lastSwipe.action === 'superlike') {
      removeFavorite(product.id);
    }
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
