/**
 * Palette Swivy V2 — blanc net, graphite, vert cyprès signature,
 * cuivre réservé aux moments spéciaux. Voir docs/VISUAL_DIRECTION_V2.md.
 */
export const colors = {
  // Fonds
  background: '#FFFFFF',
  backgroundSubtle: '#F6F6F4',
  surface: '#F6F6F4',
  surfaceMuted: '#ECECEA',

  // Texte (graphite)
  textPrimary: '#1C1C1E',
  textSecondary: '#66666B',
  textTertiary: '#9C9CA1',
  textInverse: '#FFFFFF',

  // Bordures
  border: '#E5E5E2',
  borderStrong: '#D6D6D2',

  // Marque — vert cyprès
  accent: '#1D4A3F',
  accentDeep: '#123830',
  accentSoft: '#E9F0EC',

  // Cuivre — coups de cœur, révélations, baisses de prix. Rien d'autre.
  copper: '#B4562F',
  copperSoft: '#F8ECE4',

  // Actions de swipe
  like: '#1D4A3F',
  likeSoft: '#E9F0EC',
  dislike: '#5F5F66',
  dislikeSoft: '#EFEFED',
  superlike: '#B4562F',
  superlikeSoft: '#F8ECE4',

  // Sémantique
  danger: '#B3402C',
  warning: '#B07C24',

  // Voiles et dégradés
  overlay: 'rgba(28, 28, 30, 0.45)',
  scrimTransparent: 'rgba(16, 18, 17, 0)',
  scrimBottom: 'rgba(16, 18, 17, 0.62)',
  frost: 'rgba(255, 255, 255, 0.9)',
} as const;

export type AppColor = keyof typeof colors;
