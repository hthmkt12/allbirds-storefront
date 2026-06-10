import { test, expect } from '@playwright/test';

test.describe('F6: Storefront Accessibility (a11y)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // TIER 1: Core Accessibility Standards
  // ==========================================

  test('should have page title and main language attribute', async ({ page }) => {
    // Verify document has title
    const title = await page.title();
    expect(title).not.toBeNull();
    expect(title.length).toBeGreaterThan(0);

    // Verify HTML lang attribute is set to a standard locale
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).not.toBeNull();
    expect(htmlLang?.toLowerCase()).toContain('en');
  });

  test('should have main landmarks like header, main, and footer', async ({ page }) => {
    // Assert structural regions are defined using HTML5 tags or roles
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should have h1 heading for the page', async ({ page }) => {
    // Page must have at least one visible H1 heading for screen readers
    const h1Headings = page.locator('h1');
    await expect(h1Headings).toHaveCount(1);
    await expect(h1Headings).toBeVisible();
  });

  test('should verify interactive elements have labels or roles', async ({ page }) => {
    // Icon buttons in header should have aria-label descriptive values
    const iconButtons = page.locator('.nav-actions button.icon-button');
    const buttonCount = await iconButtons.count();
    for (let i = 0; i < buttonCount; i++) {
      const ariaLabel = await iconButtons.nth(i).getAttribute('aria-label');
      expect(ariaLabel).not.toBeNull();
      expect(ariaLabel?.length).toBeGreaterThan(0);
    }
  });

  test('should verify image elements have alt text or aria-hidden', async ({ page }) => {
    // Check all images have alt description or are explicitly marked hidden
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaHidden = await img.getAttribute('aria-hidden');
      
      const hasAlt = alt !== null && alt.length > 0;
      const isHidden = ariaHidden === 'true';
      expect(hasAlt || isHidden).toBe(true);
    }
  });

  // ==========================================
  // TIER 2: Interactive A11y & Form Labels
  // ==========================================

  test('should support keyboard navigation (Tab focus)', async ({ page }) => {
    // Press Tab multiple times to verify focus transfers between elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).not.toBeNull();

    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocused).not.toBeNull();
  });

  test('should have correct ARIA roles on tabs and lists', async ({ page }) => {
    // The audience selection buttons in Hero act as tabs
    const heroActionsList = page.locator('.hero-actions');
    await expect(heroActionsList).toHaveAttribute('role', 'tablist');

    const tabs = heroActionsList.locator('button');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
    for (let i = 0; i < tabCount; i++) {
      await expect(tabs.nth(i)).toHaveAttribute('role', 'tab');
    }
  });

  test('should verify color contrast placeholder classes are present', async ({ page }) => {
    // The design rules mandate high-contrast colors (e.g. .selected, .pill-button.light)
    const pillButtons = page.locator('.pill-button');
    await expect(pillButtons.first()).toBeVisible();
    await expect(pillButtons.first()).toHaveClass(/light/);
  });

  test('should verify form input has associated label', async ({ page }) => {
    // Verify that the email newsletter form input has an associated label
    const emailInput = page.locator('footer input#email');
    await expect(emailInput).toBeVisible();

    const label = page.locator('footer label[for="email"]');
    await expect(label).toBeVisible();
    await expect(label).toContainText('Follow the flock');
  });

  test('should check focus styling visibility', async ({ page }) => {
    // Focus an interactive element and make sure outline CSS properties aren't completely disabled
    const firstLink = page.locator('.top-nav a').first();
    await firstLink.focus();
    const hasFocusStyle = await firstLink.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outlineStyle !== 'none' || style.boxShadow !== 'none' || style.textDecorationLine === 'underline';
    });
    expect(hasFocusStyle).toBe(true);
  });
});
