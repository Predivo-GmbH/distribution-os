import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:5174';
const DIR = './test-screenshots';
mkdirSync(DIR, { recursive: true });

const pages = [
  // Public pages
  ['01-landing', '/'],
  ['02-landing-engines', '/', { scrollTo: 800 }],
  ['03-landing-howitworks', '/', { scrollTo: 1600 }],
  ['04-landing-cta-footer', '/', { scrollToBottom: true }],
  ['05-login', '/login'],
  ['06-signup', '/signup'],
  ['07-reset-password', '/reset-password'],
  ['08-pricing', '/pricing'],
  ['09-pricing-bottom', '/pricing', { scrollToBottom: true }],

  // Authenticated pages (auth skipped in local-only mode)
  ['10-dashboard', '/dashboard'],
  ['11-dashboard-scroll', '/dashboard', { scrollTo: 600 }],
  ['12-inbox', '/inbox'],
  ['13-inbox-scroll', '/inbox', { scrollTo: 600 }],
  ['14-briefing', '/briefing'],
  ['15-briefing-scroll', '/briefing', { scrollTo: 800 }],
  ['16-briefing-bottom', '/briefing', { scrollToBottom: true }],
  ['17-products', '/products'],
  ['18-settings', '/settings'],
  ['19-settings-scroll', '/settings', { scrollTo: 600 }],
];

async function screenshotPage(context, name, path, opts = {}) {
  const page = await context.newPage();
  try {
    // Bypass PasswordGate
    await page.addInitScript(() => {
      sessionStorage.setItem('distribution-os-dev-access', 'true');
    });
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(500);
    if (opts.scrollTo) {
      await page.evaluate((y) => window.scrollTo(0, y), opts.scrollTo);
      await page.waitForTimeout(300);
    } else if (opts.scrollToBottom) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: `${DIR}/${name}.png`, fullPage: false });
    console.log(`✓ ${name}`);
  } catch (e) {
    console.log(`✗ ${name}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    colorScheme: 'dark',
  });
  for (const [name, path, opts] of pages) {
    await screenshotPage(ctx, name, path, opts);
  }
  await ctx.close();
  await browser.close();
  console.log(`\nDone — ${pages.length} screenshots saved to ${DIR}/`);
})();
