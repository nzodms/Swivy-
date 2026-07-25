import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { track } from '@/features/analytics/track';
import {
  buildCardSignal,
  buildDeckDetailed,
  compatibilityPercent,
  explainRecommendation,
  pendingReveal,
} from '@/features/recommendations';
import { useCatalog } from '@/hooks/useProducts';
import { useHaptics } from '@/hooks/useHaptics';
import { useDebugStore } from '@/stores/debugStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useTasteStore } from '@/stores/tasteStore';
import { useToastStore } from '@/stores/toastStore';
import { productById } from '@/mocks/products';
import type { Product, SwipeAction } from '@/types';
import type { CardPresentation, DeckItem } from './deckTypes';

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

/** Format de carte selon la position globale — jamais deux packshots d'affilée. */
function presentationFor(product: Product, index: number): CardPresentation {
  if (product.images.length >= 3 && index % 5 === 2) return 'story';
  if (index % 3 === 1) return 'packshot';
  return 'situation';
}

/**
 * État du feed de découverte V2 : deck d'éléments variés (produits
 * multi-formats + révélations), signaux personnalisés, haptique,
 * préchargement, annulation et instrumentation.
 */
export function useSwipeDeck() {
  const { data: catalog, isLoading, isError, refetch } = useCatalog();
  const haptics = useHaptics();

  const profile = useTasteStore((state) => state.profile);
  const selections = useTasteStore((state) => state.selections);
  const swipes = useTasteStore((state) => state.swipes);
  const hiddenProductIds = useTasteStore((state) => state.hiddenProductIds);
  const hiddenBrands = useTasteStore((state) => state.hiddenBrands);
  const shownReveals = useTasteStore((state) => state.shownReveals);
  const recordSwipe = useTasteStore((state) => state.recordSwipe);
  const undoLastSwipe = useTasteStore((state) => state.undoLastSwipe);
  const markRevealShown = useTasteStore((state) => state.markRevealShown);

  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const showToast = useToastStore((state) => state.show);

  const [items, setItems] = useState<DeckItem[]>([]);

  // Instrumentation : position globale dans le feed et temps d'exposition.
  const feedPosition = useRef(0);
  const impressionStartedAt = useRef(0);
  const lastImpressionId = useRef<string | null>(null);
  /** Compteur global de cartes construites (alternance des formats). */
  const buildIndex = useRef(0);

  const swipedIds = useMemo(() => new Set(swipes.map((swipe) => swipe.productId)), [swipes]);

  const lastSuperlike = useMemo(() => {
    const last = [...swipes].reverse().find((swipe) => swipe.action === 'superlike');
    return last ? (productById.get(last.productId) ?? null) : null;
  }, [swipes]);

  // Réapprovisionne le deck dès qu'il devient trop court.
  useEffect(() => {
    if (!catalog || items.length >= REFILL_BELOW) return;
    const pool = catalog.filter((product) => !hiddenBrands.includes(product.brand));
    const seenIds = new Set<string>([
      ...swipedIds,
      ...hiddenProductIds,
      ...items.filter((item) => item.kind === 'product').map((item) => item.id),
    ]);
    const entries = buildDeckDetailed({
      catalog: pool,
      profile,
      selections,
      seenIds,
      count: REFILL_BATCH,
    });
    if (entries.length === 0) return;

    let lastSignalKey: string | null = null;
    const batch: DeckItem[] = entries.map((entry) => {
      const presentation = presentationFor(entry.product, buildIndex.current);
      buildIndex.current += 1;
      let signal = buildCardSignal(profile, entry.product, { tier: entry.tier, lastSuperlike });
      // Deux cartes consécutives ne répètent jamais le même signal.
      if (signal && signal.key === lastSignalKey) signal = null;
      lastSignalKey = signal?.key ?? null;
      return { kind: 'product', id: entry.product.id, product: entry.product, presentation, signal };
    });

    // Une révélation au maximum, insérée en 2e position, jamais en doublon.
    const reveal = pendingReveal(profile, shownReveals);
    const hasReveal = items.some((item) => item.kind === 'reveal');
    if (reveal && !hasReveal) {
      batch.splice(Math.min(1, batch.length), 0, {
        kind: 'reveal',
        id: `reveal-${reveal.id}`,
        reveal,
      });
    }

    // Réapprovisionnement volontairement piloté par effet : le deck est une
    // file locale alimentée depuis une source externe (catalogue + moteur).
    setItems((current) => [
      ...current,
      ...batch.filter((item) => !current.some((existing) => existing.id === item.id)),
    ]);
    // `profile` volontairement absent : le deck en cours n'est pas rebattu
    // à chaque swipe, seulement complété.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, items.length]);

  // Précharge les images des prochaines cartes (pas de flash d'image).
  useEffect(() => {
    for (const item of items.slice(1, 1 + PREFETCH_AHEAD)) {
      if (item.kind !== 'product') continue;
      const uri = item.product.images[0];
      if (uri) void Image.prefetch(uri);
    }
  }, [items]);

  // Instantané pour l'écran de diagnostic (aucune persistance).
  useEffect(() => {
    useDebugStore
      .getState()
      .setDeck(items.filter((item) => item.kind === 'product').map((item) => item.product));
  }, [items]);

  // Impression : la carte du dessus vient de changer.
  const topItem = items[0];
  useEffect(() => {
    if (!topItem || topItem.id === lastImpressionId.current) return;
    lastImpressionId.current = topItem.id;
    impressionStartedAt.current = Date.now();
    if (topItem.kind === 'product') {
      track('product_impression', {
        productId: topItem.id,
        position: feedPosition.current,
        score: compatibilityPercent(profile, topItem.product),
        screen: 'discovery',
      });
    }
    // Le score au moment de l'impression suffit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topItem?.id]);

  const swipe = useCallback(
    (item: DeckItem, action: SwipeAction) => {
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));

      if (item.kind === 'reveal') {
        // Une révélation balayée ne revient jamais.
        markRevealShown(item.reveal.id);
        return;
      }

      const { product } = item;
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
      if (action === 'like') {
        haptics.light();
        addFavorite(product.id, false);
      }
      if (action === 'superlike') {
        haptics.success();
        addFavorite(product.id, true);
        showToast('Ajouté à tes coups de cœur', 'success');
      }
    },
    [profile, recordSwipe, addFavorite, showToast, markRevealShown, haptics],
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
    haptics.light();
    setItems((current) => [
      { kind: 'product', id: product.id, product, presentation: 'situation', signal: null },
      ...current.filter((candidate) => candidate.id !== product.id),
    ]);
    showToast('Dernier swipe annulé', 'info');
    return product;
  }, [undoLastSwipe, catalog, removeFavorite, showToast, haptics]);

  return {
    items,
    isLoading,
    isError,
    refetch,
    swipe,
    undo,
    canUndo: swipes.length > 0,
    /** Catalogue entièrement parcouru. */
    exhausted: !isLoading && !isError && items.length === 0 && Boolean(catalog),
  };
}
