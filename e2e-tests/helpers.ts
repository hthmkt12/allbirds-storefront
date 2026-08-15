import { Page, expect } from '@playwright/test';

/**
 * Note: E2E suite is intentionally tuned to the offline fallback data path
 * (mock counts, local orders) to guarantee determinism in CI/local runs.
 */

export async function addFirstProductToCart(page: Page) {
  const productCard = page.locator('.product-card').first();
  await expect(productCard).toBeVisible();
  const sizeBtn = productCard.locator('button.size-button').first();
  await sizeBtn.click();
  const addBtn = productCard.locator('button:has-text("Add to Bag")');
  await addBtn.click();
}

export async function setupCheckout(page: Page) {
  await addFirstProductToCart(page);
  const cartDrawer = page.locator('.cart-drawer');
  await expect(cartDrawer).toBeVisible();
  await cartDrawer.locator('button:has-text("Checkout")').click();
  await expect(page).toHaveURL(/\/checkout/);

  // Fill shipping details
  await page.locator('input#checkout-email').fill('test-payment@example.com');
  await page.locator('input#checkout-fullName').fill('John Doe');
  await page.locator('input#checkout-address').fill('456 Pine Rd');
  await page.locator('input#checkout-city').fill('Oakland');
  await page.locator('input#checkout-state').fill('CA');
  await page.locator('input#checkout-zip').fill('94612');

  // Click Continue to Payment to transition to the payment step
  await page.locator('button.checkout-submit-btn').click();
}

export async function assertNoHorizontalOverflow(page: Page) {
  const hasHorizontalScrollbar = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(hasHorizontalScrollbar).toBe(false);
}
