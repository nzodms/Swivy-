/** Échelle d'espacement — base 4. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

/** Marges horizontales standard d'un écran. */
export const screenPadding = spacing.lg;

/** Taille minimale d'une zone tactile (accessibilité). */
export const minTouchTarget = 44;
