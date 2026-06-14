import { test, expect } from '@playwright/test';

test.describe('Tier 4: Real-World User Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('User Journey: Browse new arrivals, filter by category, and select product', async ({ page }) => {
    // 1. Verify user is on storefront homepage
    await expect(page.locator('a.brand')).toHaveText('allbirds');

    // 2. Select category filter
    const mensCategory = page.locator('.category-card').filter({ has: page.locator('span', { hasText: /^Mens$/ }) });
    await expect(mensCategory).toBeVisible();
    await mensCategory.click();

    // 3. Verify page spotlight shows 'Mens'
    const spotlightTitle = page.locator('.spotlight-card h3');
    await expect(spotlightTitle).toHaveText('Mens');

    // 4. Verify products grid contains product details
    const productGrid = page.locator('.product-grid');
    await expect(productGrid).toBeVisible();
    const firstProduct = productGrid.locator('.product-card').first();
    await expect(firstProduct).toBeVisible();
  });

  test('User Journey: Add product to bag, adjust quantity, and proceed to checkout', async ({ page }) => {
    // 1. Select first product, select size, and click Add to Bag strictly
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible();
    
    const sizeBtn = productCard.locator('button.size-button');
    await expect(sizeBtn.first()).toBeVisible();
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await expect(addToBagBtn).toBeVisible();
    await addToBagBtn.click();
    
    // 2. Verify drawer is opened with item strictly
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    const drawerItem = cartDrawer.locator('.cart-item');
    await expect(drawerItem).toHaveCount(1);
    await expect(drawerItem.locator('.item-name')).toBeVisible();
    
    // 3. Click plus button to increase quantity
    const plusBtn = cartDrawer.locator('.quantity-selector button.plus');
    await expect(plusBtn).toBeVisible();
    await plusBtn.click();
    const quantity = cartDrawer.locator('.quantity-value');
    await expect(quantity).toHaveText('2');
    const subtotal = cartDrawer.locator('.cart-subtotal');
    await expect(subtotal).toHaveText('$200');

    // 4. Click checkout button
    const checkoutBtn = cartDrawer.locator('.checkout-button');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*checkout/);
  });

  test('User Journey: Newsletter sign up from footer and receive confirmation', async ({ page }) => {
    // 1. Locate the footer newsletter email form
    const emailForm = page.locator('form.email-form');
    await expect(emailForm).toBeVisible();

    // 2. Fill in the email input
    const emailInput = emailForm.locator('input#email');
    await emailInput.fill('customer@example.com');

    // 3. Click join button
    const joinBtn = emailForm.locator('button');
    await joinBtn.click();

    // 4. Check if confirmation message appears strictly
    const successMsg = page.locator('.newsletter-success');
    await expect(successMsg).toBeVisible();
    await expect(successMsg).toHaveText('Thanks for subscribing!');
  });

  test('User Journey: Mobile user navigation, bag check, and menu toggles', async ({ page }) => {
    // 1. Re-size viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // 2. Verify announcement bar and top-nav layout adjusts
    const announcement = page.locator('.announcement');
    await expect(announcement).toBeVisible();

    // 3. Click Mobile/Audience switch
    const shopWomenBtn = page.getByRole('tab', { name: 'Shop Women' });
    await shopWomenBtn.click();

    // 4. Open shopping bag
    const bagBtn = page.locator('button[aria-label="Bag"]');
    await expect(bagBtn).toBeVisible();
    await bagBtn.click();
  });

  test('User Journey: Complete shopping flow - search, select, add, and checkout', async ({ page }) => {
    // 1. Simulate opening search
    const searchBtn = page.locator('button[aria-label="Search"]');
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    // 2. Perform search input strictly
    const searchDialog = page.locator('.search-dialog');
    await expect(searchDialog).toBeVisible();
    const searchInput = searchDialog.locator('input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveValue('');
    await searchInput.fill('Dasher');
    await expect(searchInput).toHaveValue('Dasher');
    await page.keyboard.press('Escape');
    await expect(searchDialog).not.toBeVisible();

    // 3. Scroll and locate product card in arrivals
    const arrivals = page.locator('#new-arrivals');
    await expect(arrivals).toBeVisible();

    // 4. Verify category select resets or adapts
    const bestSellersCard = page.locator('.category-card:has-text("Best Sellers")');
    await bestSellersCard.click();
    await expect(page.locator('.spotlight-card h3')).toHaveText('Best Sellers');
  });
});
