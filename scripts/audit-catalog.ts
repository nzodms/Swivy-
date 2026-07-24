/**
 * Audit du catalogue de démonstration : cohérence des prix, attributs,
 * styles, badges et répartition des catégories.
 *
 * Usage : npx tsx scripts/audit-catalog.ts
 */
import { products } from '../src/mocks/products';
import { calibrationProducts } from '../src/mocks/calibration';
import { styleSlugSchema, type CategorySlug } from '../src/types';

const issues: string[] = [];

function check(condition: boolean, message: string): void {
  if (!condition) issues.push(message);
}

// Fourchettes de prix plausibles par catégorie (EUR).
const PRICE_RANGES: Record<CategorySlug, [number, number]> = {
  canapes: [400, 4000],
  fauteuils: [150, 1500],
  tables: [150, 2500],
  chaises: [60, 600],
  luminaires: [40, 900],
  tapis: [60, 1200],
  rangements: [60, 2000],
  'objets-deco': [20, 400],
};

const categoryCounts = new Map<string, number>();
const styleCounts = new Map<string, number>();
const nameSet = new Set<string>();

for (const p of products) {
  categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1);
  for (const s of p.styles) styleCounts.set(s, (styleCounts.get(s) ?? 0) + 1);

  check(!nameSet.has(p.name), `Nom dupliqué : ${p.name}`);
  nameSet.add(p.name);

  const range = PRICE_RANGES[p.category];
  check(
    p.price >= range[0] && p.price <= range[1],
    `${p.id} : prix ${p.price} € hors fourchette [${range[0]}–${range[1]}] pour ${p.category}`,
  );

  if (p.previousPrice !== undefined) {
    check(p.previousPrice > p.price, `${p.id} : ancien prix ${p.previousPrice} ≤ prix ${p.price}`);
    check(
      p.previousPrice <= p.price * 1.6,
      `${p.id} : remise irréaliste (${p.previousPrice} → ${p.price})`,
    );
  }
  if (p.badges.includes('promo')) {
    check(p.previousPrice !== undefined, `${p.id} : badge promo sans ancien prix`);
  }

  check(p.description.length >= 60, `${p.id} : description trop courte`);
  check(!/lorem/i.test(p.description), `${p.id} : lorem ipsum détecté`);
  check(p.materials.length > 0 && p.colors.length > 0, `${p.id} : attributs manquants`);
  check(p.images.length >= 2, `${p.id} : moins de 2 images`);
  check(new Set(p.images).size === p.images.length, `${p.id} : images dupliquées dans la galerie`);
}

// Répartition des catégories : entre 8 et 20 produits chacune.
for (const [category, count] of categoryCounts) {
  check(count >= 8 && count <= 20, `Catégorie ${category} : ${count} produits (attendu 8–20)`);
}

// Diversité des styles : chaque style porté par au moins 6 produits
// pour que la calibration et le moteur soient significatifs.
for (const style of styleSlugSchema.options) {
  const count = styleCounts.get(style) ?? 0;
  check(count >= 6, `Style ${style} : seulement ${count} produits (minimum 6)`);
}

// Calibration : au moins 6 styles distincts et 3 gammes de prix.
const calibStyles = new Set(calibrationProducts.flatMap((p) => p.styles));
const calibPrices = calibrationProducts.map((p) => p.price);
check(calibStyles.size >= 6, `Calibration : ${calibStyles.size} styles distincts (minimum 6)`);
check(
  Math.min(...calibPrices) < 150 && Math.max(...calibPrices) > 400,
  'Calibration : la fourchette de prix ne couvre pas assez le catalogue',
);

if (issues.length === 0) {
  process.stdout.write(`Audit OK — ${products.length} produits, aucune incohérence détectée.\n`);
  process.stdout.write(
    `Catégories : ${[...categoryCounts.entries()].map(([c, n]) => `${c}=${n}`).join(', ')}\n`,
  );
  process.stdout.write(
    `Styles : ${[...styleCounts.entries()].map(([s, n]) => `${s}=${n}`).join(', ')}\n`,
  );
} else {
  process.stdout.write(`Audit : ${issues.length} problème(s)\n`);
  for (const issue of issues) process.stdout.write(`- ${issue}\n`);
  process.exitCode = 1;
}
