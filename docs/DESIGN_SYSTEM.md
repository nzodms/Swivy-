# Design system

> **La référence de la direction visuelle actuelle est
> [VISUAL_DIRECTION_V2.md](VISUAL_DIRECTION_V2.md)** (palette, typographies,
> rayons, ombres, densité, hiérarchie des surfaces, signatures de marque).
> Le motion est documenté dans [MOTION_SYSTEM.md](MOTION_SYSTEM.md).
> Ce fichier recense l'implémentation : tokens et composants.

## Tokens (`src/theme`)

| Fichier | Contenu |
| --- | --- |
| `colors.ts` | Blanc, graphite, **vert cyprès** (`accent #1D4A3F`), **cuivre** (`copper #B4562F`, moments spéciaux uniquement), rejet graphite |
| `typography.ts` | Manrope 400–800 (interface) + **Fraunces** 500/600 (`editorialTitle`, `editorial` — voix éditoriale seulement) |
| `radius.ts` | Rayons différenciés : tags 8, chips 10, champs 12, boutons 14, blocs 14–20, carte de swipe 24 |
| `shadows.ts` | Deux ombres seulement : `card` (carte de swipe) et `sticky` (barres) |
| `motion.ts` | Durées 110–320 ms, ressorts nommés (`press`, `settle`, `enter`, `reveal`), seuils de swipe calibrés |
| `spacing.ts` / `layers.ts` | Échelle base 4, z-index et opacités nommés |

## Composants (`src/components` + features)

| Composant | Rôle |
| --- | --- |
| `AppScreen` / `AppText` / `AppButton` / `IconButton` | Fondations (boutons rectangle 14, CTA cyprès) |
| `SignalLine` | **Signature** : une phrase de personnalisation fondée sur le profil |
| `TasteSpectrum` | **Signature** : barre segmentée du profil de goût (verts + cuivre) |
| `ProductSwipeCard` | Carte de feed multi-formats : situation / packshot / mini-story |
| `RevealCard` | Moment de révélation (serif, fond cuivré, spectre réel) |
| `SwipeDeck` / `SwipeBadge` / `SwipeActionBar` | Pile gestuelle calibrée + actions |
| `ProductGridCard` / `ProductCarousel` | Grilles denses, baisse de prix en cuivre, sans pourcentage |
| `FilterChip` / `StyleTag` / `ProductPrice` / `MerchantBadge` | Atomes |
| `BottomNavigation` | Barre pleine largeur, hairline, actif teinte + point |
| `Skeleton` / `EmptyState` / `ErrorState` / `LoadingState` / `Toast` | États système |
| `WebAppFrame` | Cadre téléphone centré sur desktop web |

## Règles d'usage

- Le **pourcentage de compatibilité** n'apparaît que dans la fiche produit.
- Le **cuivre** apparaît au plus une fois par écran.
- La **serif** n'entre jamais dans un composant utilitaire.
- Un seul bouton primaire par écran.

## Accessibilité

Cibles ≥ 44 px, labels/roles/states partout, cartes d'arrière-plan du deck
masquées aux lecteurs d'écran, états jamais portés par la couleur seule,
textes ≥ 11 px.
