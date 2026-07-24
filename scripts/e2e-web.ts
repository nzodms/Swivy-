/**
 * Parcours de bout en bout sur le build web exporté (dist/), via Chromium.
 * Prérequis : `npx serve -s dist -l 4173` en cours d'exécution.
 *
 * Usage : npx tsx scripts/e2e-web.ts
 *
 * Note environnement : les images Unsplash peuvent être bloquées par le
 * réseau ; le test vérifie la structure et les interactions, pas les pixels
 * des photos (les placeholders d'Expo Image couvrent ce cas).
 */
import { mkdirSync } from 'node:fs';
import { chromium, type Page } from 'playwright';

const BASE_URL = 'http://127.0.0.1:4173';
const SHOT_DIR = process.env.E2E_SHOTS ?? '/tmp/swivy-e2e';

const consoleErrors: string[] = [];
const failures: string[] = [];
let step = 0;

function fail(message: string): void {
  failures.push(message);
  process.stdout.write(`  ÉCHEC: ${message}\n`);
}

function ok(message: string): void {
  process.stdout.write(`  ok: ${message}\n`);
}

async function shot(page: Page, name: string): Promise<void> {
  step += 1;
  await page.screenshot({ path: `${SHOT_DIR}/${String(step).padStart(2, '0')}-${name}.png` });
}

async function tapLabel(page: Page, label: string): Promise<boolean> {
  const el = page.getByLabel(label).first();
  if ((await el.count()) === 0) return false;
  await el.click();
  return true;
}

