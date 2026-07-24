# Tests du moteur de recommandation

> Rapport GÉNÉRÉ par `npm run test:reco` (`scripts/simulate-recommendations.ts`).
> Catalogue : 105 produits. Les decks contiennent un léger bruit
> aléatoire, les chiffres varient donc de quelques points entre deux exécutions ;
> les assertions tiennent compte de cette variance.

## Propriétés vérifiées par assertions

| Propriété | Résultat mesuré | Statut |
| --- | --- | --- |
| Un dislike ne détruit pas une préférence | poids 6.00 → 5.45 après un rejet | OK |
| Le superlike a un poids visible | like 1.00 vs superlike 2.50 (×2.5) | OK |
| Pas de scores gonflés à froid | profil vierge : moyenne 63 %, max 63 % | OK |
| Undo : instantané strictement identique | applySwipe est immuable, le store restaure la référence précédente | OK |
| Les recommandations évoluent avec l’entraînement | produit art déco 73 % vs scandinave 63 % | OK |

## Simulation par persona

Chaque persona swipe sur des decks générés par le moteur, puis un deck
d’évaluation de 20 cartes est produit sur catalogue complet.

| Persona | Swipes | Correspondance avant → après | Score moyen avant → après | Marque max /20 | Catégorie max | Styles distincts /20 |
| --- | --- | --- | --- | --- | --- | --- |
| Amateur de minimalisme | 40 | 55 % → 83 % | 63 % → 86 % | 5 | 25 % | 7 |
| Amateur d’art déco | 40 | 15 % → 70 % | 63 % → 72 % | 5 | 30 % | 7 |
| Amateur d’industriel | 40 | 0 % → 22 % | 63 % → 42 % | 5 | 25 % | 7 |
| Amateur de formes organiques | 40 | 40 % → 73 % | 63 % → 87 % | 5 | 30 % | 6 |
| Profil très large | 40 | n/a (pas de style cible) | 63 % → 95 % | 5 | 25 % | 8 |
| Profil contradictoire | 40 | n/a (pas de style cible) | 63 % → 76 % | 5 | 45 % | 5 |
| Peu de swipes | 5 | 22 % → 42 % | 63 % → 61 % | 4 | 40 % | 7 |
| Beaucoup de swipes | 90 | 65 % → 90 % | 63 % → 88 % | 5 | 35 % | 6 |

## Poids de styles appris (top 3 par persona)

- **Amateur de minimalisme** : minimaliste-chaleureux (29.0), scandinave (6.9), japandi (4.0)
- **Amateur d’art déco** : vintage (21.5), art-deco (12.5), boheme (3.3)
- **Amateur d’industriel** : industriel (6.0), vintage (0.6), art-deco (-2.8)
- **Amateur de formes organiques** : organique (38.5), contemporain (16.6), scandinave (7.8)
- **Profil très large** : contemporain (15.8), organique (12.8), minimaliste-chaleureux (10.3)
- **Profil contradictoire** : organique (9.7), contemporain (6.5), boheme (2.4)
- **Peu de swipes** : scandinave (1.0), organique (-0.1), minimaliste-chaleureux (-0.6)
- **Beaucoup de swipes** : contemporain (42.0), organique (34.0), minimaliste-chaleureux (8.5)

## Lecture des résultats

- Les personas mono-style (minimalisme, art déco, industriel, organique)
  voient leur taux de correspondance progresser nettement après 40 swipes,
  sans jamais atteindre 100 % : le mélange 70/20/10 maintient l’exploration.
- Le profil contradictoire ne diverge pas : les poids restent modérés et le
  deck reste diversifié.
- Avec 5 swipes, le score affiché reste dans une bande prudente (la dispersion
  du pourcentage augmente avec la confiance).
- Les garde-fous anti-répétition maintiennent chaque marque ≤ 5/20 (plafond 25 %)
  et chaque catégorie ≤ 50 % du deck, même sur des profils très concentrés.

**Toutes les assertions passent.**
