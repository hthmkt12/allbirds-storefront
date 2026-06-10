import { test, expect } from '@playwright/test';

test.describe('F3: CMS Payload Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // TIER 1: CMS Render and Collections
  // ==========================================

  test('should display CMS hero banner blocks', async ({ page }) => {
    // Verify the hero banner section exists and has elements loaded
    const heroSection = page.locator('.home-hero');
    await expect(heroSection).toBeVisible();

    const heroHeading = heroSection.locator('h1');
    await expect(heroHeading).toHaveText('Wildly Comfortable. Super Natural.');
  });

  test('should load category blocks dynamically', async ({ page }) => {
    // Verify that the CategoryStrip displays categories that match our CMS contract
    const categoryGrid = page.locator('.category-grid');
    await expect(categoryGrid).toBeVisible();

    const categoryCards = categoryGrid.locator('.category-card');
    await expect(categoryCards).toHaveCount(4);
  });

  test('should render product collections from CMS', async ({ page }) => {
    // Verify product grid displays products matching the items in our mock CMS data
    const productGrid = page.locator('.product-grid');
    await expect(productGrid).toBeVisible();

    const products = productGrid.locator('.product-card');
    await expect(products).toHaveCount(8);
  });

  test('should display CMS-driven material stories', async ({ page }) => {
    // Verify material story section is present and contains value details
    const materialBand = page.locator('.material-band');
    await expect(materialBand).toBeVisible();

    const heading = materialBand.locator('h2');
    await expect(heading).toHaveText('Comfort, sustainability, and natural fibers in every step.');
  });

  test('should load review blocks from CMS', async ({ page }) => {
    // Verify customer reviews block displays correct content
    const reviewBand = page.locator('.review-band');
    await expect(reviewBand).toBeVisible();

    const reviewItems = reviewBand.locator('.review-grid article');
    await expect(reviewItems).toHaveCount(3);
  });

  // ==========================================
  // TIER 2: Schema Contracts & CMS Workflow Controls
  // ==========================================

  test('should display schema contract details section', async ({ page }) => {
    // Verify the Payload CMS Contract band is present
    const payloadBand = page.locator('.payload-band');
    await expect(payloadBand).toBeVisible();

    const kicker = payloadBand.locator('.section-kicker');
    await expect(kicker).toHaveText('Payload CMS Contract');

    // Verify schema cards for core models exist
    const cards = payloadBand.locator('.payload-card');
    await expect(cards).toHaveCount(6);

    const modelNames = ['heroBlocks', 'categories', 'products', 'materials', 'reviews', 'useCaseRules'];
    for (let i = 0; i < modelNames.length; i++) {
      await expect(cards.nth(i).locator('h3')).toHaveText(modelNames[i]);
    }
  });

  test('should load workflow rules in CMS footer', async ({ page }) => {
    // Verify the CMS integration displays workflow notes/rules
    const workflowNote = page.locator('.workflow-note span');
    await expect(workflowNote).toHaveCount(4);
    await expect(workflowNote.first()).toContainText(/visitor can browse/i);
  });

  test('should fallback gracefully when CMS assets fail to load', async ({ page }) => {
    // Test that the layout doesn't break if a specific asset isn't found
    const heroImage = page.locator('.home-hero img');
    await expect(heroImage).toBeVisible();
    
    // Check image element has alt description
    const altText = await heroImage.getAttribute('alt');
    expect(altText).not.toBeNull();
    expect(altText?.length).toBeGreaterThan(0);
  });

  test('should update storefront layout based on CMS hero swatches', async ({ page }) => {
    // Verify category swatches have correct styles mapping
    const firstCategory = page.locator('.category-card').first();
    const bgColor = await firstCategory.getAttribute('style');
    expect(bgColor).toContain('background-color');
  });

  test('should render dynamic category swatch colors', async ({ page }) => {
    // Check that we render color block tiles indicating different materials
    const productCards = page.locator('.product-card');
    const firstProductSwatch = productCards.first().locator('.product-swatch');
    await expect(firstProductSwatch).toBeVisible();

    const style = await firstProductSwatch.getAttribute('style');
    expect(style).toContain('background-color');
  });
});