/** Swipe à la souris sur la carte du dessus. */
async function mouseSwipe(page: Page, direction: 'left' | 'right' | 'up'): Promise<void> {
  const viewport = page.viewportSize();
  if (!viewport) return;
  const cx = viewport.width / 2;
  const cy = viewport.height / 2 - 60;
  const dx = direction === 'right' ? 200 : direction === 'left' ? -200 : 0;
  const dy = direction === 'up' ? -260 : 0;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  for (let i = 1; i <= 8; i += 1) {
    await page.mouse.move(cx + (dx * i) / 8, cy + (dy * i) / 8);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(500);
}

async function run(): Promise<void> {
  mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({
    // Chromium pré-installé de l'environnement (voir PLAYWRIGHT_BROWSERS_PATH).
    executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
    args: ['--no-proxy-server'],
  });

  // ————————————————————————————————————————————
  // Parcours principal — viewport type iPhone
  // ————————————————————————————————————————————
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

  process.stdout.write('1. Onboarding\n');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await shot(page, 'welcome');

  if (!(await page.getByText('Découvrir mon style').first().isVisible())) {
    fail('Écran welcome absent');
  } else {
    ok('welcome affiché');
  }
  await page.getByRole('button', { name: 'Découvrir mon style' }).first().click();
  await page.waitForTimeout(600);

  // Pièces
  await page.getByLabel('Salon').first().click();
  await page.getByLabel('Chambre').first().click();
  await shot(page, 'rooms');
  await page.getByRole('button', { name: 'Continuer' }).first().click();
  await page.waitForTimeout(500);

  // Catégories
  await page.getByLabel('Canapés').first().click();
  await page.getByLabel('Luminaires').first().click();
  await page.getByLabel('Tapis').first().click();
  await shot(page, 'categories');
  await page.getByRole('button', { name: 'Continuer' }).first().click();
  await page.waitForTimeout(500);

  // Budget
  await page.getByLabel('100 à 300 €').first().click();
  await shot(page, 'budget');
  await page.getByRole('button', { name: 'Continuer' }).first().click();
  await page.waitForTimeout(600);

  // Calibration : 12 cartes via les boutons (like / dislike alternés)
  process.stdout.write('2. Calibration\n');
  await shot(page, 'calibration');
  for (let i = 0; i < 12; i += 1) {
    const label = i % 3 === 2 ? 'Pas pour moi' : 'J’aime';
    const done = await tapLabel(page, label);
    if (!done) {
      fail(`Bouton "${label}" introuvable à la carte ${i + 1}`);
      break;
    }
    await page.waitForTimeout(420);
  }
  // Génération du profil (1.8 s) puis résultat
  await page.waitForTimeout(2600);
  await shot(page, 'result');
  if ((await page.getByText('Commencer à découvrir').count()) === 0) {
    fail('Écran de résultat de profil absent après la calibration');
  } else {
    ok('profil généré');
  }
  await page.getByRole('button', { name: 'Commencer à découvrir' }).first().click();
  await page.waitForTimeout(1200);

  // ————————————————————————————————————————————
  // Feed de découverte
  // ————————————————————————————————————————————
  process.stdout.write('3. Feed de swipe\n');
  await shot(page, 'discover');
  if ((await page.getByText('Découvrir').count()) === 0) fail('Écran Découvrir absent');

  // Boutons like / superlike / dislike
  if (!(await tapLabel(page, 'J’aime'))) fail('Bouton like absent');
  await page.waitForTimeout(500);
  if (!(await tapLabel(page, 'Coup de cœur'))) fail('Bouton superlike absent');
  await page.waitForTimeout(500);
  if ((await page.getByText('Ajouté à tes coups de cœur').count()) > 0) {
    ok('toast superlike affiché');
  }
  if (!(await tapLabel(page, 'Pas pour moi'))) fail('Bouton dislike absent');
  await page.waitForTimeout(500);

  // Annulation
  if (!(await tapLabel(page, 'Annuler le dernier swipe'))) fail('Bouton annuler absent');
  await page.waitForTimeout(500);
  if ((await page.getByText('Dernier swipe annulé').count()) > 0) ok('undo confirmé');

  // Swipe à la souris (droite, gauche, haut)
  await mouseSwipe(page, 'right');
  await mouseSwipe(page, 'left');
  await mouseSwipe(page, 'up');
  ok('swipes à la souris exécutés');
  await shot(page, 'discover-after-swipes');

  // ————————————————————————————————————————————
  // Fiche produit + similaires
  // ————————————————————————————————————————————
  process.stdout.write('4. Fiche produit\n');
  if (await tapLabel(page, 'Voir la fiche produit')) {
    await page.waitForTimeout(1200);
    await shot(page, 'product');
    if ((await page.getByText('Pourquoi ce produit').count()) === 0) {
      fail('Bloc "Pourquoi ce produit" absent de la fiche');
    } else {
      ok('fiche produit ouverte avec raisons');
    }
    if (!(await tapLabel(page, 'Fermer la fiche produit'))) fail('Fermeture fiche impossible');
    await page.waitForTimeout(700);
  } else {
    fail('Bouton fiche produit absent sur la carte');
  }

  if (await tapLabel(page, 'Voir des produits similaires')) {
    await page.waitForTimeout(1000);
    await shot(page, 'similar');
    if ((await page.getByText('Dans le même esprit').count()) === 0) {
      fail('Écran similaires vide');
    } else {
      ok('similaires affichés');
    }
    await tapLabel(page, 'Fermer');
    await page.waitForTimeout(600);
  } else {
    fail('Bouton similaires absent');
  }

  // ————————————————————————————————————————————
  // Onglets
  // ————————————————————————————————————————————
  process.stdout.write('5. Onglets\n');
  await page.getByRole('tab', { name: 'Favoris' }).first().click();
  await page.waitForTimeout(900);
  await shot(page, 'favorites');
  if ((await page.getByText(/produit(s)? sauvegardé/).count()) === 0) {
    fail('Favoris : compteur absent (les likes n’ont pas été sauvegardés ?)');
  } else {
    ok('favoris peuplés par les swipes');
  }

  await page.getByRole('tab', { name: 'Pour toi' }).first().click();
  await page.waitForTimeout(1200);
  await shot(page, 'for-you');
  if ((await page.getByText('Sélection du jour').count()) === 0) {
    fail('Pour toi : sections absentes');
  } else {
    ok('sections Pour toi affichées');
  }

  await page.getByRole('tab', { name: 'Profil' }).first().click();
  await page.waitForTimeout(900);
  await shot(page, 'profile');
  if ((await page.getByText('Ton ADN esthétique').count()) === 0) fail('Profil : ADN absent');
  else ok('profil affiché');

  // ————————————————————————————————————————————
  // Persistance : rechargement complet
  // ————————————————————————————————————————————
  process.stdout.write('6. Persistance après rechargement\n');
  await page.goto(`${BASE_URL}/favorites`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1800);
  await shot(page, 'reload-favorites');
  if ((await page.getByText(/produit(s)? sauvegardé/).count()) === 0) {
    fail('Persistance : favoris perdus après rechargement');
  } else {
    ok('favoris persistés après rechargement (route profonde OK)');
  }
  // L'onboarding ne doit pas revenir.
  if ((await page.getByText('Découvrir mon style').count()) > 0) {
    fail('Persistance : onboarding réaffiché après rechargement');
  }

  // ————————————————————————————————————————————
  // Autres tailles d'écran
  // ————————————————————————————————————————————
  process.stdout.write('7. Tailles d’écran\n');
  const viewports = [
    { name: 'small-iphone', width: 375, height: 667 },
    { name: 'large-iphone', width: 430, height: 932 },
    { name: 'android', width: 412, height: 915 },
    { name: 'desktop', width: 1440, height: 900 },
  ];
  for (const vp of viewports) {
    const p2 = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    p2.on('pageerror', (error) => consoleErrors.push(`pageerror(${vp.name}): ${error.message}`));
    await p2.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await p2.waitForTimeout(1500);
    // Pas de scroll horizontal
    const overflow = await p2.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    if (overflow) fail(`${vp.name} : scroll horizontal détecté`);
    else ok(`${vp.name} : pas de scroll horizontal`);
    await p2.screenshot({ path: `${SHOT_DIR}/vp-${vp.name}.png` });
    await p2.close();
  }

  await page.close();
  await browser.close();

  // ————————————————————————————————————————————
  // Bilan
  // ————————————————————————————————————————————
  const blockingErrors = consoleErrors.filter(
    (message) =>
      !message.includes('images.unsplash.com') &&
      !message.includes('ERR_TUNNEL') &&
      !message.includes('ERR_PROXY') &&
      !message.includes('net::') &&
      !message.includes('Failed to load resource'),
  );
  process.stdout.write('\n——— Bilan e2e ———\n');
  process.stdout.write(`Erreurs console bloquantes : ${blockingErrors.length}\n`);
  for (const message of blockingErrors.slice(0, 10)) process.stdout.write(`  ${message}\n`);
  process.stdout.write(`Échecs fonctionnels : ${failures.length}\n`);
  for (const failure of failures) process.stdout.write(`  ${failure}\n`);
  process.stdout.write(`Captures : ${SHOT_DIR}\n`);
  if (failures.length > 0 || blockingErrors.length > 0) process.exitCode = 1;
}

run().catch((error) => {
  process.stdout.write(`Erreur fatale e2e: ${error}\n`);
  process.exitCode = 1;
});
