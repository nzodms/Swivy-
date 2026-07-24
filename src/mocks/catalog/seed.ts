import type { CategorySlug, ProductBadge, RoomSlug, StyleSlug } from '@/types';

/** Format compact d'écriture du catalogue de démonstration. */
export interface SeedProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  prev?: number;
  cat: CategorySlug;
  styles: StyleSlug[];
  colors: string[];
  materials: string[];
  shapes: string[];
  rooms: RoomSlug[];
  desc: string;
  dims: string;
  merchant: string;
  /** Index de la photo principale dans le pool d'images de la catégorie. */
  img: number;
  /** Audace visuelle (0 sage → 1 très original). */
  bold: number;
  /** Popularité relative (0 → 1). */
  pop: number;
  badges?: ProductBadge[];
  /** Âge du produit en jours (pour la fraîcheur). */
  days: number;
}

/** Déclinaison de couleur/matière d'un produit existant. */
export interface SeedVariant {
  of: string;
  id: string;
  suffix: string;
  colors: string[];
  materials?: string[];
  img: number;
  priceDelta?: number;
}
