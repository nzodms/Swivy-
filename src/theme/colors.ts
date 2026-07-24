/**
 * Palette Swivy — claire, chaleureuse, premium.
 * Accent : sauge minérale. Jamais de couleurs criardes.
 */
export const colors = {
  // Fonds
  background: '#FFFFFF',
  backgroundSubtle: '#F7F7F5',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F2EF',

  // Texte
  textPrimary: '#151515',
  textSecondary: '#737373',
  textTertiary: '#A6A6A2',
  textInverse: '#FFFFFF',

  // Bordures
  border: '#E8E8E5',
  borderStrong: '#DBDBD6',

  // Accent principal — sauge
  accent: '#71805C',
  accentDeep: '#59674A',
  accentSoft: '#EEF1E8',

  // Actions de swipe
  like: '#4E9B6F',
  likeSoft: '#E9F4EE',
  dislike: '#DE6A4E',
  dislikeSoft: '#FBEDE8',
  superlike: '#A34E78',
  superlikeSoft: '#F7EAF1',

  // Sémantique
  danger: '#C94F3D',
  warning: '#C9922E',

  // Voiles et dégradés
  overlay: 'rgba(21, 21, 21, 0.42)',
  scrimTransparent: 'rgba(21, 21, 21, 0)',
  scrimBottom: 'rgba(21, 21, 21, 0.55)',
  frost: 'rgba(255, 255, 255, 0.82)',
} as const;

export type AppColor = keyof typeof colors;
