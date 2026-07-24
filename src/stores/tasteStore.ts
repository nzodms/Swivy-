import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  applyOnboardingSelections,
  applySwipe,
  emptyTasteProfile,
} from '@/features/recommendations';
import type {
  OnboardingSelections,
  Product,
  SwipeAction,
  SwipeRecord,
  TasteProfile,
} from '@/types';

const MAX_UNDO_DEPTH = 30;

interface TasteState {
  profile: TasteProfile;
  selections: OnboardingSelections;
  swipes: SwipeRecord[];
  hiddenProductIds: string[];
  onboardingComplete: boolean;
  /** Instantanés de profil pour pouvoir annuler un swipe. */
  profileHistory: TasteProfile[];

  recordSwipe: (product: Product, action: SwipeAction, source: SwipeRecord['source']) => void;
  undoLastSwipe: () => SwipeRecord | null;
  setSelections: (selections: Partial<OnboardingSelections>) => void;
  seedProfileFromSelections: () => void;
  completeOnboarding: () => void;
  hideProduct: (productId: string) => void;
  unhideProduct: (productId: string) => void;
  resetAll: () => void;
}

const emptySelections: OnboardingSelections = {
  rooms: [],
  categories: [],
  priceBand: null,
  priceRange: null,
};

export const useTasteStore = create<TasteState>()(
  persist(
    (set, get) => ({
      profile: emptyTasteProfile(),
      selections: emptySelections,
      swipes: [],
      hiddenProductIds: [],
      onboardingComplete: false,
      profileHistory: [],

      recordSwipe: (product, action, source) => {
        const { profile, swipes, profileHistory } = get();
        set({
          profile: applySwipe(profile, product, action),
          swipes: [...swipes, { productId: product.id, action, at: Date.now(), source }],
          profileHistory: [...profileHistory.slice(-(MAX_UNDO_DEPTH - 1)), profile],
        });
      },

      undoLastSwipe: () => {
        const { swipes, profileHistory } = get();
        const lastSwipe = swipes[swipes.length - 1];
        const previousProfile = profileHistory[profileHistory.length - 1];
        if (!lastSwipe || !previousProfile) return null;
        set({
          swipes: swipes.slice(0, -1),
          profile: previousProfile,
          profileHistory: profileHistory.slice(0, -1),
        });
        return lastSwipe;
      },

      setSelections: (partial) =>
        set((state) => ({ selections: { ...state.selections, ...partial } })),

      seedProfileFromSelections: () =>
        set((state) => ({
          profile: applyOnboardingSelections(state.profile, state.selections),
        })),

      completeOnboarding: () => set({ onboardingComplete: true }),

      hideProduct: (productId) =>
        set((state) => ({
          hiddenProductIds: state.hiddenProductIds.includes(productId)
            ? state.hiddenProductIds
            : [...state.hiddenProductIds, productId],
        })),

      unhideProduct: (productId) =>
        set((state) => ({
          hiddenProductIds: state.hiddenProductIds.filter((id) => id !== productId),
        })),

      resetAll: () =>
        set({
          profile: emptyTasteProfile(),
          selections: emptySelections,
          swipes: [],
          hiddenProductIds: [],
          onboardingComplete: false,
          profileHistory: [],
        }),
    }),
    {
      name: 'swivy-taste',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ profile, selections, swipes, hiddenProductIds, onboardingComplete }) => ({
        profile,
        selections,
        swipes,
        hiddenProductIds,
        onboardingComplete,
      }),
    },
  ),
);

/** Identifiants des produits déjà swipés (pour exclure du deck). */
export function selectSwipedIds(state: TasteState): Set<string> {
  return new Set(state.swipes.map((swipe) => swipe.productId));
}
