import { useMemo } from 'react';

import { productById } from '@/mocks/products';
import { useTasteStore } from '@/stores/tasteStore';
import type { Product } from '@/types';

/** Produits aimés (like + superlike), du plus récent au plus ancien. */
export function useLikedProducts(): Product[] {
  const swipes = useTasteStore((state) => state.swipes);
  return useMemo(
    () =>
      [...swipes]
        .reverse()
        .filter((swipe) => swipe.action === 'like' || swipe.action === 'superlike')
        .map((swipe) => productById.get(swipe.productId))
        .filter((product): product is Product => product !== undefined),
    [swipes],
  );
}
