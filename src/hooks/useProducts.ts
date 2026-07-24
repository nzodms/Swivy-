import { useQuery } from '@tanstack/react-query';

import { fetchCatalog, fetchProduct } from '@/services/productsService';
import { similarProducts } from '@/features/recommendations';
import type { Product } from '@/types';

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: fetchCatalog,
    staleTime: Infinity,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id as string),
    enabled: Boolean(id),
  });
}

export function useSimilarProducts(product: Product | undefined, count = 8) {
  const { data: catalog } = useCatalog();
  if (!product || !catalog) return [];
  return similarProducts(product, catalog, count);
}
