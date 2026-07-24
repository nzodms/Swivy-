import { create } from 'zustand';

import type { Product } from '@/types';

/**
 * Instantané du deck de découverte, alimenté par useSwipeDeck,
 * consommé uniquement par l'écran de diagnostic. Non persisté.
 */
interface DebugState {
  deck: Product[];
  setDeck: (deck: Product[]) => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  deck: [],
  setDeck: (deck) => set({ deck }),
}));
