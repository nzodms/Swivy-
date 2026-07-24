import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
}

interface SessionState {
  /** null = navigation anonyme (mode invité, pleinement fonctionnel). */
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      signOut: () => set({ user: null }),
    }),
    {
      name: 'swivy-session',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
