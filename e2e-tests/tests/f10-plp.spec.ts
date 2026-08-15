import { test, expect } from '@playwright/test';

test.describe('F10: Product Listing Page (PLP) Functional & Filtering', () => {
  test('should navigate to Men\'s collection and render collection hero and products', async ({ page }) => {
    await page.goto('/collections/mens');
    
    // Check hero header
    const heroTitle = page.locator('.plp-hero h1');
    await expect(heroTitle).toHaveText("Men's");
    
    // Check product grid has items
    const productCards = page.locator('.plp-grid .product-card');
    await expect(productCards.first()).toBeVisible();
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter and sort products on PLP', async ({ page }) => {
    await page.goto('/collections/mens');

    // 1. Open filter panel
    const filterBtn = page.locator('.fsbar-btn:has-text("Filter")');
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    const filterPanel = page.locator('.filter-panel');
    await expect(filterPanel).toBeVisible();

    // 2. Open sort dropdown and sort price low to high
    const sortBtn = page.locator('.fsbar-sort-wrap .fsbar-btn');
    await expect(sortBtn).toBeVisible();
    await sortBtn.click();

    const lowToHighOption = page.locator('.sort-option:has-text("Price: Low to High")');
    await expect(lowToHighOption).toBeVisible();
    await lowToHighOption.click();

    // Verify sort label updated
    await expect(sortBtn).toContainText('Price: Low to High');
  });

  test('should clear active filters', async ({ page }) => {
    await page.goto('/collections/mens');

    // Open filter panel and select a size filter
    const filterBtn = page.locator('.fsbar-btn:has-text("Filter")');
    await filterBtn.click();

    const firstSizeBtn = page.locator('.filter-panel .size-button').first();
    if (await firstSizeBtn.isVisible()) {
      await firstSizeBtn.click();
      
      // Chip should appear
      const clearAllChip = page.locator('.filter-chip.clear');
      await expect(clearAllChip).toBeVisible();
      await clearAllChip.click();

      // Chip should disappear
      await expect(clearAllChip).not.toBeVisible();
    }
  });
});
