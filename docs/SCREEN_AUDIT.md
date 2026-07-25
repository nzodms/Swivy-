# Audit des écrans V1 → décisions V2

Audit réalisé sur les captures du parcours e2e V1 (Chromium, 390×844).

## Constats transverses

| Problème V1 | Décision V2 |
| --- | --- |
| Tout est pilule (boutons, chips, badges, nav) | Rayons différenciés : boutons 14, chips 10, tags 8 |
| Sauge + beige partout → « effet IA » | Vert cyprès unique pour l'action, cuivre rare pour les moments spéciaux |
| Pourcentage « x % pour ton style » sur toutes les cartes | Supprimé partout sauf fiche produit (score détaillé) |
| Une seule police, aucune voix | Fraunces (serif) sur l'édito uniquement |
| Headers 28 px + grands vides au-dessus du contenu | Titres 24, sections -25 % d'espacement, contenu visible dès l'ouverture |
| Même pattern header+cartes+chips sur 4 écrans | Chaque écran a sa composition propre |

## Écran par écran

### Welcome
- V1 : cartes en éventail floues (images bloquées) + gros vide au centre.
- V2 : titre serif éditorial, éventail resserré, promesse plus courte,
  CTA cyprès. Le lien « J'ai déjà un compte » reste discret.

### Pièces / Catégories (onboarding)
- V1 : tuiles correctes mais labels bavards, bouton désactivé peu lisible.
- V2 : tuiles plus denses (ratio 1.5), sélection bord cyprès + fond teinté,
  compteur de sélection dans le CTA (« Continuer · 3 »).

### Calibration
- V1 : texte de progression plat, boutons identiques au feed.
- V2 : jauge fine sous le titre, phrase de progression qui change par
  paliers, actions réduites (pas d'undo/similaires ici).

### Résultat de profil
- V1 : barres + tags — propre mais anonyme.
- V2 : titre serif, **spectre de goût** signature (barre segmentée),
  attributs en tags discrets, révélation animée `reveal`.

### Découvrir
- V1 : carte unique répétée, badge % + badge état + 2 tags + marchand
  empilés (surcharge), gros boutons pilule.
- V2 : formats de cartes alternés (situation / packshot / mini-story),
  **une** ligne de signal max par carte, jauge de compréhension discrète
  dans le header, action bar resserrée (undo/similaires en 40 px,
  like/dislike en 56), cartes de révélation aux paliers.

### Fiche produit
- V1 : bonne base, mais tags en triple rangée et raisons en aplat sauge.
- V2 : nom en serif, score détaillé (barres par dimension) **ici seulement**,
  variantes détectées (mêmes produits en autre finition), alternatives moins
  chères, tags resserrés sur une information par ligne.

### Pour toi
- V1 : trois carrousels identiques à la suite.
- V2 : hero éditorial personnalisé (image + serif + signal), grille de
  nouveaux matchs, duo « alternative moins chère », carrousel budget,
  spectre de goût compact — composition mixte, dépendante de l'activité.

### Favoris
- V1 : grille correcte mais chips de tri envahissantes, pas de vue liste.
- V2 : toggle grille/liste, recherche, tri en menu compact, baisse de prix
  signalée en cuivre, sélection par appui long (retrait), rangées liste
  informatives (marchand, prix, état).

### Profil
- V1 : suite de cartes arrondies identiques, stats en 4 blocs gris.
- V2 : spectre de goût en tête, préférences apprises **modifiables**
  (atténuer un style appris), marques aimées/masquées, stats en ligne
  simple, réglages en liste hairline.

### Navigation
- V1 : pilule flottante « glass » avec gros fond arrondi actif.
- V2 : barre pleine largeur, hairline supérieure, indicateur point + teinte,
  icône remplie à l'actif, plus compacte (64 px + safe area).

## Scénarios UX vérifiés (e2e + simulation)

| Scénario | Vérification |
| --- | --- |
| Nouvel utilisateur | Parcours e2e complet onboarding → feed |
| Swipe rapide | 15 actions enchaînées sans blocage ni deck vide |
| Très sélectif | Simulation persona (dislikes majoritaires) : profil stable |
| Goûts contradictoires | Simulation persona : pas de divergence |
| Sauvegarde beaucoup | Favoris peuplés, compteur exact après reload |
| Revient plus tard | Persistance locale rechargée (deep-route reload) |
| Compare | Vue liste favoris + tri prix |
| Explore une catégorie | Filtres + signaux « nouveau style à tester » |
