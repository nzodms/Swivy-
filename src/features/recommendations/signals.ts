import {
  STYLE_LABELS,
  priceBandOf,
  type Product,
  type StyleSlug,
  type TasteProfile,
} from '@/types';
import { topEntries } from './tasteProfile';

/**
 * Signaux de personnalisation — une phrase max par carte,
 * TOUJOURS fondée sur une vraie donnée du profil. Si aucune donnée
 * ne justifie un signal, la carte n'en porte pas (retour null).
 */

export type CardTier = 'top' | 'mid' | 'wild';

export interface CardSignal {
  text: string;
  tone: 'brand' | 'copper';
  /** Clé de déduplication : deux cartes consécutives ne répètent pas un signal. */
  key: string;
}

const SHAPE_PHRASES: Record<string, string> = {
  arrondi: 'les formes arrondies',
  organique: 'les formes organiques',
  rectiligne: 'les lignes droites',
  sculptural: 'les pièces sculpturales',
  incurvé: 'les silhouettes incurvées',
  bas: 'les assises basses',
  modulaire: 'les meubles modulables',
  cylindrique: 'les volumes ronds',
};

/** Poids minimal pour considérer une préférence comme installée. */
const ESTABLISHED = 2.5;

interface SignalContext {
  tier: CardTier;
  lastSuperlike: Product | null;
}

export function buildCardSignal(
  profile: TasteProfile,
  product: Product,
  context: SignalContext,
): CardSignal | null {
  // Trop tôt : pas assez de données pour être crédible.
  if (profile.signalCount < 5) return null;

  // 1. Même esprit que le dernier coup de cœur (moment cuivre).
  if (context.lastSuperlike && context.lastSuperlike.id !== product.id) {
    const shared =
      product.styles.filter((s) => context.lastSuperlike?.styles.includes(s)).length +
      (product.category === context.lastSuperlike.category ? 1 : 0);
    if (shared >= 2) {
      return {
        text: 'Même esprit que ton dernier coup de cœur',
        tone: 'copper',
        key: 'crush-echo',
      };
    }
  }

  // 2. Tranche exploratoire : annoncer l'écart au lieu de le subir.
  if (context.tier === 'wild') {
    if (product.boldness - profile.boldness > 0.25) {
      return { text: 'Une option un peu plus audacieuse', tone: 'brand', key: 'bolder' };
    }
    const knownStyles = new Set(topEntries(profile.styles, 3).map(([style]) => style));
    const newStyle = product.styles.find((style) => !knownStyles.has(style));
    if (newStyle) {
      return {
        text: `Nouveau style à tester : ${STYLE_LABELS[newStyle as StyleSlug] ?? newStyle}`,
        tone: 'brand',
        key: 'new-style',
      };
    }
  }

  // 3. Matière dominante réellement présente sur le produit.
  const topMaterial = topEntries(profile.materials, 2).find(
    ([material, weight]) => weight >= ESTABLISHED && product.materials.includes(material),
  );
  if (topMaterial) {
    return {
      text: `Parce que tu as aimé plusieurs pièces en ${topMaterial[0]}`,
      tone: 'brand',
      key: `material-${topMaterial[0]}`,
    };
  }

  // 4. Forme dominante.
  const topShape = topEntries(profile.shapes, 2).find(
    ([shape, weight]) => weight >= ESTABLISHED && product.shapes.includes(shape),
  );
  if (topShape) {
    const phrase = SHAPE_PHRASES[topShape[0]];
    if (phrase) {
      return { text: `Tu sembles préférer ${phrase}`, tone: 'brand', key: `shape-${topShape[0]}` };
    }
  }

  // 5. Couleur dominante.
  const topColor = topEntries(profile.colors, 2).find(
    ([color, weight]) => weight >= ESTABLISHED && product.colors.includes(color),
  );
  if (topColor) {
    return {
      text: `Dans les tons ${topColor[0]} que tu aimes`,
      tone: 'brand',
      key: `color-${topColor[0]}`,
    };
  }

  // 6. Budget appris.
  const topBand = topEntries(profile.priceBands, 1)[0];
  if (topBand && topBand[1] >= ESTABLISHED && priceBandOf(product.price) === topBand[0]) {
    return { text: 'Dans ton budget', tone: 'brand', key: 'budget' };
  }

  return null;
}

// ————————————————————————————————————————————————————————————————
// Révélations (moments de la boucle d'engagement)
// ————————————————————————————————————————————————————————————————

export interface RevealContent {
  id: string;
  title: string;
  body: string;
}

/** Paliers de révélation — voir docs/ENGAGEMENT_LOOP.md. */
export function pendingReveal(profile: TasteProfile, shownReveals: string[]): RevealContent | null {
  const has = (id: string) => shownReveals.includes(id);

  if (profile.signalCount >= 30 && !has('spectrum-update')) {
    return {
      id: 'spectrum-update',
      title: 'Ton spectre de goût a mûri',
      body: 'Trente signaux plus tard, tes recommandations reposent sur un profil solide. Retrouve le détail dans ton Profil.',
    };
  }

  if (profile.signalCount >= 18 && !has('new-territory')) {
    const known = new Set(topEntries(profile.styles, 3).map(([style]) => style));
    const candidates = Object.keys(STYLE_LABELS).filter((style) => !known.has(style));
    const next = candidates[profile.signalCount % Math.max(1, candidates.length)];
    if (next) {
      return {
        id: 'new-territory',
        title: 'Un territoire à explorer',
        body: `Ton profil est assez précis pour tenter des écarts. Prochaine piste : ${STYLE_LABELS[next as StyleSlug]}.`,
      };
    }
  }

  if (profile.signalCount >= 6 && !has('style-forming')) {
    const dominant = topEntries(profile.styles, 1)[0];
    const material = topEntries(profile.materials, 1)[0];
    if (dominant) {
      const materialPart = material && material[1] >= ESTABLISHED ? `, souvent en ${material[0]}` : '';
      return {
        id: 'style-forming',
        title: 'Ton style se précise',
        body: `Tes premiers signaux penchent vers ${STYLE_LABELS[dominant[0] as StyleSlug] ?? dominant[0]}${materialPart}. Les prochaines cartes en tiennent compte.`,
      };
    }
  }

  return null;
}
