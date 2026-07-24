import { useEffect } from 'react';

import { useSessionStore } from '@/stores/sessionStore';
import { useAnalyticsStore } from './analyticsStore';
import type { AnalyticsEventName, AnalyticsPayload } from './events';

/**
 * Enregistre un événement produit. Fonction simple (pas un hook) :
 * appelable depuis les stores, les hooks et les gestionnaires d'événements.
 */
export function track(name: AnalyticsEventName, payload?: AnalyticsPayload): void {
  const userId = useSessionStore.getState().user?.id ?? null;
  useAnalyticsStore.getState().record(name, userId, payload);
}

/** session_started au montage de l'app, session_ended au démontage. */
export function useSessionLifecycle(): void {
  useEffect(() => {
    const startedAt = Date.now();
    track('session_started');
    return () => {
      track('session_ended', { durationMs: Date.now() - startedAt });
    };
  }, []);
}
