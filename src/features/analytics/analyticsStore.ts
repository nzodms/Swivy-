import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AnalyticsEvent, AnalyticsEventName, AnalyticsPayload } from './events';

/** Taille maximale de la file locale (les plus anciens sont écartés). */
const MAX_EVENTS = 600;

function randomId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Une session applicative par lancement du bundle. */
export const currentSessionId = randomId('s');

interface AnalyticsState {
  events: AnalyticsEvent[];
  anonymousId: string;
  record: (name: AnalyticsEventName, userId: string | null, payload?: AnalyticsPayload) => void;
  clear: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      events: [],
      anonymousId: randomId('anon'),

      record: (name, userId, payload = {}) => {
        const event: AnalyticsEvent = {
          id: randomId('e'),
          name,
          sessionId: currentSessionId,
          userId,
          anonymousId: get().anonymousId,
          at: Date.now(),
          ...payload,
        };
        set((state) => ({ events: [...state.events.slice(-(MAX_EVENTS - 1)), event] }));
      },

      clear: () => set({ events: [] }),
    }),
    {
      name: 'swivy-analytics',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
