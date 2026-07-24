# Moteur de recommandation V1

Module TypeScript pur (`src/features/recommendations`), exécuté localement.
Aucun LLM, aucun réseau : chaque swipe met à jour le profil en < 1 ms.

## Le profil de goût (`tasteProfile.ts`)

`TasteProfile` = cartes de poids par dimension (styles, couleurs, matières,
catégories, formes, gammes de prix, marques) + `boldness` (audace, 0 → 1) +
`signalCount`.

| Action | Poids | Effets |
| --- | --- | --- |
| like | **+1** | attributs du produit ↑, catégorie ↑ (×0.9), gammes de prix voisines ↑ (×0.2), audace converge doucement |
| superlike | **+2.5** | mêmes effets, beaucoup plus marqués |
| dislike | **−0.55** | atténuation — volontairement plus faible qu'un like : un seul rejet ne bannit jamais une catégorie |

Les choix d'onboarding (catégories, budget) sont injectés comme signaux
initiaux doux (`applyOnboardingSelections`) : ils orientent le premier deck
sans figer le profil. Chaque mise à jour est immuable ; le store garde des
instantanés pour l'annulation de swipe.

## Le score (`scoring.ts`)

`rawAffinity` = somme pondérée par dimension, chaque dimension écrasée par
`tanh` pour qu'aucun attribut sur-représenté ne domine :

styles 30 % · couleurs 15 % · matières 15 % · catégorie 14 % · gamme de prix
10 % · formes 6 % · marque 5 % · proximité d'audace 5 %.

`compatibilityPercent` (le "92 % pour ton style" affiché) borne le résultat et
**élargit sa dispersion avec la confiance** (`signalCount / 25`) : avec trois
swipes, l'app n'affiche jamais de faux 95 %.

## Le deck (`deck.ts`)

1. Pool = catalogue − vus − masqués, trié par
   `rawAffinity + bonus contextuels` (popularité ×0.08, fraîcheur < 45 j
   +0.05, pièce sélectionnée +0.06, bruit léger pour varier les sessions).
2. Trois tranches : top 30 % (compatibles), 30–70 % (adjacents), reste
   (exploratoires).
3. Tirage selon le motif **7 top / 2 mid / 1 wild** par tranche de 10 cartes —
   le ratio 70 / 20 / 10 demandé.
4. Garde-fous anti-répétition : max 2 fois la même marque sur 5 cartes, max
   2 fois la même catégorie d'affilée, max 3 fois le même style dominant
   d'affilée. Si aucune carte ne passe, la contrainte est relâchée plutôt que
   de rendre un deck vide.

`similarProducts` (bouton "similaires", fiche produit) est une similarité
d'attributs simple : catégorie, styles, couleurs, matières, proximité de prix,
marque.

## Les explications (`explain.ts`)

Construites uniquement à partir des attributs **réellement partagés** entre le
profil et le produit — jamais générées au hasard :

> « Recommandé parce que tu apprécies l'esprit japandi, les matières comme le
> chêne massif et les tons naturels. »

Avec moins de 4 signaux, le texte assume l'exploration ("Sélectionné pour
découvrir tes goûts…").

## Synthèse (`summary.ts`)

`buildStyleSummary` produit l'ADN esthétique affiché (styles dominants
normalisés, couleurs/matières favorites, budget moyen des produits aimés,
niveau d'audace) — partagé entre Profil, Pour toi et le résultat d'onboarding.

## V2 (préparée par le schéma)

Embeddings d'images (pgvector) pour la similarité visuelle réelle, poids
synchronisés dans `user_preference_scores`, bandit contextuel sur le ratio
d'exploration à partir des `recommendation_impressions`.
