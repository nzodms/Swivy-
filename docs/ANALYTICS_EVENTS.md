# Événements analytics

Instrumentation produit **locale et typée** (`src/features/analytics`). Aucun
service tiers. Les événements sont stockés dans une file persistée sur
l'appareil (AsyncStorage, 600 événements max, FIFO) et pourront être poussés
vers Supabase par un adaptateur implémentant `AnalyticsAdapter`.

## Enveloppe commune

Chaque événement (`AnalyticsEvent`) porte :

| Champ | Description |
| --- | --- |
| `id` | Identifiant unique de l'événement |
| `name` | Nom typé (voir tableau) |
| `sessionId` | Une session par lancement de l'app |
| `userId` | Utilisateur connecté, sinon `null` |
| `anonymousId` | Identifiant anonyme stable de l'appareil |
| `at` | Timestamp epoch ms |

Champs contextuels optionnels : `productId`, `position` (position dans le
feed), `exposureMs` (temps d'exposition de la carte), `score` (compatibilité
affichée 0-100), `reason` (raison de recommandation), `previousAction`
(contexte d'un undo), `screen`, `durationMs` (sessions).

## Événements émis

| Événement | Déclencheur | Champs notables |
| --- | --- | --- |
| `session_started` | Montage de l'app | — |
| `session_ended` | Démontage de l'app | `durationMs` |
| `onboarding_started` | CTA « Découvrir mon style » | `screen` |
| `calibration_swipe` | Chaque swipe de calibration | `productId`, `position` |
| `onboarding_completed` | CTA « Commencer à découvrir » | `screen` |
| `product_impression` | Une carte devient le dessus du deck | `productId`, `position`, `score` |
| `product_like` / `product_dislike` / `product_superlike` | Swipe (geste ou bouton) | `productId`, `position`, `exposureMs`, `score`, `reason` |
| `product_undo` | Annulation du dernier swipe | `productId`, `previousAction` |
| `product_opened` | Ouverture de la fiche produit | `productId`, `score`, `reason` |
| `similar_product_opened` | Ouverture de l'écran similaires | `productId` |
| `favorite_added` / `favorite_removed` | Wishlist (toutes provenances) | `productId` |
| `merchant_clicked` | CTA « Voir chez le marchand » | `productId` |

## Utilisation

```ts
import { track } from '@/features/analytics/track';

track('product_opened', { productId, score, reason, screen: 'product' });
```

`track` est une fonction simple (pas un hook) : appelable depuis stores,
hooks et gestionnaires. `useSessionLifecycle()` est monté une fois à la
racine.

## Adaptateur Supabase (plus tard)

```ts
import type { AnalyticsAdapter } from '@/features/analytics/events';

class SupabaseAdapter implements AnalyticsAdapter {
  async flush(events) {
    // swipes → public.swipes, impressions → recommendation_impressions,
    // clics → product_clicks. Batch + retry, puis purge locale.
  }
}
```

Le schéma SQL (`recommendation_sessions`, `recommendation_impressions`,
`product_clicks`) est déjà en place — voir `docs/DATABASE.md`.
