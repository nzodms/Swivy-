/** Durées et ressorts — animations rapides, naturelles, jamais gadget. */
export const motion = {
  duration: {
    instant: 120,
    fast: 180,
    base: 240,
    slow: 320,
  },
  spring: {
    /** Retour d'une carte à sa position. */
    settle: { damping: 22, stiffness: 260, mass: 0.9 },
    /** Apparition d'un élément d'interface. */
    enter: { damping: 20, stiffness: 210, mass: 0.8 },
    /** Micro-réaction (pression sur un bouton). */
    press: { damping: 18, stiffness: 380, mass: 0.6 },
  },
  /** Distance (px) à partir de laquelle un swipe est validé. */
  swipeThreshold: 110,
  /** Vélocité (px/s) à partir de laquelle un swipe est validé. */
  swipeVelocityThreshold: 900,
} as const;
