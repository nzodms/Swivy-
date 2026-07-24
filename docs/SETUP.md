# Installation

## Prérequis

- Node 20+ et npm
- Expo Go sur ton téléphone, ou un simulateur iOS / émulateur Android

## Démarrage rapide (aucune configuration)

```bash
npm install
npm start
```

Puis `i` (simulateur iOS), `a` (Android) ou scan du QR code avec Expo Go.

Sans variables d'environnement, Swivy fonctionne entièrement en local :
catalogue de démonstration (105 produits validés par Zod), profil de goût et
wishlist persistés sur l'appareil, authentification en mode démo.

## Parcours de test recommandé

1. Onboarding : pièces → catégories → budget (options rapides ou range
   slider) → calibration (12 swipes) → profil généré.
2. Découvrir : swipe au geste et aux boutons, annulation, badge de
   compatibilité qui évolue, filtres.
3. Appui sur une carte → fiche produit : galerie, raisons de recommandation,
   similaires, favori, lien marchand.
4. Favoris : filtres par catégorie, tri récent / prix / compatibilité,
   partage, suppression.
5. Pour toi : sélections éditoriales + "Ton style en ce moment".
6. Profil : ADN esthétique, progression, historique, réglages,
   réinitialisation.

## Brancher Supabase (optionnel)

1. Crée un projet sur [supabase.com](https://supabase.com).
2. Applique le schéma puis le seed :

   ```bash
   supabase db push          # ou copier migrations/0001_initial_schema.sql dans l'éditeur SQL
   psql "$DB_URL" -f supabase/seed.sql
   ```

3. Renseigne l'environnement :

   ```bash
   cp .env.example .env
   # EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   # EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

4. Redémarre `npm start`. L'authentification email utilise alors Supabase
   Auth ; Google / Apple nécessitent en plus la configuration des providers
   OAuth dans le dashboard Supabase.

## Régénérer le seed

Le catalogue TypeScript (`src/mocks`) est la source de vérité :

```bash
npm run generate:seed   # réécrit supabase/seed.sql
```

## Dépannage

- **Polices absentes au premier lancement** : le splash reste affiché tant que
  Manrope et les stores ne sont pas prêts — c'est attendu.
- **Images manquantes** : les visuels de démonstration viennent du CDN
  Unsplash ; hors connexion, Expo Image affiche le placeholder flouté.
- **Réinitialiser l'état local** : Profil → "Réinitialiser mon profil", ou
  supprimer l'app (AsyncStorage).
