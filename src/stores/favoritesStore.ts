import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface FavoriteEntry {
  productId: string;
  at: number;
  superlike: boolean;
}

export interface Collection {
  id: string;
  name: string;
  productIds: string[];
}

interface FavoritesState {
  favorites: FavoriteEntry[];
  collections: Collection[];

  addFavorite: (productId: string, superlike?: boolean) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  createCollection: (name: string) => Collection;
  toggleInCollection: (collectionId: string, productId: string) => void;
  deleteCollection: (collectionId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      collections: [],

      addFavorite: (productId, superlike = false) =>
        set((state) => {
          const existing = state.favorites.find((f) => f.productId === productId);
          if (existing) {
            // Un superlike promeut un favori existant, jamais l'inverse.
            if (superlike && !existing.superlike) {
              return {
                favorites: state.favorites.map((f) =>
                  f.productId === productId ? { ...f, superlike: true } : f,
                ),
              };
            }
            return state;
          }
          return { favorites: [...state.favorites, { productId, at: Date.now(), superlike }] };
        }),

      removeFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f.productId !== productId),
          collections: state.collections.map((c) => ({
            ...c,
            productIds: c.productIds.filter((id) => id !== productId),
          })),
        })),

      isFavorite: (productId) => get().favorites.some((f) => f.productId === productId),

      createCollection: (name) => {
        const collection: Collection = {
          id: `col-${Date.now().toString(36)}`,
          name,
          productIds: [],
        };
        set((state) => ({ collections: [...state.collections, collection] }));
        return collection;
      },

      toggleInCollection: (collectionId, productId) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  productIds: c.productIds.includes(productId)
                    ? c.productIds.filter((id) => id !== productId)
                    : [...c.productIds, productId],
                }
              : c,
          ),
        })),

      deleteCollection: (collectionId) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== collectionId),
        })),
    }),
    {
      name: 'swivy-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
