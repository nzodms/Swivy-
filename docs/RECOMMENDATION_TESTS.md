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
| Amateur de minimalisme | 40 | 50 % → 82 % | 63 % → 86 % | 5 | 30 % | 5 |
| Amateur d’art déco | 40 | 15 % → 70 % | 63 % → 70 % | 5 | 35 % | 7 |
| Amateur d’industriel | 40 | 5 % → 25 % | 63 % → 41 % | 5 | 25 % | 8 |
| Amateur de formes organiques | 40 | 43 % → 75 % | 63 % → 84 % | 5 | 35 % | 6 |
| Profil très large | 40 | n/a (pas de style cible) | 63 % → 93 % | 4 | 35 % | 6 |
| Profil contradictoire | 40 | n/a (pas de style cible) | 63 % → 80 % | 5 | 35 % | 6 |
| Peu de swipes | 5 | 23 % → 25 % | 63 % → 59 % | 5 | 40 % | 8 |
| Beaucoup de swipes | 90 | 73 % → 90 % | 63 % → 89 % | 5 | 30 % | 6 |

## Poids de styles appris (top 3 par persona)

- **Amateur de minimalisme** : minimaliste-chaleureux (32.0), scandinave (10.8), organique (5.2)
- **Amateur d’art déco** : vintage (20.5), art-deco (10.5), boheme (3.3)
- **Amateur d’industriel** : industriel (6.0), vintage (1.1), japandi (-2.8)
- **Amateur de formes organiques** : organique (32.5), contemporain (8.4), scandinave (4.2)
- **Profil très large** : minimaliste-chaleureux (16.8), contemporain (9.3), organique (8.4)
- **Profil contradictoire** : minimaliste-chaleureux (11.5), organique (4.8), contemporain (4.0)
- **Peu de swipes** : contemporain (-0.6), vintage (-0.6), boheme (-1.1)
- **Beaucoup de swipes** : contemporain (42.0), organique (34.0), minimaliste-chaleureux (8.0)

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
