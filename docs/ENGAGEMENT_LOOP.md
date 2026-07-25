# Boucle d'engagement

Principe : l'utilisateur continue parce que **l'app devient meilleure sous
ses doigts**, pas parce qu'on le récompense. Aucune pièce, aucun trophée,
aucun compteur de série. La monnaie de Swivy, c'est la justesse.

## Pourquoi l'utilisateur continue

1. **Chaque swipe a un effet observable.** Le profil bouge à chaque geste ;
   les cartes suivantes en tiennent compte immédiatement (le deck se
   réapprovisionne avec le profil à jour).
2. **Le feed n'est jamais deux fois le même.** Formats de cartes variés
   (situation, packshot, mini-story), signaux personnalisés, moments de
   révélation — la répétition mécanique est cassée.
3. **La curiosité est entretenue.** 1 carte sur 10 est exploratoire ; les
   signaux « une option plus audacieuse » ou « nouveau style à tester »
   annoncent l'écart au lieu de le subir.

## Ce qui évolue après chaque swipe

- Les poids du profil (styles, couleurs, matières, catégories, marques,
  budget, audace) — moteur local, effet immédiat.
- La **jauge de compréhension** (header du feed) : fine, discrète, elle
  progresse par paliers réels (`signalCount`).
- Le prochain lot de cartes est construit sur le profil mis à jour.

## Ce qui est révélé (moments de révélation)

Cartes spéciales insérées dans le deck, au ton éditorial (serif, fond
cuivré), **fondées sur de vraies données** :

| Déclencheur | Révélation |
| --- | --- |
| 6 signaux positifs | « Ton style se précise » + attribut dominant réel |
| 1er coup de cœur | « Même esprit que ton coup de cœur » sur la carte suivante compatible |
| 18 signaux | « Nouveau style à tester » + style adjacent le moins exploré |
| 30 signaux | Spectre de goût mis à jour, invitation à le consulter |

Une révélation se balaie comme une carte (pas de blocage), n'apparaît
jamais deux fois, et jamais plus d'une par session de 10 cartes.

## Signaux de personnalisation (crédibilité)

Une carte peut porter **une** ligne de signal, générée depuis le profil —
jamais de texte générique :

- « Parce que tu as aimé plusieurs pièces en {matière dominante} »
- « Dans ton budget » (vraie bande de prix du profil)
- « Une option un peu plus audacieuse » (écart d'audace réel > 0.25)
- « Même esprit que ton dernier coup de cœur » (similarité d'attributs)
- « Tu sembles préférer les formes {forme dominante} »
- « Nouveau style à tester : {style} » (tranche exploratoire)

Règle : si aucune donnée ne justifie un signal, la carte n'en porte pas.
Le pourcentage de compatibilité n'apparaît que dans la fiche produit.

## Ce qui change entre deux sessions

- Le deck est reconstruit avec un bruit léger : mêmes goûts, autre parcours.
- « Pour toi » recompose ses sections selon l'activité récente (derniers
  likes, coup de cœur le plus récent, catégories explorées, budget).
- Les révélations non atteintes restent à venir — il y a toujours un
  « prochain palier » silencieux.

## Comment on évite la répétition

- Garde-fous du moteur : marque ≤ 25 % du deck, catégorie ≤ 2 d'affilée,
  style dominant ≤ 3 d'affilée.
- Alternance des formats de cartes (jamais deux packshots d'affilée).
- Les signaux ne se répètent pas sur deux cartes consécutives.

## Valeur sans manipulation

Pas de rareté artificielle, pas de compte à rebours, pas de badge de série,
pas de notification de culpabilisation. La seule promesse : « plus tu
swipes, plus c'est juste » — et elle est techniquement vraie.
