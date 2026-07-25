import type { CardSignal, RevealContent } from '@/features/recommendations';
import type { Product } from '@/types';

/** Formats de cartes du feed — la variété casse la répétition. */
export type CardPresentation = 'situation' | 'packshot' | 'story';

/** Élément du deck : un produit présenté, ou un moment de révélation. */
export type DeckItem =
  | {
      kind: 'product';
      id: string;
      product: Product;
      presentation: CardPresentation;
      signal: CardSignal | null;
    }
  | {
      kind: 'reveal';
      id: string;
      reveal: RevealContent;
    };
