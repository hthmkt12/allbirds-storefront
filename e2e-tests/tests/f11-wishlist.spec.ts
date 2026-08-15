import { test, expect } from '@playwright/test';

test.describe('F11: Wishlist Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should toggle product wishlist status from product card and update header counter', async ({ page }) => {
    const wishlistBtn = page.locator('button[aria-label="Wishlist"]');
    await expect(wishlistBtn).toBeVisible();

    // 1. Click heart button on first product card
    const firstCardHeart = page.locator('.product-card button[aria-label*="wishlist"]').first();
    await expect(firstCardHeart).toBeVisible();
    await firstCardHeart.click();

    // 2. Header wishlist badge should show count 1
    const badge = wishlistBtn.locator('span');
    await expect(badge).toHaveText('1');

    // 3. Open wishlist drawer
    await wishlistBtn.click();
    const wishlistDrawer = page.locator('.wishlist-drawer');
    await expect(wishlistDrawer).toBeVisible();
    await expect(wishlistDrawer.locator('.pill-button:has-text("Move to Bag")')).toBeVisible();

    // 4. Close wishlist
    await page.keyboard.press('Escape');
    await expect(wishlistDrawer).not.toBeVisible();
  });
});
