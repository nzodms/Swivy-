import type { OnboardingSelections, Product, TasteProfile } from '@/types';
import { contextBonus, rawAffinity } from './scoring';

/**
 * Construction du deck de swipe.
 * Mélange contrôlé : ~70 % très compatibles, ~20 % adjacents, ~10 % exploratoires,
 * avec des garde-fous contre la répétition (marque, catégorie, style).
 */

export interface DeckOptions {
  catalog: Product[];
  profile: TasteProfile;
  selections: OnboardingSelections;
  /** Produits déjà vus (swipés ou affichés récemment). */
  seenIds: ReadonlySet<string>;
  count: number;
}

interface ScoredProduct {
  product: Product;
  score: number;
}

/** Motif de tirage sur 10 cartes : 7 compatibles, 2 adjacentes, 1 exploratoire. */
const TIER_PATTERN: readonly ('top' | 'mid' | 'wild')[] = [
  'top', 'top', 'mid', 'top', 'top', 'wild', 'top', 'mid', 'top', 'top',
];

const MAX_SAME_BRAND_WINDOW = 2;
const MAX_SAME_CATEGORY_RUN = 2;
const MAX_SAME_STYLE_RUN = 3;
/** Part maximale d'une même marque dans un deck complet. */
const MAX_BRAND_SHARE = 0.25;

function violatesDiversity(candidate: Product, picked: Product[], targetCount: number): boolean {
  // Plafond global : une marque ne dépasse jamais ~25 % du deck.
  const brandCap = Math.max(2, Math.floor(targetCount * MAX_BRAND_SHARE));
  const totalSameBrand = picked.filter((p) => p.brand === candidate.brand).length;
  if (totalSameBrand >= brandCap) return true;

  const recentBrandWindow = picked.slice(-5);
  const sameBrand = recentBrandWindow.filter((p) => p.brand === candidate.brand).length;
  if (sameBrand >= MAX_SAME_BRAND_WINDOW) return true;

  const lastCategories = picked.slice(-MAX_SAME_CATEGORY_RUN);
  if (
    lastCategories.length === MAX_SAME_CATEGORY_RUN &&
    lastCategories.every((p) => p.category === candidate.category)
  ) {
    return true;
  }

  const primaryStyle = candidate.styles[0];
  const lastStyles = picked.slice(-MAX_SAME_STYLE_RUN);
  if (
    primaryStyle !== undefined &&
    lastStyles.length === MAX_SAME_STYLE_RUN &&
    lastStyles.every((p) => p.styles[0] === primaryStyle)
  ) {
    return true;
  }
  return false;
}

function takeFrom(
  tier: ScoredProduct[],
  picked: Product[],
  pickedIds: Set<string>,
  targetCount: number,
): Product | null {
  for (let i = 0; i < tier.length; i += 1) {
    const entry = tier[i];
    if (!entry) continue;
    if (pickedIds.has(entry.product.id)) continue;
    if (violatesDiversity(entry.product, picked, targetCount)) continue;
    tier.splice(i, 1);
    return entry.product;
  }
  // Aucun candidat ne respecte la diversité : on relâche la contrainte
  // plutôt que de rendre un deck vide.
  const fallback = tier.find((e) => !pickedIds.has(e.product.id));
  if (fallback) {
    tier.splice(tier.indexOf(fallback), 1);
    return fallback.product;
  }
  return null;
}

/**
 * Construit un deck ordonné de `count` produits jamais vus.
 */
export function buildDeck(options: DeckOptions): Product[] {
  const { catalog, profile, selections, seenIds, count } = options;

  const pool: ScoredProduct[] = catalog
    .filter((product) => !seenIds.has(product.id) && product.inStock)
    .map((product) => ({
      product,
      score:
        rawAffinity(profile, product) +
        contextBonus(product, selections) +
        // Bruit léger : deux sessions ne donnent jamais exactement le même deck.
        Math.random() * 0.06,
    }))
    .sort((a, b) => b.score - a.score);

  if (pool.length === 0) return [];

  const topEnd = Math.max(1, Math.floor(pool.length * 0.3));
  const midEnd = Math.max(topEnd + 1, Math.floor(pool.length * 0.7));
  const tiers = {
    top: pool.slice(0, topEnd),
    mid: pool.slice(topEnd, midEnd),
    wild: pool.slice(midEnd),
  };

  const picked: Product[] = [];
  const pickedIds = new Set<string>();

  for (let i = 0; picked.length < count; i += 1) {
    const wanted = TIER_PATTERN[i % TIER_PATTERN.length] ?? 'top';
    const order: ('top' | 'mid' | 'wild')[] =
      wanted === 'top' ? ['top', 'mid', 'wild'] : wanted === 'mid' ? ['mid', 'top', 'wild'] : ['wild', 'mid', 'top'];

    let product: Product | null = null;
    for (const tierName of order) {
      product = takeFrom(tiers[tierName], picked, pickedIds, count);
      if (product) break;
    }
    if (!product) break; // catalogue épuisé
    picked.push(product);
    pickedIds.add(product.id);
  }

  return picked;
}

/**
 * Produits similaires à un produit donné ("plus de produits comme celui-ci").
 * Similarité d'attributs simple, sans profil.
 */
export function similarProducts(product: Product, catalog: Product[], count = 8): Product[] {
  return catalog
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => {
      let score = 0;
      if (candidate.category === product.category) score += 2;
      score += candidate.styles.filter((s) => product.styles.includes(s)).length * 1.5;
      score += candidate.colors.filter((c) => product.colors.includes(c)).length;
      score += candidate.materials.filter((m) => product.materials.includes(m)).length;
      const priceRatio = Math.abs(candidate.price - product.price) / product.price;
      score -= Math.min(1.5, priceRatio);
      if (candidate.brand === product.brand) score += 0.5;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((entry) => entry.candidate);
}
