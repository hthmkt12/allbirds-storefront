import { test, expect } from '@playwright/test';

test.describe('F2: Cart Drawer Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // ==========================================
  // TIER 1: Core Drawer and Basic Cart Flows
  // ==========================================

  test('should open cart drawer when clicking bag icon', async ({ page }) => {
    const bagBtn = page.locator('button[aria-label="Bag"]');
    await expect(bagBtn).toBeVisible();
    await bagBtn.click();

    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
  });

  test('should display empty cart message initially', async ({ page }) => {
    const bagBtn = page.locator('button[aria-label="Bag"]');
    await bagBtn.click();

    const emptyText = page.locator('.cart-drawer .cart-empty-message');
    await expect(emptyText).toBeVisible();
    await expect(emptyText).toHaveText('Your bag is empty');
  });

  test('should add product to cart and show in drawer', async ({ page }) => {
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible();
    const sizeBtn = productCard.locator('button.size-button');
    await expect(sizeBtn.first()).toBeVisible();
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await expect(addToBagBtn).toBeVisible();
    await addToBagBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    const drawerItem = cartDrawer.locator('.cart-item');
    await expect(drawerItem).toHaveCount(1);
    await expect(drawerItem.locator('.item-name')).toBeVisible();
    await expect(drawerItem.locator('.item-size')).toContainText(/Size:/);
  });

  test('should update cart subtotal when item is added', async ({ page }) => {
    const productCard = page.locator('.product-card').first();
    const sizeBtn = productCard.locator('button.size-button');
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await addToBagBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    const subtotal = cartDrawer.locator('.cart-subtotal');
    await expect(subtotal).toBeVisible();
    await expect(subtotal).toHaveText('$100');
  });

  test('should close cart drawer when clicking close button', async ({ page }) => {
    const bagBtn = page.locator('button[aria-label="Bag"]');
    await bagBtn.click();

    const closeBtn = page.locator('.cart-drawer-close');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).not.toBeVisible();
  });

  // ==========================================
  // TIER 2: Advanced Cart Management & Limits
  // ==========================================

  test('should adjust item quantity in cart drawer', async ({ page }) => {
    const productCard = page.locator('.product-card').first();
    const sizeBtn = productCard.locator('button.size-button');
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await addToBagBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    
    const plusBtn = cartDrawer.locator('.quantity-selector button.plus');
    await expect(plusBtn).toBeVisible();
    await plusBtn.click();
    const quantityLabel = cartDrawer.locator('.quantity-value');
    await expect(quantityLabel).toHaveText('2');
    const subtotal = cartDrawer.locator('.cart-subtotal');
    await expect(subtotal).toHaveText('$200');

    const minusBtn = cartDrawer.locator('.quantity-selector button.minus');
    await expect(minusBtn).toBeVisible();
    await minusBtn.click();
    await expect(quantityLabel).toHaveText('1');
    await expect(subtotal).toHaveText('$100');
  });

  test('should remove item from cart drawer', async ({ page }) => {
    const productCard = page.locator('.product-card').first();
    const sizeBtn = productCard.locator('button.size-button');
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await addToBagBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    
    const removeBtn = cartDrawer.locator('button.remove-item');
    await expect(removeBtn).toBeVisible();
    await removeBtn.click();
    const emptyText = cartDrawer.locator('.cart-empty-message');
    await expect(emptyText).toBeVisible();
    await expect(emptyText).toHaveText('Your bag is empty');
  });

  test('should persist cart items across page reloads', async ({ page }) => {
    const productCard = page.locator('.product-card').first();
    const sizeBtn = productCard.locator('button.size-button');
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await addToBagBtn.click();
    
    await page.reload();
    
    await page.locator('button[aria-label="Bag"]').click();
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    const drawerItem = cartDrawer.locator('.cart-item');
    await expect(drawerItem).toHaveCount(1);
  });

  test('should display free shipping progress bar updates', async ({ page }) => {
    const productCard = page.locator('.product-card').first();
    const sizeBtn = productCard.locator('button.size-button');
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await addToBagBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    const progressBar = cartDrawer.locator('.shipping-progress-bar');
    await expect(progressBar).toBeVisible();
    await expect(progressBar).toContainText(/away from free shipping/i);
  });

  test('should navigate to checkout from cart drawer', async ({ page }) => {
    const productCard = page.locator('.product-card').first();
    const sizeBtn = productCard.locator('button.size-button');
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await addToBagBtn.click();
    
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    const checkoutBtn = cartDrawer.locator('.checkout-button');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();
    await expect(page).toHaveURL(/.*checkout/);
  });
});
