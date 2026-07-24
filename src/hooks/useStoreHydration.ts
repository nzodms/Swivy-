import { useEffect, useState } from 'react';

import { useFavoritesStore } from '@/stores/favoritesStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useTasteStore } from '@/stores/tasteStore';

/**
 * Vrai quand tous les stores persistés ont été réhydratés
 * depuis AsyncStorage — évite un flash de mauvaise route au démarrage.
 */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    () =>
      useTasteStore.persist.hasHydrated() &&
      useFavoritesStore.persist.hasHydrated() &&
      useSessionStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (hydrated) return;
    const check = () => {
      if (
        useTasteStore.persist.hasHydrated() &&
        useFavoritesStore.persist.hasHydrated() &&
        useSessionStore.persist.hasHydrated()
      ) {
        setHydrated(true);
      }
    };
    const subscriptions = [
      useTasteStore.persist.onFinishHydration(check),
      useFavoritesStore.persist.onFinishHydration(check),
      useSessionStore.persist.onFinishHydration(check),
    ];
    check();
    return () => subscriptions.forEach((unsubscribe) => unsubscribe());
  }, [hydrated]);

  return hydrated;
}
