import { z } from 'zod';

/**
 * Modèle produit universel : la décoration est la première niche,
 * mais tout attribut est extensible (mode, sneakers, bijoux, montres…).
 */

export const categorySlugSchema = z.enum([
  'canapes',
  'fauteuils',
  'tables',
  'chaises',
  'luminaires',
  'tapis',
  'rangements',
  'objets-deco',
]);
export type CategorySlug = z.infer<typeof categorySlugSchema>;

export const styleSlugSchema = z.enum([
  'minimaliste-chaleureux',
  'contemporain',
  'japandi',
  'scandinave',
  'organique',
  'art-deco',
  'industriel',
  'boheme',
  'vintage',
]);
export type StyleSlug = z.infer<typeof styleSlugSchema>;

export const roomSlugSchema = z.enum([
  'salon',
  'chambre',
  'cuisine',
  'bureau',
  'salle-a-manger',
  'exterieur',
]);
export type RoomSlug = z.infer<typeof roomSlugSchema>;

export const priceBandSchema = z.enum(['under-100', '100-300', '300-700', 'over-700']);
export type PriceBand = z.infer<typeof priceBandSchema>;

export const productBadgeSchema = z.enum(['nouveau', 'promo', 'populaire', 'piece-rare', 'eco-concu']);
export type ProductBadge = z.infer<typeof productBadgeSchema>;

export const merchantSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  shippingInfo: z.string().optional(),
});
export type Merchant = z.infer<typeof merchantSchema>;

export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  brand: z.string().min(1),
  price: z.number().positive(),
  previousPrice: z.number().positive().optional(),
  currency: z.literal('EUR'),
  images: z.array(z.string().url()).min(1),
  category: categorySlugSchema,
  styles: z.array(styleSlugSchema).min(1),
  colors: z.array(z.string()).min(1),
  materials: z.array(z.string()).min(1),
  shapes: z.array(z.string()).default([]),
  rooms: z.array(roomSlugSchema).min(1),
  description: z.string().min(1),
  dimensions: z.string(),
  merchantId: z.string(),
  url: z.string().url(),
  inStock: z.boolean(),
  popularity: z.number().min(0).max(1),
  /** Audace visuelle du produit, 0 = très sage, 1 = très original. */
  boldness: z.number().min(0).max(1),
  createdAt: z.string(),
  badges: z.array(productBadgeSchema).default([]),
});
export type Product = z.infer<typeof productSchema>;

export function priceBandOf(price: number): PriceBand {
  if (price < 100) return 'under-100';
  if (price < 300) return '100-300';
  if (price < 700) return '300-700';
  return 'over-700';
}

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  canapes: 'Canapés',
  fauteuils: 'Fauteuils',
  tables: 'Tables',
  chaises: 'Chaises',
  luminaires: 'Luminaires',
  tapis: 'Tapis',
  rangements: 'Rangements',
  'objets-deco': 'Objets déco',
};

export const STYLE_LABELS: Record<StyleSlug, string> = {
  'minimaliste-chaleureux': 'Minimaliste chaleureux',
  contemporain: 'Contemporain',
  japandi: 'Japandi',
  scandinave: 'Scandinave',
  organique: 'Formes organiques',
  'art-deco': 'Art déco',
  industriel: 'Industriel',
  boheme: 'Bohème',
  vintage: 'Vintage',
};

export const ROOM_LABELS: Record<RoomSlug, string> = {
  salon: 'Salon',
  chambre: 'Chambre',
  cuisine: 'Cuisine',
  bureau: 'Bureau',
  'salle-a-manger': 'Salle à manger',
  exterieur: 'Extérieur',
};

export const PRICE_BAND_LABELS: Record<PriceBand, string> = {
  'under-100': 'Moins de 100 €',
  '100-300': '100 à 300 €',
  '300-700': '300 à 700 €',
  'over-700': '700 € et plus',
};

export const BADGE_LABELS: Record<ProductBadge, string> = {
  nouveau: 'Nouveau',
  promo: 'Promo',
  populaire: 'Populaire',
  'piece-rare': 'Pièce rare',
  'eco-concu': 'Éco-conçu',
};
