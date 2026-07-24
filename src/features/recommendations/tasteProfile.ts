import type { OnboardingSelections, Product, SwipeAction, TasteProfile } from '@/types';
import { priceBandOf } from '@/types';

/**
 * Le profil de goût est un ensemble de poids par attribut.
 * Chaque swipe le déplace ; le moteur de recommandation le lit.
 */

/** Poids appliqué à chaque action de swipe. */
const ACTION_WEIGHTS: Record<SwipeAction, number> = {
  like: 1,
  superlike: 2.5,
  // Un rejet pèse volontairement moins qu'un like : un seul "non"
  // ne doit jamais bannir une catégorie entière.
  dislike: -0.55,
};

/** Vitesse de convergence du niveau d'audace. */
const BOLDNESS_RATES: Record<SwipeAction, number> = {
  like: 0.1,
  superlike: 0.22,
  dislike: -0.04,
};

export function emptyTasteProfile(): TasteProfile {
  return {
    styles: {},
    colors: {},
    materials: {},
    categories: {},
    shapes: {},
    priceBands: {},
    brands: {},
    boldness: 0.35,
    signalCount: 0,
  };
}

function bump(map: Record<string, number>, key: string, delta: number): void {
  map[key] = (map[key] ?? 0) + delta;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Voisinage de gammes de prix : aimer 100-300 € rend 300-700 € plausible. */
const PRICE_NEIGHBORS: Record<string, string[]> = {
  'under-100': ['100-300'],
  '100-300': ['under-100', '300-700'],
  '300-700': ['100-300', 'over-700'],
  'over-700': ['300-700'],
};

/**
 * Applique un swipe au profil et retourne un nouveau profil (immutabilité).
 */
export function applySwipe(profile: TasteProfile, product: Product, action: SwipeAction): TasteProfile {
  const delta = ACTION_WEIGHTS[action];
  const next: TasteProfile = {
    styles: { ...profile.styles },
    colors: { ...profile.colors },
    materials: { ...profile.materials },
    categories: { ...profile.categories },
    shapes: { ...profile.shapes },
    priceBands: { ...profile.priceBands },
    brands: { ...profile.brands },
    boldness: profile.boldness,
    signalCount: profile.signalCount + 1,
  };

  for (const style of product.styles) bump(next.styles, style, delta);
  for (const color of product.colors) bump(next.colors, color, delta * 0.8);
  for (const material of product.materials) bump(next.materials, material, delta * 0.8);
  for (const shape of product.shapes) bump(next.shapes, shape, delta * 0.6);
  bump(next.categories, product.category, delta * 0.9);
  bump(next.brands, product.brand, delta * 0.5);

  const band = priceBandOf(product.price);
  bump(next.priceBands, band, delta * 0.7);
  if (delta > 0) {
    for (const neighbor of PRICE_NEIGHBORS[band] ?? []) {
      bump(next.priceBands, neighbor, delta * 0.2);
    }
  }

  next.boldness = clamp01(
    next.boldness + BOLDNESS_RATES[action] * (product.boldness - next.boldness),
  );

  return next;
}

/**
 * Injecte les choix d'onboarding comme signaux initiaux doux :
 * ils orientent le premier deck sans figer le profil.
 */
export function applyOnboardingSelections(
  profile: TasteProfile,
  selections: OnboardingSelections,
): TasteProfile {
  const next: TasteProfile = {
    ...profile,
    categories: { ...profile.categories },
    priceBands: { ...profile.priceBands },
  };
  for (const category of selections.categories) {
    bump(next.categories, category, 1.4);
  }
  if (selections.priceBand) {
    bump(next.priceBands, selections.priceBand, 1.8);
    for (const neighbor of PRICE_NEIGHBORS[selections.priceBand] ?? []) {
      bump(next.priceBands, neighbor, 0.4);
    }
  }
  return next;
}

/** Les N clés les plus fortes (poids strictement positif) d'une dimension. */
export function topEntries(map: Record<string, number>, count: number): Array<[string, number]> {
  return Object.entries(map)
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);
}
