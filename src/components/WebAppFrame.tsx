import type { PropsWithChildren } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, radius, shadows } from '@/theme';

/** Largeur de l'expérience sur desktop : proche d'un grand téléphone. */
const FRAME_WIDTH = 424;
const FRAME_MAX_HEIGHT = 930;
/** En dessous de cette largeur de fenêtre, l'app occupe tout l'écran. */
const FULLSCREEN_BREAKPOINT = 560;

/**
 * Sur le web desktop, centre l'application dans une largeur de téléphone
 * avec un fond extérieur discret — l'app reste une expérience mobile.
 * Sur natif et sur mobile web : rendu plein écran, aucun effet.
 */
export function WebAppFrame({ children }: PropsWithChildren) {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width >= FULLSCREEN_BREAKPOINT;

  if (!framed) {
    return <View style={styles.fullscreen}>{children}</View>;
  }

  return (
    <View style={styles.desktopBackground}>
      <View
        style={[
          styles.frame,
          { height: Math.min(height - 48, FRAME_MAX_HEIGHT) },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
  desktopBackground: {
    flex: 1,
    backgroundColor: '#EDEDEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_WIDTH,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
    overflow: 'hidden',
    ...shadows.floating,
  },
});
