import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Compass, Heart, Sparkles, UserRound, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, motion, radius, spacing, zIndex } from '@/theme';

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
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: withTiming(focused ? 1 : 0, { duration: motion.duration.fast }),
    transform: [{ scale: withSpring(focused ? 1 : 0.4, motion.spring.enter) }],
  }));

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPressIn={() => {
        scale.value = withSpring(motion.pressScale.icon, motion.spring.press);
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
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Icon
          size={22}
          color={focused ? colors.accent : colors.textTertiary}
          strokeWidth={focused ? 2.4 : 1.9}
          fill={focused && Icon === Heart ? colors.accent : 'transparent'}
        />
      </Animated.View>
      <AppText variant="micro" style={focused ? styles.labelActive : styles.label}>
        {label}
      </AppText>
      <Animated.View style={[styles.dot, dotStyle]} />
    </Pressable>
  );
}

/**
 * Navigation V2 : barre pleine largeur, hairline supérieure, état actif
 * par teinte + point — compacte, stable, sans effet « glass ».
 */
export function BottomNavigation({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    zIndex: zIndex.bottomNav,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  iconWrap: {
    height: 26,
    justifyContent: 'center',
  },
  label: {
    color: colors.textTertiary,
  },
  labelActive: {
    color: colors.accent,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
