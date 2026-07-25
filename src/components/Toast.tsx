import { AlertCircle, Check, Info } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { useToastStore, type ToastKind } from '@/stores/toastStore';
import { colors, radius, shadows, spacing, zIndex } from '@/theme';

const ICONS: Record<ToastKind, typeof Check> = {
  success: Check,
  info: Info,
  error: AlertCircle,
};

const ICON_COLORS: Record<ToastKind, string> = {
  success: colors.like,
  info: colors.accent,
  error: colors.danger,
};

const AUTO_DISMISS_MS = 2600;

/** Toast global — monté une seule fois à la racine. */
export function Toast() {
  const insets = useSafeAreaInsets();
  const toast = useToastStore((state) => state.toast);
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;
  const Icon = ICONS[toast.kind];

  return (
    <Animated.View
      key={toast.id}
      entering={SlideInUp.springify().damping(20)}
      exiting={SlideOutUp.duration(200)}
      style={[styles.wrapper, { top: insets.top + spacing.xs }]}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.toast}>
        <Icon size={17} color={ICON_COLORS[toast.kind]} strokeWidth={2.4} />
        <AppText variant="caption" style={styles.message}>
          {toast.message}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: zIndex.toast,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '86%',
    ...shadows.sticky,
  },
  message: {
    color: colors.textPrimary,
    flexShrink: 1,
  },
});
