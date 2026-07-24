# Edge Functions

Aucune fonction n'est nécessaire pour la V1 : le moteur de recommandation
tourne sur l'appareil et le catalogue est servi par PostgREST.

Ce dossier accueillera les fonctions de la V2 :

- `embed-products` — pipeline d'embeddings d'images vers `products.embedding`
  (pgvector) ;
- `sync-preferences` — agrégation des swipes vers `user_preference_scores` et
  `user_visual_profiles`.
