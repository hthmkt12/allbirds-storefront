import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = path.resolve(process.cwd(), 'plans/reports/phase6-screenshots');

// Ensure output directory exists
test.beforeAll(() => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
});

// Helper to assert scrollWidth on mobile viewports
async function assertNoHorizontalOverflow(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBe(390);
}

// 7 Page States Config
const PAGE_STATES = [
  { name: 'home', path: '/', isDialog: false },
  { name: 'mens-plp', path: '/collections/mens', isDialog: false },
  { name: 'womens-plp', path: '/collections/womens', isDialog: false },
  { name: 'pdp', path: '/products/men-s-canvas-runner-nz', isDialog: false },
  { name: 'cart-drawer', path: '/', isDialog: true, action: async (page) => {
    // Open Cart Drawer
    const bagBtn = page.locator('button[aria-label="Bag"]');
    await expect(bagBtn).toBeVisible();
    await bagBtn.click();
    await expect(page.locator('.cart-drawer:not(.wishlist-drawer)')).toBeVisible();
  }},
  { name: 'checkout', path: '/checkout', isDialog: false, preAction: async (page) => {
    // Seed localStorage cart to bypass empty-cart guard
    await page.addInitScript(() => {
      window.localStorage.setItem('cart', JSON.stringify([{
        id: "Men's Canvas Runner NZ-9-Deep Navy Stripes",
        name: "Men's Canvas Runner NZ",
        price: "$100",
        size: 9,
        color: "Deep Navy Stripes",
        image: "/allbirds-crop-top-left.png",
        quantity: 1
      }]));
    });
  }},
  { name: 'checkout-confirmation', path: '/checkout/confirmation', isDialog: false }
];

test.describe('Desktop Screenshots (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const state of PAGE_STATES) {
    test(`Capture desktop-${state.name}`, async ({ page }) => {
      if (state.preAction) await state.preAction(page);
      await page.goto(state.path);
      if (state.action) await state.action(page);
      
      const screenshotPath = path.join(OUTPUT_DIR, `desktop-${state.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: !state.isDialog });
    });
  }
});

test.describe('Mobile Screenshots (390px) & scrollWidth check', () => {
  test.use({
    viewport: { width: 390, height: 800 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    isMobile: true
  });

  for (const state of PAGE_STATES) {
    test(`Capture and validate mobile-${state.name}`, async ({ page }) => {
      if (state.preAction) await state.preAction(page);
      await page.goto(state.path);
      if (state.action) await state.action(page);

      // Verify no horizontal layout overflow
      await assertNoHorizontalOverflow(page);

      const screenshotPath = path.join(OUTPUT_DIR, `mobile-${state.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: !state.isDialog });
    });
  }
});
