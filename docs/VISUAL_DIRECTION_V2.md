# Direction visuelle V2

## Diagnostic de la V1 (pourquoi on change)

La V1 est propre mais plate : tout est pilule ou carte arrondie, tout est
sauge/beige, chaque écran répète le même pattern (header + cartes + chips),
des pourcentages sont affichés partout, les CTA noirs sont interchangeables
avec n'importe quelle app. C'est l'« effet IA » : correct, sage, générique.

## Intention V2

Une marque de **personal shopper** : précise, chaleureuse, assurée. Le blanc
domine, le texte est graphite, et une seule couleur signe l'app — un vert
cyprès profond — avec un cuivre réservé aux moments spéciaux. La serif
n'apparaît que là où l'app « parle » (édito, révélations), jamais dans
l'interface utilitaire.

## Palette

| Rôle | Token | Valeur | Usage strict |
| --- | --- | --- | --- |
| Fond | `background` | `#FFFFFF` | Fond de tous les écrans |
| Surface secondaire | `surface` | `#F6F6F4` | Blocs informatifs, packshots |
| Surface pressée | `surfaceMuted` | `#ECECEA` | États pressés, skeletons |
| Texte | `ink` | `#1C1C1E` | Titres, corps |
| Texte secondaire | `inkSecondary` | `#66666B` | Sous-titres, légendes |
| Texte tertiaire | `inkTertiary` | `#9C9CA1` | Métadonnées |
| Bordure | `border` | `#E5E5E2` | Hairlines, contours |
| **Marque** | `brand` | `#1D4A3F` | CTA prioritaires, actif nav, like |
| Marque profonde | `brandDeep` | `#123830` | Pressed, texte sur fond brandSoft |
| Marque teintée | `brandSoft` | `#E9F0EC` | Fonds de signaux, sélection |
| **Cuivre** | `copper` | `#B4562F` | Coups de cœur, révélations, baisses de prix — RIEN d'autre |
| Cuivre teinté | `copperSoft` | `#F8ECE4` | Fond des moments spéciaux |
| Rejet | `dislike` | `#5F5F66` | « Pas pour moi » — graphite, jamais punitif |
| Erreur | `danger` | `#B3402C` | Erreurs système uniquement |

Règles : jamais deux couleurs d'accent dans le même bloc ; le cuivre
n'apparaît qu'une fois par écran au maximum ; le vert marque porte l'action,
pas la décoration.

## Typographies

- **Sans (interface)** : Manrope 400–800. Tout l'utilitaire.
- **Serif (voix éditoriale)** : Fraunces 500–600. Uniquement : titre du
  welcome, résultat de profil, hero « Pour toi », cartes de révélation, nom
  du produit dans la fiche. Jamais dans les boutons, chips, nav ou listes.

Échelle (plus dense que V1) :

| Variante | Police | Taille/Interligne |
| --- | --- | --- |
| `editorialTitle` | Fraunces 560 | 30/36 |
| `editorial` | Fraunces 540 | 22/28 |
| `title` | Manrope 800 | 24/30 |
| `heading` | Manrope 700 | 18/24 |
| `subheading` | Manrope 600 | 16/22 |
| `body` | Manrope 400/500 | 15/22 |
| `caption` | Manrope 500 | 13/18 |
| `micro` | Manrope 600 | 11/15 |

## Rayons différenciés (fini le tout-pilule)

| Composant | Rayon |
| --- | --- |
| Carte de swipe | 24 |
| Cartes grille / blocs | 14 |
| Boutons | 14 (rectangles adoucis, plus jamais pilule) |
| Champs | 12 |
| Chips de filtre | 10 |
| Tags d'information | 8 |
| Avatars, points | pleins |

## Bordures & ombres

Hairlines 1 px partout où une séparation est nécessaire. Ombres **rares et
précises** : uniquement la carte de swipe (portée, y=12, 8 % d'opacité) et
la barre sticky de la fiche produit. Tout le reste vit par la bordure et le
contraste — plus aucune « lueur diffuse » sous les petits composants.

## Hiérarchie des surfaces

1. **Surface principale** : blanc, contenu.
2. **Surface interactive** : blanc + hairline (cartes cliquables, réglages).
3. **Surface éditoriale** : `surface` ou image pleine, voix serif.
4. **Action prioritaire** : bloc `brand`, texte blanc, un seul par écran.
5. **Action secondaire** : hairline, texte ink.
6. **Information** : texte secondaire, tags gris rayon 8.
7. **Statut / signal** : `brandSoft` + texte `brandDeep`, une ligne, jamais un mur de badges.
8. **Moment spécial** : `copperSoft` + cuivre.

## Densité & grille

Gouttière 20. Sections espacées de 28 (V1 : 32–40). Titres d'écran 24 au lieu
de 28. Les écrans commencent par le contenu, pas par de l'air : le premier
élément utile est visible au-dessus de la ligne de flottaison sur iPhone SE.
Chips alignées sur une seule ligne de base, labels et valeurs séparés de 2.

## Signature de marque

- Le **spectre de goût** : une barre segmentée fine (les styles dominants en
  dégradé de verts + un segment cuivre pour l'audace) — visualisation
  propriétaire du profil, réutilisée du résultat d'onboarding au Profil.
- La **ligne de signal** : « Parce que tu as aimé … » en `brandSoft`, une
  seule phrase, toujours fondée sur une vraie donnée du profil.
- Les pourcentages de compatibilité n'apparaissent **que dans la fiche
  produit** (score détaillé). Nulle part ailleurs.

## À éviter (checklist anti-« effet IA »)

- Plus de 2 pills dans un même bloc.
- Badge + tag + pourcentage empilés sur une carte.
- Ombre diffuse sous un composant < 80 px.
- Serif dans un composant utilitaire.
- Un carrousel identique répété trois fois de suite.
- Un écran dont le premier tiers est vide.
- Une phrase de reco non fondée sur une donnée réelle.
