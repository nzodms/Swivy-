# Design system

Identité : claire, lumineuse, premium, chaleureuse. Fond blanc, beaucoup d'air,
un seul accent (sauge), ombres discrètes, grands arrondis réservés aux cartes
immersives. Aucun emoji dans l'interface ; toutes les icônes viennent de
Lucide (vectorielles, cohérentes, `strokeWidth` 2–2.4).

## Tokens (`src/theme`)

### Couleurs (`colors.ts`)

| Token | Valeur | Usage |
| --- | --- | --- |
| `background` | `#FFFFFF` | Fond principal |
| `backgroundSubtle` | `#F7F7F5` | Fond secondaire, stat cards |
| `textPrimary` | `#151515` | Titres, corps |
| `textSecondary` | `#737373` | Sous-titres, légendes |
| `border` | `#E8E8E5` | Bordures |
| `accent` / `accentDeep` / `accentSoft` | `#71805C` / `#59674A` / `#EEF1E8` | Sauge : actif, progressions, badges |
| `like` | `#4E9B6F` | Vert doux (jamais fluo) |
| `dislike` | `#DE6A4E` | Corail doux |
| `superlike` | `#A34E78` | Rose profond élégant |
| `frost` | `rgba(255,255,255,0.82)` | Pastilles posées sur photo |

Les CTA principaux sont noirs (`textPrimary`) — l'accent sauge marque l'état,
pas l'action.

### Autres échelles

- **Espacement** (`spacing.ts`) : base 4 — `xxs 4 · xs 8 · sm 12 · md 16 ·
  lg 20 · xl 24 · xxl 32 · xxxl 40 · huge 56`. Gouttière d'écran : `lg`.
- **Rayons** (`radius.ts`) : `xs 8 → xl 28`, `card 30` (cartes de swipe
  uniquement), `pill` pour boutons et chips. Pas d'arrondi "partout".
- **Ombres** (`shadows.ts`) : `subtle`, `card`, `floating` — opacité ≤ 0.12.
- **Motion** (`motion.ts`) : durées 120–320 ms, trois ressorts nommés
  (`settle`, `enter`, `press`), seuils de swipe centralisés.
- **Couches** (`layers.ts`) : z-index et opacités nommés.

## Typographie (`typography.ts`)

Manrope (400 → 800), chargée via `@expo-google-fonts/manrope`.

| Variante | Taille / interligne | Usage |
| --- | --- | --- |
| `display` | 34 / 41 | Grand titre (welcome, résultat) |
| `title` | 28 / 34 | Titre d'écran |
| `heading` | 21 / 27 | Titre de section |
| `subheading` | 17 / 23 | Sous-titres forts |
| `body` / `bodyMedium` | 16 / 24 | Corps |
| `bodySmall` | 15 / 21 | Corps secondaire |
| `caption` | 13 / 18 | Légendes |
| `micro` | 12 / 16 | Pastilles, labels de tab |

Jamais de texte tout en majuscules ; letter-spacing légèrement négatif sur les
titres.

## Composants (`src/components` + features)

| Composant | Rôle |
| --- | --- |
| `AppScreen` | Fond, safe areas, gouttières ; réserve la place de la bottom nav |
| `AppHeader` | Titre fort + sous-titre + actions |
| `AppText` | Texte typographié (variant + couleur token) |
| `AppButton` | CTA pilule (primary noir, secondary, ghost, accent) avec micro-scale et haptique |
| `IconButton` | Bouton icône circulaire, hitSlop ≥ 44 px |
| `ProductSwipeCard` | Carte immersive du feed : image plein cadre, dégradé bas léger, pagination photos, compatibilité, marchand |
| `SwipeDeck` / `SwipeBadge` / `SwipeActionBar` | Pile gestuelle Reanimated, étiquettes de feedback, actions |
| `ProductGridCard` / `ProductCarousel` | Grilles et carrousels éditoriaux |
| `ProductPrice` / `CompatibilityBadge` / `StyleTag` / `MerchantBadge` / `FilterChip` | Atomes produit |
| `BottomNavigation` | Tab bar flottante givrée, 4 onglets, actif sauge |
| `Skeleton` / `EmptyState` / `ErrorState` / `LoadingState` | États système |
| `Toast` | Confirmation globale (store dédié) |
| `PreferenceBar` / `StyleDnaCard` | ADN esthétique |
| `OnboardingScaffold` / `OnboardingProgress` / `SelectableTile` / `BudgetRangeSlider` | Onboarding |
| `ImageGallery` | Galerie paginée de la fiche produit |

## Accessibilité

Cibles ≥ 44 px (`minTouchTarget`), labels `accessibilityLabel`/`Role`/`State`
sur tous les contrôles, états jamais portés par la couleur seule (icône +
libellé), contrastes vérifiés sur fond blanc, textes ≥ 12 px.
