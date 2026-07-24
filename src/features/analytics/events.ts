/**
 * Événements produit — typés, stockés localement.
 * Aucun service tiers : un adaptateur Supabase pourra consommer
 * la même file d'événements plus tard.
 */

export const ANALYTICS_EVENT_NAMES = [
  'onboarding_started',
  'onboarding_completed',
  'calibration_swipe',
  'product_impression',
  'product_like',
  'product_dislike',
  'product_superlike',
  'product_undo',
  'product_opened',
  'similar_product_opened',
  'favorite_added',
  'favorite_removed',
  'merchant_clicked',
  'session_started',
  'session_ended',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

/** Champs contextuels optionnels, communs à tous les événements. */
export interface AnalyticsPayload {
  productId?: string;
  /** Position (0-based) du produit dans le feed au moment de l'événement. */
  position?: number;
  /** Temps d'exposition de la carte avant l'action, en ms. */
  exposureMs?: number;
  /** Score de compatibilité affiché (0-100). */
  score?: number;
  /** Raison de recommandation présentée à l'utilisateur. */
  reason?: string;
  /** Action de swipe précédente (contexte d'un undo). */
  previousAction?: string;
  /** Écran d'origine ("discovery", "for-you", "favorites", "product"…). */
  screen?: string;
  /** Durée de session, pour session_ended. */
  durationMs?: number;
}

export interface AnalyticsEvent extends AnalyticsPayload {
  id: string;
  name: AnalyticsEventName;
  /** Identifiant de session applicative (une par lancement). */
  sessionId: string;
  /** Identifiant utilisateur connecté, sinon null. */
  userId: string | null;
  /** Identifiant anonyme stable de l'appareil. */
  anonymousId: string;
  /** Timestamp epoch ms. */
  at: number;
}

/**
 * Adaptateur de sortie. `LocalAdapter` (implicite) = les événements restent
 * dans la file locale. Un `SupabaseAdapter` implémentera cette interface
 * pour pousser les lots vers les tables recommendation_* / product_clicks.
 */
export interface AnalyticsAdapter {
  flush(events: AnalyticsEvent[]): Promise<void>;
}
