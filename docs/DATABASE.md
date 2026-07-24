# Base de données

PostgreSQL (Supabase) — schéma dans `supabase/migrations/0001_initial_schema.sql`,
données de démonstration dans `supabase/seed.sql` (généré, 105 produits).

## Principe : un modèle universel

Un produit ne dépend jamais structurellement de la décoration. Les dimensions
descriptives (couleur, matière, style, forme, pièce, gamme de prix, badge…)
vivent dans le triplet **`attributes` → `attribute_values` →
`product_attribute_values`**. Ouvrir l'univers "sneakers" consiste à insérer
des catégories (`universe = 'sneakers'`), des valeurs d'attributs (`fit`,
`usage`, `movement`…) et des produits — sans migration.

## Tables

### Catalogue (lecture publique)

| Table | Rôle |
| --- | --- |
| `merchants` | Marchands partenaires (nom, domaine, livraison) |
| `categories` | Slugs hiérarchisables, colonne `universe` |
| `products` | Prix, marque, description, `popularity`, `boldness`, `embedding vector(512)` |
| `product_images` | Images ordonnées par produit |
| `attributes` | Dimensions universelles (`style`, `color`, `material`, `shape`, `room`, `price_band`, `badge`, …) |
| `attribute_values` | Valeurs (`style:japandi`, `color:vert sauge`, …) |
| `product_attribute_values` | Liaison N-N produit ↔ valeur |

### Utilisateur (RLS : chacun ne voit que ses lignes)

| Table | Rôle |
| --- | --- |
| `profiles` | Métadonnées applicatives (créées par trigger à l'inscription) |
| `swipes` | Historique like / dislike / superlike, avec `source` (discovery, calibration, similar) |
| `favorites` | Wishlist (flag `superlike`) |
| `collections` / `collection_products` | Collections personnelles |
| `recommendation_sessions` / `recommendation_impressions` | Ce qui a été montré, à quelle position, dans quelle tranche du mélange (`top`/`mid`/`wild`) |
| `product_clicks` | Clics fiche / marchand / similaires |
| `user_preference_scores` | Poids appris par valeur d'attribut (miroir serveur du profil local) |
| `user_visual_profiles` | Embedding pgvector de l'utilisateur (moyenne pondérée des produits aimés) |

## pgvector

`products.embedding` et `user_visual_profiles.embedding` sont des
`vector(512)` avec index `ivfflat` cosinus. Le pipeline d'embeddings d'images
(hors app) remplira `products.embedding` ; la similarité visuelle
utilisateur ↔ produit devient alors :

```sql
select p.id
from products p
order by p.embedding <=> (select embedding from user_visual_profiles where user_id = auth.uid())
limit 50;
```

## Sécurité

- RLS activée partout ; le catalogue est en lecture `using (true)`, l'écriture
  passe par le service role.
- Les tables personnelles sont limitées à `auth.uid()`.
- Trigger `on_auth_user_created` → ligne `profiles` automatique.

## Seed

`supabase/seed.sql` est **généré** par `npm run generate:seed` depuis
`src/mocks` (source de vérité unique, validée par Zod au chargement). Ne
jamais l'éditer à la main.
