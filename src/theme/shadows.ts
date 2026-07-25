import type { ViewStyle } from 'react-native';

/**
 * Ombres rares et précises : la carte de swipe et les surfaces sticky.
 * Tout le reste vit par la bordure (hairline) et le contraste.
 */
export const shadows = {
  /** Carte de swipe uniquement. */
  card: {
    shadowColor: '#101211',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 6,
  },
  /** Barres sticky (CTA fiche produit, toast). */
  sticky: {
    shadowColor: '#101211',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 8,
  },
} satisfies Record<string, ViewStyle>;
