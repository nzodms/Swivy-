import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Compass, Heart, Sparkles, UserRound, type LucideIcon } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, motion, radius, shadows, spacing, zIndex } from '@/theme';

const TAB_CONFIG: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'Découvrir', icon: Compass },
  'for-you': { label: 'Pour toi', icon: Sparkles },
  favorites: { label: 'Favoris', icon: Heart },
  profile: { label: 'Profil', icon: UserRound },
};

function TabItem({
  label,
  icon: Icon,
  focused,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  focused: boolean;
  onPress: () => void;
}) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPressIn={() => {
        scale.value = withSpring(0.94, motion.spring.press);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, motion.spring.press);
      }}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      style={styles.tab}
    >
      <Animated.View style={[styles.tabInner, focused && styles.tabInnerActive, animatedStyle]}>
        <Icon
          size={21}
          color={focused ? colors.accentDeep : colors.textSecondary}
          strokeWidth={focused ? 2.4 : 2}
        />
        <AppText variant="micro" style={focused ? styles.labelActive : styles.label}>
          {label}
        </AppText>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Bottom navigation flottante : pilule givrée, quatre onglets,
 * état actif souligné en sauge.
 */
export function BottomNavigation({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}
      pointerEvents="box-none"
    >
      <View style={styles.barShadow}>
        <BlurView intensity={Platform.OS === 'ios' ? 40 : 0} tint="light" style={styles.bar}>
          {state.routes.map((route, index) => {
            const config = TAB_CONFIG[route.name];
            if (!config) return null;
            const focused = state.index === index;
            return (
              <TabItem
                key={route.key}
                label={config.label}
                icon={config.icon}
                focused={focused}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              />
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: zIndex.bottomNav,
  },
  barShadow: {
    borderRadius: radius.pill,
    ...shadows.floating,
  },
  bar: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.72)' : colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
  },
  tab: {
    minWidth: 76,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
  },
  tabInnerActive: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.accentDeep,
  },
});
