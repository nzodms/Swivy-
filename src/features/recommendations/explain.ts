import type { Product, TasteProfile } from '@/types';
import { STYLE_LABELS, type StyleSlug } from '@/types';
import { topEntries } from './tasteProfile';

/**
 * Explication en langage naturel d'une recommandation.
 * Construite depuis les attributs réellement partagés entre
 * le profil et le produit — jamais générée au hasard.
 */

const STYLE_PHRASES: Record<string, string> = {
  'minimaliste-chaleureux': 'les intérieurs minimalistes et chaleureux',
  contemporain: 'les lignes contemporaines',
  japandi: 'l’esprit japandi',
  scandinave: 'l’esprit scandinave',
  organique: 'les formes organiques',
  'art-deco': 'les touches art déco',
  industriel: 'le caractère industriel',
  boheme: 'les ambiances bohèmes',
  vintage: 'les pièces vintage',
};

const SHAPE_PHRASES: Record<string, string> = {
  arrondi: 'les formes arrondies',
  organique: 'les courbes libres',
  rectiligne: 'les lignes épurées',
  sculptural: 'les pièces sculpturales',
  incurvé: 'les silhouettes incurvées',
  bas: 'les assises basses',
  modulaire: 'les meubles modulables',
  cylindrique: 'les volumes cylindriques',
};

function joinFr(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} et ${parts[parts.length - 1] ?? ''}`;
}

/**
 * "Recommandé parce que tu apprécies …" — 2 à 3 raisons concrètes.
 */
export function explainRecommendation(profile: TasteProfile, product: Product): string {
  if (profile.signalCount < 4) {
    return 'Sélectionné pour découvrir tes goûts : tes prochains swipes affineront ces recommandations.';
  }

  const reasons: string[] = [];

  const likedStyles = new Set(topEntries(profile.styles, 3).map(([key]) => key));
  const matchedStyle = product.styles.find((style) => likedStyles.has(style));
  if (matchedStyle) reasons.push(STYLE_PHRASES[matchedStyle] ?? STYLE_LABELS[matchedStyle as StyleSlug]);

  const likedMaterials = new Set(topEntries(profile.materials, 4).map(([key]) => key));
  const matchedMaterial = product.materials.find((material) => likedMaterials.has(material));
  if (matchedMaterial) reasons.push(`les matières comme le ${matchedMaterial}`);

  const likedColors = new Set(topEntries(profile.colors, 4).map(([key]) => key));
  const matchedColor = product.colors.find((color) => likedColors.has(color));
  if (matchedColor) reasons.push(`les tons ${matchedColor}`);

  if (reasons.length < 2) {
    const likedShapes = new Set(topEntries(profile.shapes, 3).map(([key]) => key));
    const matchedShape = product.shapes.find((shape) => likedShapes.has(shape));
    if (matchedShape) reasons.push(SHAPE_PHRASES[matchedShape] ?? matchedShape);
  }

  if (reasons.length === 0) {
    return 'Un pas de côté par rapport à tes habitudes, pour vérifier si ton style évolue.';
  }
  return `Recommandé parce que tu apprécies ${joinFr(reasons.slice(0, 3))}.`;
}
