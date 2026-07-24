import type { Product, StyleSummary, TasteProfile } from '@/types';
import { styleSlugSchema, type StyleSlug } from '@/types';
import { topEntries } from './tasteProfile';

/**
 * Synthèse lisible du profil esthétique ("ADN"), affichée
 * dans Profil et Pour toi.
 */
export function buildStyleSummary(profile: TasteProfile, likedProducts: Product[]): StyleSummary {
  const styleEntries = topEntries(profile.styles, 4).filter(
    (entry): entry is [StyleSlug, number] => styleSlugSchema.safeParse(entry[0]).success,
  );
  const totalWeight = styleEntries.reduce((sum, [, weight]) => sum + weight, 0);

  const dominantStyles = styleEntries.map(([style, weight]) => ({
    style,
    share: totalWeight > 0 ? weight / totalWeight : 0,
  }));

  const averageBudget =
    likedProducts.length >= 3
      ? Math.round(likedProducts.reduce((sum, p) => sum + p.price, 0) / likedProducts.length)
      : null;

  return {
    dominantStyles,
    topColors: topEntries(profile.colors, 4).map(([color]) => color),
    topMaterials: topEntries(profile.materials, 4).map(([material]) => material),
    averageBudget,
    boldness: profile.boldness,
  };
}

/** Libellé du niveau d'audace pour l'interface. */
export function boldnessLabel(boldness: number): string {
  if (boldness < 0.3) return 'Valeurs sûres';
  if (boldness < 0.55) return 'Équilibré';
  if (boldness < 0.75) return 'Curieux';
  return 'Audacieux';
}
