import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium',
    args: ['--no-proxy-server'],
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  // Saute l'onboarding en préchargeant l'état persisté.
  await page.addInitScript(() => {
    localStorage.setItem(
      'swivy-taste',
      JSON.stringify({
        state: {
          profile: {
            styles: {}, colors: {}, materials: {}, categories: {},
            shapes: {}, priceBands: {}, brands: {}, boldness: 0.35, signalCount: 0,
          },
          selections: { rooms: [], categories: [], priceBand: null, priceRange: null },
          swipes: [], hiddenProductIds: [], onboardingComplete: true,
        },
        version: 0,
      }),
    );
  });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const btn = page.getByLabel('Voir la fiche produit').first();
  const box = await btn.boundingBox();
  console.log('info button box:', box);
  if (box) {
    const stack = await page.evaluate(
      ({ x, y }) =>
        document.elementsFromPoint(x, y).slice(0, 6).map((el) => {
          const h = el as HTMLElement;
          return `${h.tagName} role=${h.getAttribute('role')} label=${h.getAttribute('aria-label')} class=${h.className.toString().slice(0, 40)} pe=${getComputedStyle(h).pointerEvents}`;
        }),
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    );
    console.log(stack.join('\n'));
  }
  await browser.close();
}

void main();
