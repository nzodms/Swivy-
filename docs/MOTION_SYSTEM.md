# Système de motion

Principe : le mouvement confirme, il ne décore pas. Rapide (≤ 320 ms),
proche (≤ 24 px de déplacement), jamais bloquant.

## Tokens (`src/theme/motion.ts`)

### Durées
| Token | ms | Usage |
| --- | --- | --- |
| `instant` | 110 | Pressions, changements de teinte |
| `fast` | 170 | Chips, toggles, tags |
| `base` | 240 | Entrées d'éléments, onglets |
| `slow` | 320 | Sorties de cartes, révélations |

### Ressorts
| Token | Config | Usage |
| --- | --- | --- |
| `press` | d18 s380 m0.6 | Compression de bouton (échelle 0.97) |
| `settle` | d24 s300 m0.9 | Retour élastique de la carte swipée |
| `enter` | d22 s240 m0.8 | Arrivée de la carte suivante, barres |
| `reveal` | d16 s160 m1 | Moments spéciaux (respiration plus ample) |

### Distances & échelles
- Pression : échelle 0.97 (boutons), 0.94 (icônes).
- Entrée de carte : la carte 2 passe de 0.955 → 1 et remonte de 12 px.
- Entrées d'écran : fade + 10 px vers le haut, jamais plus.
- Toast : glisse du haut, ressort `enter`.

## Le geste de swipe (calibrage précis)

- **Résistance** : 1:1 horizontal, 0.9 vertical (le superlike se mérite).
- **Seuil distance** : 96 px horizontal, 118 px vers le haut.
- **Seuil vélocité** : 850 px/s — un flick rapide part toujours.
- **Rotation** : ±10° aux bords de l'écran, pivot au centre.
- **Sortie** : 240 ms, la carte suit la tangente du geste.
- **Retour** : ressort `settle`, dépassement < 3 px.
- **Badges de feedback** : opacité = distance/seuil, échelle 0.92 → 1.
- **Profondeur** : carte 2 visible (échelle 0.955, +12 px), carte 3 en
  réserve invisible pour le préchargement — la pile respire à chaque geste.

## Haptique (couplée au motion)

| Moment | Retour |
| --- | --- |
| Franchissement du seuil de swipe | `selection` (une seule fois par geste) |
| Like confirmé | `light` |
| Coup de cœur confirmé | `success` |
| Annulation | `light` |
| Sélection (chips, onglets, tuiles) | `selection` |
| Révélation de profil | `success` |

## Inventaire des animations

| Contexte | Animation |
| --- | --- |
| Ouverture app | Splash → fade 240 ms |
| Onboarding | Slide horizontal natif + contenus fade/up 10 px |
| Sélection de tuile | Bordure teintée `fast` + échelle 0.97 |
| Progression | Barres en ressort `enter` |
| Changement d'onglet | Indicateur glisse (`enter`), icône échelle 0.94→1 |
| Ajout favori | Cœur : échelle 1→1.25→1 (`press`), teinte cuivre |
| Ouverture fiche | Modal native + contenu fade/up |
| Skeletons | Pulsation d'opacité 0.5↔1, 900 ms, sans translation |
| Révélation (milestone) | Carte `reveal` : fade + échelle 0.96→1 |
| Filtres | Chips : teinte `fast`, aucune re-disposition animée |

## Interdits

Rebonds > 1 oscillation visible, particules, blur animé, translations > 24 px,
toute animation qui retarde une action utilisateur, confettis.
