# Écran de diagnostic interne

Écran développeur hors navigation normale, pour comprendre **pourquoi chaque
produit est recommandé**.

## Accès

**Appui long (≈ 0,6 s) sur l'avatar** dans l'onglet Profil, ou route directe
`/dev/diagnostics` (utile sur web).

## Contenu

- **En-tête** : nombre de signaux du profil, niveau d'audace (valeur brute +
  libellé), nombre de produits encore disponibles dans le catalogue, taille
  du deck actif.
- **Carte du dessus** : affinité brute, bonus contextuels, score affiché,
  raison de recommandation, et **décomposition dimension par dimension**
  (styles, couleurs, matières, catégorie, formes, gamme de prix, marque,
  audace) avec la contribution signée de chacune et les valeurs du produit
  qui ont compté.
- **Exploration** : rappel du motif 70/20/10 et des garde-fous
  anti-répétition actifs.
- **Poids du profil** : toutes les valeurs apprises par dimension (styles,
  couleurs, matières, catégories, marques, budget), positives en sauge,
  négatives en neutre.
- **Derniers swipes** : les 8 dernières actions avec source et heure.
- **Exclusions** : produits swipés + masqués, avec alerte si le profil est
  devenu entièrement négatif.

## Fonctionnement

L'écran lit le deck réel du feed via `useDebugStore` (instantané non
persisté, alimenté par `useSwipeDeck`) et recalcule la décomposition du score
avec `affinityBreakdown` (`src/features/recommendations/scoring.ts`) — les
mêmes fonctions que le moteur, aucune logique dupliquée.
