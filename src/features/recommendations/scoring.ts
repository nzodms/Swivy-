import type { OnboardingSelections, Product, TasteProfile } from '@/types';
import { priceBandOf } from '@/types';

/**
 * Score de compatibilité entre un profil de goût et un produit.
 * Purement local : aucun appel réseau, aucun LLM.
 */

interface DimensionSpec {
  weight: number;
  values: (product: Product) => string[];
  map: (profile: TasteProfile) => Record<string, number>;
}

const DIMENSIONS: DimensionSpec[] = [
  { weight: 0.3, values: (p) => p.styles, map: (t) => t.styles },
  { weight: 0.15, values: (p) => p.colors, map: (t) => t.colors },
  { weight: 0.15, values: (p) => p.materials, map: (t) => t.materials },
  { weight: 0.14, values: (p) => [p.category], map: (t) => t.categories },
  { weight: 0.06, values: (p) => p.shapes, map: (t) => t.shapes },
  { weight: 0.1, values: (p) => [priceBandOf(p.price)], map: (t) => t.priceBands },
  { weight: 0.05, values: (p) => [p.brand], map: (t) => t.brands },
];

const BOLDNESS_WEIGHT = 0.05;

/**
 * Compatibilité brute ∈ [-1, 1].
 * Chaque dimension est écrasée par tanh pour qu'aucun attribut
 * sur-représenté n'écrase le reste du profil.
 */
export function rawAffinity(profile: TasteProfile, product: Product): number {
  let total = 0;
  for (const dim of DIMENSIONS) {
    const weights = dim.map(profile);
    const values = dim.values(product);
    if (values.length === 0) continue;
    let sum = 0;
    for (const value of values) sum += weights[value] ?? 0;
    total += dim.weight * Math.tanh(sum / values.length / 2.5);
  }
  total += BOLDNESS_WEIGHT * (1 - Math.abs(profile.boldness - product.boldness) * 2);
  return total;
}

/**
 * Score affiché, en pourcentage.
 * Tant que le profil a peu de signaux, on reste dans une bande
 * médiane prudente plutôt que d'afficher de faux 95 %.
 */
export function compatibilityPercent(profile: TasteProfile, product: Product): number {
  const affinity = rawAffinity(profile, product); // ∈ [-1, 1] en pratique
  const confidence = Math.min(1, profile.signalCount / 25);
  const spread = 0.2 + 0.3 * confidence;
  const centered = 0.62 + spread * affinity;
  return Math.round(Math.min(0.99, Math.max(0.35, centered)) * 100);
}

/** Bonus contextuels utilisés pour ordonner le deck (jamais affichés). */
export function contextBonus(product: Product, selections: OnboardingSelections): number {
  let bonus = 0.08 * product.popularity;

  const ageDays = (Date.now() - Date.parse(product.createdAt)) / 86_400_000;
  if (ageDays < 45) bonus += 0.05;

  if (selections.rooms.length > 0 && product.rooms.some((room) => selections.rooms.includes(room))) {
    bonus += 0.06;
  }
  return bonus;
}
