import type { CategorySlug, PriceBand, RoomSlug, StyleSlug } from './product';

/**
 * Profil de goût : cartes de poids par dimension d'attribut.
 * Chaque swipe déplace ces poids ; le moteur de reco les lit.
 */
export interface TasteProfile {
  styles: Record<string, number>;
  colors: Record<string, number>;
  materials: Record<string, number>;
  categories: Record<string, number>;
  shapes: Record<string, number>;
  priceBands: Record<string, number>;
  brands: Record<string, number>;
  /** 0 = goûts très sages, 1 = goûts très audacieux. */
  boldness: number;
  /** Nombre total de signaux reçus (likes + dislikes + superlikes). */
  signalCount: number;
}

export interface OnboardingSelections {
  rooms: RoomSlug[];
  categories: CategorySlug[];
  priceBand: PriceBand | null;
  priceRange: { min: number; max: number } | null;
}

export interface StyleSummary {
  dominantStyles: { style: StyleSlug; share: number }[];
  topColors: string[];
  topMaterials: string[];
  averageBudget: number | null;
  boldness: number;
}
