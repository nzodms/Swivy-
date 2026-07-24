import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, screenPadding } from '@/theme';

interface AppScreenProps extends PropsWithChildren {
  /** Padding horizontal standard (désactivable pour les écrans immersifs). */
  padded?: boolean;
  /** Réserve l'espace de la bottom navigation flottante. */
  withBottomNav?: boolean;
  style?: ViewStyle;
}

/** Hauteur approximative occupée par la bottom navigation flottante. */
export const BOTTOM_NAV_CLEARANCE = 96;

/** Conteneur d'écran : fond, safe areas et gouttières cohérentes. */
export function AppScreen({ children, padded = true, withBottomNav = false, style }: AppScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: withBottomNav ? 0 : insets.bottom,
          paddingHorizontal: padded ? screenPadding : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
