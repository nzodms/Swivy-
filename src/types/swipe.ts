export type SwipeAction = 'like' | 'dislike' | 'superlike';

export interface SwipeRecord {
  productId: string;
  action: SwipeAction;
  /** Timestamp epoch ms. */
  at: number;
  /** Contexte dans lequel le swipe a eu lieu. */
  source: 'discovery' | 'calibration' | 'similar';
}
