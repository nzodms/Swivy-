import { productSchema, type Product } from '@/types';
import { imagesFor, type ImagePoolCategory } from './images';
import { livingSeeds } from './catalog/living';
import { seatingSeeds } from './catalog/seating';
import type { SeedProduct, SeedVariant } from './catalog/seed';
import { variantSeeds } from './catalog/variants';
import { merchantById } from './merchants';

/** Date de référence du catalogue de démonstration. */
const CATALOG_DATE = Date.UTC(2026, 6, 20);
const DAY_MS = 24 * 60 * 60 * 1000;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildProduct(seed: SeedProduct): Product {
  const merchant = merchantById(seed.merchant);
  if (!merchant) {
    throw new Error(`Marchand inconnu pour le produit ${seed.id}: ${seed.merchant}`);
  }
  return productSchema.parse({
    id: seed.id,
    name: seed.name,
    brand: seed.brand,
    price: seed.price,
    previousPrice: seed.prev,
    currency: 'EUR',
    images: imagesFor(seed.cat as ImagePoolCategory, seed.img),
    category: seed.cat,
    styles: seed.styles,
    colors: seed.colors,
    materials: seed.materials,
    shapes: seed.shapes,
    rooms: seed.rooms,
    description: seed.desc,
    dimensions: seed.dims,
    merchantId: seed.merchant,
    url: `https://www.${merchant.domain}/produits/${slugify(seed.name)}`,
    inStock: true,
    popularity: seed.pop,
    boldness: seed.bold,
    createdAt: new Date(CATALOG_DATE - seed.days * DAY_MS).toISOString(),
    badges: seed.badges ?? [],
  });
}

function buildVariant(variant: SeedVariant, baseSeed: SeedProduct): Product {
  const base = buildProduct({
    ...baseSeed,
    id: variant.id,
    name: `${baseSeed.name} — ${variant.suffix}`,
    price: baseSeed.price + (variant.priceDelta ?? 0),
    prev: variant.priceDelta ? undefined : baseSeed.prev,
    colors: variant.colors,
    materials: variant.materials ?? baseSeed.materials,
    img: variant.img,
    // Les déclinaisons sont un peu moins mises en avant que la pièce d'origine.
    pop: Math.max(0, baseSeed.pop - 0.12),
    badges: (baseSeed.badges ?? []).filter((b) => b !== 'promo'),
  });
  return base;
}

function buildCatalog(): Product[] {
  const seeds = [...seatingSeeds, ...livingSeeds];
  const seedById = new Map(seeds.map((s) => [s.id, s]));
  const products = seeds.map(buildProduct);

  for (const variant of variantSeeds) {
    const base = seedById.get(variant.of);
    if (!base) {
      throw new Error(`Variante orpheline: ${variant.id} (base ${variant.of} introuvable)`);
    }
    products.push(buildVariant(variant, base));
  }

  const ids = new Set<string>();
  for (const product of products) {
    if (ids.has(product.id)) {
      throw new Error(`Identifiant produit dupliqué: ${product.id}`);
    }
    ids.add(product.id);
  }
  return products;
}

/** Catalogue complet de démonstration (validé par Zod au chargement). */
export const products: Product[] = buildCatalog();

export const productById = new Map(products.map((p) => [p.id, p]));
