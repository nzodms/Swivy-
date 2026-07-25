/**
 * Système de motion V2 — voir docs/MOTION_SYSTEM.md.
 * Le mouvement confirme, il ne décore pas.
 */
export const motion = {
  duration: {
    instant: 110,
    fast: 170,
    base: 240,
    slow: 320,
  },
  spring: {
    /** Compression de bouton. */
    press: { damping: 18, stiffness: 380, mass: 0.6 },
    /** Retour élastique de la carte swipée (dépassement < 3 px). */
    settle: { damping: 24, stiffness: 300, mass: 0.9 },
    /** Arrivée de la carte suivante, barres de progression. */
    enter: { damping: 22, stiffness: 240, mass: 0.8 },
    /** Moments de révélation — respiration plus ample. */
    reveal: { damping: 16, stiffness: 160, mass: 1 },
  },
  /** Échelles de pression. */
  pressScale: {
    button: 0.97,
    icon: 0.94,
  },
  /** Seuil de distance d'un swipe horizontal (px). */
  swipeThreshold: 96,
  /** Seuil de distance d'un swipe vers le haut (px) — le superlike se mérite. */
  swipeUpThreshold: 118,
  /** Seuil de vélocité (px/s) — un flick rapide part toujours. */
  swipeVelocityThreshold: 850,
  /** Durée de sortie d'une carte swipée (ms). */
  swipeExitDuration: 240,
} as const;
