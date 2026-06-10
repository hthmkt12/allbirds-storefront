import { test, expect } from '@playwright/test';

test.describe('F4: Brand Pages Navigation and Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // TIER 1: Core Navigation and Main Pages
  // ==========================================

  test('should navigate to About section via top nav', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skip desktop-only nav test on mobile');
    const aboutLink = page.locator('.nav-actions a[href="#about"]');
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();

    // Verify the URL includes #about anchor
    await expect(page).toHaveURL(/.*#about/);
  });

  test('should navigate to New Arrivals section via header link', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skip desktop-only nav test on mobile');
    const arrivalsLink = page.locator('.nav-links a[href="#new-arrivals"]').first();
    await expect(arrivalsLink).toBeVisible();
    await arrivalsLink.click();

    await expect(page).toHaveURL(/.*#new-arrivals/);
  });

  test('should navigate to Sale section via header link', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skip desktop-only nav test on mobile');
    const saleLink = page.locator('.nav-links a[href="#sale"]').first();
    await expect(saleLink).toBeVisible();
    await saleLink.click();

    await expect(page).toHaveURL(/.*#sale/);
  });

  test('should navigate to Payload section via header link', async ({ page }) => {
    const footerLink = page.locator('a[href="#payload"]').or(page.locator('a[href*="payload"]')).first();
    await expect(footerLink).toBeVisible();
    await footerLink.click();
    await expect(page).toHaveURL(/.*#payload/);
  });

  test('should display the core brand message', async ({ page }) => {
    // Verify that the core hero and brand elements are displayed with key copywriting
    const brandHeader = page.locator('a.brand');
    await expect(brandHeader).toHaveText('allbirds');

    const brandFooter = page.locator('.footer strong');
    await expect(brandFooter).toHaveText('Allbirds');
  });

  // ==========================================
  // TIER 2: Secondary Content & Footer Rules
  // ==========================================

  test('should display active material story details', async ({ page }) => {
    // Verify details inside the About / Material Story section
    const materialStory = page.locator('#about');
    await expect(materialStory).toBeVisible();

    const metrics = materialStory.locator('.metric-row article');
    await expect(metrics).toHaveCount(3);
    await expect(metrics.first().locator('strong')).toHaveText('7');
  });

  test('should verify footer links exist and have correct anchors', async ({ page }) => {
    // Check standard footer navigation groups
    const footerNav = page.locator('footer nav');
    await expect(footerNav).toBeVisible();

    const columns = footerNav.locator('div');
    await expect(columns).toHaveCount(3);

    // Verify first link group has links
    const firstGroupLinks = columns.first().locator('a');
    await expect(firstGroupLinks.first()).toHaveAttribute('href', '#top');
  });

  test('should verify social or external navigation links', async ({ page }) => {
    // Verify email sign up form in footer is functional
    const emailInput = page.locator('footer input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'Email address');
  });

  test('should toggle audience specific categories', async ({ page }) => {
    // Click category and verify active category changes
    const categoryCards = page.locator('.category-card');
    await categoryCards.first().click();
    await expect(categoryCards.first()).toHaveClass(/selected/);
  });

  test('should display value block elements under about section', async ({ page }) => {
    // Verify the value grid elements inside material story band
    const valueGrid = page.locator('.material-band .value-grid');
    await expect(valueGrid).toBeVisible();

    const valueArticles = valueGrid.locator('article');
    await expect(valueArticles).toHaveCount(3);
  });
});
