# Architecture

## Vue d'ensemble

Swivy est une app Expo Router. Les écrans (`app/`) ne contiennent aucune
logique métier : ils composent des composants (`src/components`), des features
(`src/features`) et des stores (`src/stores`). Le moteur de recommandation est
un module TypeScript pur, testable sans React.

```
app/                      # Routes Expo Router (aucune logique métier)
  _layout.tsx             # Fonts, QueryClient, GestureHandler, Stack racine, Toast
  index.tsx               # Aiguillage onboarding / tabs
  (onboarding)/           # welcome → rooms → categories → budget → calibration → result
  (tabs)/                 # index (Découvrir), for-you, favorites, profile
  (auth)/                 # sign-in, sign-up (modal)
  product/[id].tsx        # Fiche produit (modal plein écran)
  similar/[id].tsx        # "Plus de produits comme celui-ci" (modal)
  modals/filters.tsx      # Filtres du feed (form sheet)

src/
  components/             # Design system réutilisable (AppText, AppButton, …)
  features/
    analytics/            # Événements produit typés, file locale persistée
    auth/                 # Schémas Zod, champ RHF, useAuth (Supabase ou démo)
    discovery/            # SwipeDeck, ProductSwipeCard, SwipeActionBar, useSwipeDeck
    import/               # Types du futur pipeline d'import de catalogues (aucune UI)
    onboarding/           # Scaffold, progression, tuiles, range slider
    products/             # ImageGallery
    profile/              # StyleDnaCard
    recommendations/      # Moteur V1 (profil, scoring, deck, explications)
  hooks/                  # useProducts (TanStack Query), useHaptics, hydratation
  mocks/                  # Catalogue de démonstration (source de vérité du seed SQL)
  services/               # supabase (client optionnel), productsService
  stores/                 # Zustand persisté : taste, favorites, session, settings, toast
  theme/                  # Tokens : couleurs, espacements, rayons, ombres, typo, motion
  types/                  # Modèle de domaine + schémas Zod

supabase/
  migrations/             # Schéma PostgreSQL (RLS, pgvector)
  seed.sql                # Généré depuis src/mocks (npm run generate:seed)

scripts/generate-seed.ts  # Générateur du seed
```

## Flux de données

1. **Catalogue** — `productsService.fetchCatalog()` (latence simulée pour
   exercer les skeletons) est mis en cache par TanStack Query. La signature ne
   changera pas quand la source deviendra Supabase.
2. **Profil de goût** — `useTasteStore` (Zustand + AsyncStorage) porte le
   `TasteProfile`, les sélections d'onboarding, l'historique de swipes et les
   instantanés pour l'annulation. Chaque swipe passe par
   `applySwipe(profile, product, action)` (immuable).
3. **Deck** — `useSwipeDeck` demande au moteur (`buildDeck`) un lot de cartes
   excluant le déjà-vu, et se réapprovisionne quand il reste moins de
   4 cartes. Le deck en cours n'est jamais rebattu par un swipe : il est
   seulement complété (stabilité visuelle).
4. **Favoris** — like et superlike alimentent `useFavoritesStore` ;
   l'annulation d'un swipe retire aussi le favori créé.

## Décisions structurantes

- **Local-first** : le profil est calculé sur l'appareil ; Supabase est un
  miroir optionnel (`user_preference_scores`, `swipes`). L'app est pleinement
  fonctionnelle hors connexion sur le catalogue chargé.
- **Attributs universels** : aucun code du moteur ne mentionne la décoration ;
  seules les données (`src/mocks`, seed SQL) sont spécifiques à la niche.
  Ajouter les sneakers = ajouter des catégories, valeurs d'attributs et
  produits.
- **Navigation** : tabs avec barre custom flottante (`BottomNavigation`),
  fiches en modal pour préserver le contexte du feed.
- **Hydratation** : `useStoresHydrated` retient le splash jusqu'à la fin de la
  réhydratation AsyncStorage — pas de flash de mauvaise route.
