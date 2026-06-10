import { test, expect } from '@playwright/test';

test('storefront home page loads and shows heading', async ({ page }) => {
  await page.goto('/');
  
  // Assert site header/brand is visible
  const brand = page.locator('a.brand');
  await expect(brand).toBeVisible();
  await expect(brand).toHaveText('allbirds');

  // Assert main heading is visible
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Wildly Comfortable. Super Natural.');
});
