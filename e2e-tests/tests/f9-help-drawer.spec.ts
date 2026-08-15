import { test, expect } from '@playwright/test';
import { assertNoHorizontalOverflow } from '../helpers';

test.describe('F9: Help Drawer & Support FAQs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should open help drawer via header button and display FAQ sections', async ({ page }) => {
    const helpBtn = page.locator('button[aria-label="Help"]');
    await expect(helpBtn).toBeVisible();
    await helpBtn.click();

    const helpDrawer = page.locator('.help-drawer');
    await expect(helpDrawer).toBeVisible();

    // Verify sections
    await expect(helpDrawer.locator('h3:has-text("Contact Us")')).toBeVisible();
    await expect(helpDrawer.locator('h3:has-text("Returns & Exchanges")')).toBeVisible();
    await expect(helpDrawer.locator('h3:has-text("Shipping Info")')).toBeVisible();
  });

  test('should close help drawer via close button and Escape key', async ({ page }) => {
    const helpBtn = page.locator('button[aria-label="Help"]');
    await helpBtn.click();

    const helpDrawer = page.locator('.help-drawer');
    await expect(helpDrawer).toBeVisible();

    // 1. Close via close button
    const closeBtn = helpDrawer.locator('button[aria-label="Close help"]');
    await closeBtn.click();
    await expect(helpDrawer).not.toBeVisible();

    // 2. Open again and close via Escape
    await helpBtn.click();
    await expect(helpDrawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(helpDrawer).not.toBeVisible();
  });

  test('should have no horizontal scrollbar/overflow on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const helpBtn = page.locator('button[aria-label="Help"]');
    await helpBtn.click();

    const helpDrawer = page.locator('.help-drawer');
    await expect(helpDrawer).toBeVisible();

    await assertNoHorizontalOverflow(page);
  });
});
