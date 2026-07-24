import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Retours tactiles centralisés — no-op sur le web.
 */
export function useHaptics() {
  const selection = useCallback(() => {
    if (Platform.OS === 'web') return;
    void Haptics.selectionAsync();
  }, []);

  const light = useCallback(() => {
    if (Platform.OS === 'web') return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const medium = useCallback(() => {
    if (Platform.OS === 'web') return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const success = useCallback(() => {
    if (Platform.OS === 'web') return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  return { selection, light, medium, success };
}
