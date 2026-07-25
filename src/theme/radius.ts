/**
 * Rayons différenciés par composant — fini le tout-pilule.
 * Voir docs/VISUAL_DIRECTION_V2.md.
 */
export const radius = {
  /** Tags d'information. */
  xs: 8,
  /** Chips de filtre. */
  chip: 10,
  /** Champs de saisie. */
  field: 12,
  /** Boutons — rectangles adoucis. */
  button: 14,
  /** Cartes de grille, blocs. */
  sm: 14,
  /** Blocs éditoriaux, tuiles. */
  md: 18,
  /** Grandes surfaces (hero, révélations). */
  lg: 20,
  /** Carte de swipe uniquement. */
  card: 24,
  /** Cercles pleins (avatars, boutons icône ronds). */
  pill: 999,
} as const;
