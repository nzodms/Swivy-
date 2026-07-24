import { products, productById } from '@/mocks/products';
import { merchantById } from '@/mocks/merchants';
import type { Merchant, Product } from '@/types';

/**
 * Couche d'accès aux produits.
 * Aujourd'hui : catalogue local avec latence simulée (pour exercer
 * skeletons et états de chargement). Demain : requêtes Supabase —
 * la signature des fonctions ne changera pas.
 */

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchCatalog(): Promise<Product[]> {
  await simulateLatency(350);
  return products;
}

export async function fetchProduct(id: string): Promise<Product> {
  await simulateLatency(200);
  const product = productById.get(id);
  if (!product) {
    throw new Error(`Produit introuvable: ${id}`);
  }
  return product;
}

export function getMerchant(merchantId: string): Merchant | undefined {
  return merchantById(merchantId);
}

/** Ouverture de la page marchand — trace le clic sortant. */
export function merchantUrlFor(product: Product): string {
  return product.url;
}
