import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  notificationsEnabled: boolean;
  reducedMotion: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      reducedMotion: false,
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    {
      name: 'swivy-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
