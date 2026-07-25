# Swivy

**Découvre des produits qui correspondent vraiment à ton style.**

Swivy est une application mobile de découverte shopping par swipe. La première
niche est la décoration intérieure ; l'architecture (attributs universels,
moteur de recommandation agnostique) est prête pour la mode, les sneakers, les
bijoux, les montres et tout autre univers lifestyle.

## Le produit en 30 secondes

- Swipe à droite : j'aime — sauvegardé automatiquement en wishlist.
- Swipe à gauche : pas pour moi.
- Swipe vers le haut : coup de cœur (signal fort).
- Bouton similaires : plus de produits dans le même esprit.
- Appui sur la carte : fiche produit détaillée, avec la **raison** de la
  recommandation ("parce que tu apprécies les formes arrondies…").

À chaque geste, le profil esthétique local (styles, couleurs, matières, budget,
formes, audace) se déplace, et le feed devient plus juste.

## Stack

Expo SDK 54 · React Native 0.81 · TypeScript strict · Expo Router ·
Reanimated 4 · Gesture Handler · Zustand (persisté) · TanStack Query · Zod ·
React Hook Form · Expo Image / Haptics / Blur · Lucide · Supabase (PostgreSQL,
Auth, pgvector).

## Lancer l'application

```bash
npm install
npm start          # puis i (iOS simulator), a (Android) ou scan du QR avec Expo Go
```

Aucune configuration n'est requise : sans variables d'environnement, l'app
tourne intégralement sur le catalogue de démonstration local (105 produits) et
un profil invité persisté sur l'appareil.

Pour brancher Supabase (optionnel) :

```bash
cp .env.example .env   # renseigner EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY
```

puis appliquer `supabase/migrations/` et `supabase/seed.sql` (voir
[docs/SETUP.md](docs/SETUP.md)).

## Parcours complet testable

Onboarding (pièces → catégories → budget → calibration par swipe → profil
généré) → feed de swipe avec annulation → fiche produit → similaires →
favoris filtrables et triables → sélections "Pour toi" → ADN esthétique dans
Profil.

## Version web (Vercel)

L'app tourne aussi dans le navigateur (Expo Web + react-native-web) : swipe à
la souris et au tactile, expérience centrée en largeur téléphone sur desktop,
plein écran sur mobile web. `vercel.json` est prêt :

```bash
npm run build:web        # exporte dist/ (SPA)
npx vercel deploy --prod # depuis un poste connecté à ton compte Vercel
```

Alternative sans CLI : importer le dépôt dans Vercel (Add New Project) — la
configuration est lue depuis `vercel.json`, aucune variable requise pour le
mode démo. Les rewrites font qu'un rechargement sur une route profonde ne
renvoie jamais de 404.

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm start` | Serveur de développement Expo (natif + web) |
| `npm test` | Typecheck + audit du catalogue + simulation du moteur |
| `npm run typecheck` | TypeScript strict, zéro erreur attendue |
| `npm run lint` | ESLint (config Expo) |
| `npm run test:reco` | Simulation multi-personas du moteur → `docs/RECOMMENDATION_TESTS.md` |
| `npm run audit:catalog` | Assertions de cohérence sur les 105 produits |
| `npm run build:web` | Export web de production (`dist/`) |
| `npm run generate:seed` | Régénère `supabase/seed.sql` depuis `src/mocks` |
| `npx tsx scripts/e2e-web.ts` | Parcours de bout en bout Chromium sur `dist/` (servir avec `npx serve -s dist -l 4173`) |

## Écran de diagnostic

Appui long sur l'avatar (onglet Profil) ou route `/dev/diagnostics` : profil
de goût complet, décomposition du score de la carte courante, exploration,
derniers swipes, exclusions — voir [docs/DIAGNOSTICS.md](docs/DIAGNOSTICS.md).

## Documentation

- [docs/VISUAL_DIRECTION_V2.md](docs/VISUAL_DIRECTION_V2.md) — direction artistique V2 (référence)
- [docs/MOTION_SYSTEM.md](docs/MOTION_SYSTEM.md) — système d'animations et calibrage du swipe
- [docs/ENGAGEMENT_LOOP.md](docs/ENGAGEMENT_LOOP.md) — boucle d'engagement sans manipulation
- [docs/SCREEN_AUDIT.md](docs/SCREEN_AUDIT.md) — audit V1 → décisions V2, scénarios UX
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — structure du code, flux de données
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — tokens, typographie, composants
- [docs/DATABASE.md](docs/DATABASE.md) — schéma Supabase et modèle universel
- [docs/RECOMMENDATION_ENGINE.md](docs/RECOMMENDATION_ENGINE.md) — moteur V1
- [docs/RECOMMENDATION_TESTS.md](docs/RECOMMENDATION_TESTS.md) — rapport de simulation du moteur
- [docs/ANALYTICS_EVENTS.md](docs/ANALYTICS_EVENTS.md) — instrumentation produit locale
- [docs/DIAGNOSTICS.md](docs/DIAGNOSTICS.md) — écran développeur
- [docs/SETUP.md](docs/SETUP.md) — installation détaillée et variables d'environnement

## Variables d'environnement

| Variable | Requise | Rôle |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Non | URL du projet Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Non | Clé anonyme Supabase |

Sans ces variables : catalogue local, auth en mode démo, profil sur l'appareil.
