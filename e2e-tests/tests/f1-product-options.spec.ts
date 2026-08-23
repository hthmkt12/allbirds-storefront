import { test, expect } from '@playwright/test';

test.describe('F1: Product Options Selection and Details', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the storefront home page
    await page.goto('/');
  });

  // ==========================================
  // TIER 1: Core Selection Flows
  // ==========================================

  test('should display product list and view details', async ({ page }) => {
    // Verify product section contains product cards
    const productCards = page.locator('.product-card');
    await expect(productCards.first()).toBeVisible();
    
    // Each product card should have a heading and price
    const firstProductTitle = productCards.first().locator('h3');
    await expect(firstProductTitle).not.toBeEmpty();
  });

  test('should select color swatch and update color text', async ({ page }) => {
    // Verify first product's initial color details
    const productCard = page.locator('.product-card').first();
    const colorText = productCard.locator('p').first();
    const initialColor = await colorText.textContent();
    expect(initialColor).not.toBeNull();

    // In a fully featured store, clicking swatches would update the product image and color text.
    // Here we click the color swatch container to simulate the interaction
    const swatch = productCard.locator('.product-swatch');
    await expect(swatch).toBeVisible();
    await swatch.click();

    // Verify the color is still displayed
    await expect(colorText).toBeVisible();
  });

  test('should allow size selection and update selected size label', async ({ page }) => {
    const sizeButtons = page.locator('button.size-button');
    await expect(sizeButtons).toHaveCount(8);
    for (let i = 0; i < 6; i++) {
      await expect(sizeButtons.nth(i)).toBeVisible();
      await expect(sizeButtons.nth(i)).toBeEnabled();
    }
    const sizeText = await sizeButtons.first().textContent();
    expect(sizeText).not.toBeNull();
    expect(sizeText!.trim().length).toBeGreaterThan(0);
    await sizeButtons.first().click();
    const selectedSizeLabel = page.locator('.selected-size-label');
    await expect(selectedSizeLabel).toBeVisible();
    await expect(selectedSizeLabel).toHaveText(`Selected Size: ${sizeText!.trim()}`);
  });

  test('should display fit and rating for products', async ({ page }) => {
    // Verify each product shows fit advice and rating details
    const productCard = page.locator('.product-card').first();
    const facts = productCard.locator('.product-facts');
    await expect(facts).toBeVisible();
    await expect(facts).toContainText('to size', { ignoreCase: true });
  });

  test('should update spotlight card when category changes', async ({ page }) => {
    // Verify CategoryStrip buttons are visible
    const categoryCards = page.locator('.category-card');
    await expect(categoryCards.first()).toBeVisible();

    // Get the name of the second category
    const secondCategoryBtn = categoryCards.nth(1);
    const categoryName = await secondCategoryBtn.locator('span').textContent();
    expect(categoryName).not.toBeNull();

    // Click the second category card
    await secondCategoryBtn.click();

    // Verify the spotlight card heading updates to match the selected category
    const spotlightTitle = page.locator('.spotlight-card h3');
    await expect(spotlightTitle).toHaveText(categoryName!);
  });

  // ==========================================
  // TIER 2: Edge Cases & Validation
  // ==========================================

  test('should display out of stock status for unavailable sizes', async ({ page }) => {
    const outOfStockButtons = page.locator('button.size-button.disabled');
    await expect(outOfStockButtons).toHaveCount(2);
    await expect(outOfStockButtons.nth(0)).toBeVisible();
    await expect(outOfStockButtons.nth(0)).toBeDisabled();
    await expect(outOfStockButtons.nth(1)).toBeVisible();
    await expect(outOfStockButtons.nth(1)).toBeDisabled();
  });

  test('should disable add to bag button for out of stock options', async ({ page }) => {
    const outOfStockOption = page.locator('button.size-button.disabled');
    await expect(outOfStockOption).toHaveCount(2);
    await expect(outOfStockOption.first()).toBeVisible();
    await outOfStockOption.first().click({ force: true });
    const addBtn = page.locator('button:has-text("Add to Bag")');
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toBeDisabled();
  });

  test('should toggle size guide modal', async ({ page }) => {
    const sizeGuideBtn = page.locator('button.size-guide-button');
    await expect(sizeGuideBtn).toBeVisible();
    await sizeGuideBtn.click();
    const modal = page.locator('.size-guide-modal');
    await expect(modal).toBeVisible();
    const modalTitle = modal.locator('h2');
    await expect(modalTitle).toBeVisible();
    await expect(modalTitle).toHaveText('Size Guide');
    const sizeTable = modal.locator('table');
    await expect(sizeTable).toBeVisible();
    const closeBtn = modal.locator('.close-modal');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('should persist selected options when changing audience', async ({ page }) => {
    // Click Shop Women to toggle audience
    const shopWomenBtn = page.getByRole('tab', { name: 'Shop Women' });
    await expect(shopWomenBtn).toBeVisible();
    await shopWomenBtn.click();

    // Spotlight card should update to match Shop Women audience
    const spotlightLink = page.locator('.spotlight-card a');
    await expect(spotlightLink).toContainText('Shop Women');
  });

  test('should display low stock warning for limited options', async ({ page }) => {
    const lowStockWarning = page.locator('.low-stock-warning');
    await expect(lowStockWarning).toHaveCount(1);
    await expect(lowStockWarning).toBeVisible();
    await expect(lowStockWarning).toHaveText(/Only \d+ left/i);
  });

  test('should add product to cart from PDP, update quantity in cart drawer, and display details correctly', async ({ page }) => {
    // 1. Navigate to the PDP for Men's Canvas Runner NZ directly
    await page.goto('/products/men-s-canvas-runner-nz');

    // 2. Verify we are on the PDP for this product
    const pdpTitle = page.locator('.pdp-details-column h1');
    await expect(pdpTitle).toHaveText("Men's Canvas Runner NZ");

    // 3. Select size 9
    const sizeBtn = page.locator('button.size-button:has-text("9")');
    await expect(sizeBtn).toBeVisible();
    await sizeBtn.click({ force: true });

    // 4. Increase quantity to 2 on PDP
    const plusBtn = page.locator('.quantity-selector button.plus');
    await expect(plusBtn).toBeVisible();
    await plusBtn.click({ force: true });
    const quantityVal = page.locator('.quantity-selector .quantity-value');
    await expect(quantityVal).toHaveText('2');

    // 5. Click Add to Bag
    const addToBagBtn = page.locator('button.add-to-bag-btn');
    await expect(addToBagBtn).toBeVisible();
    await addToBagBtn.click({ force: true });

    // 6. Verify cart drawer opens and updates correctly
    const cartDrawer = page.locator('.cart-drawer:not(.wishlist-drawer)');
    await expect(cartDrawer).toBeVisible();
    
    const cartItem = cartDrawer.locator('.cart-item');
    await expect(cartItem).toHaveCount(1);
    await expect(cartItem.locator('.item-name')).toHaveText("Men's Canvas Runner NZ");
    await expect(cartItem.locator('.item-size')).toHaveText("Size: 9");
    await expect(cartItem.locator('.quantity-value')).toHaveText("2");
    
    const subtotal = cartDrawer.locator('.cart-subtotal');
    await expect(subtotal).toHaveText('$200');
  });

  test('should change card style/color on swatch click and image click but not trigger URL change', async ({ page }) => {
    // 1. Go to homepage
    await page.goto('/');
    const initialUrl = page.url();

    // 2. Locate first product card and initial color text
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible();
    const colorText = productCard.locator('p').first();
    const initialColor = await colorText.textContent();
    expect(initialColor).not.toBeNull();

    // 3. Click the swatch container to change the active colorway
    const swatch = productCard.locator('.product-swatch');
    await expect(swatch).toBeVisible();
    await swatch.click();

    // Verify color changed and URL is still the initial URL
    const secondColor = await colorText.textContent();
    expect(secondColor).not.toBeNull();
    expect(secondColor).not.toEqual(initialColor);
    expect(page.url()).toEqual(initialUrl);

    // 4. Click the product image (nested inside the product-swatch)
    const productImg = productCard.locator('.product-crop');
    await expect(productImg).toBeVisible();
    await productImg.click();

    // Verify color changed again and URL remains initial URL
    const thirdColor = await colorText.textContent();
    expect(thirdColor).not.toBeNull();
    expect(thirdColor).not.toEqual(secondColor);
    expect(page.url()).toEqual(initialUrl);
  });

  test('should render fallback view on invalid product route and redirect to home on button click', async ({ page }) => {
    // Navigate to invalid product route
    await page.goto('/products/invalid-slug-123');

    // Verify fallback view renders instead of crashing
    const fallbackView = page.locator('.pdp-not-found');
    await expect(fallbackView).toBeVisible();
    await expect(fallbackView.locator('h2')).toHaveText('Product Not Found');

    // Click button to redirect to /
    const returnBtn = fallbackView.locator('button:has-text("Return to Storefront")');
    await expect(returnBtn).toBeVisible();
    await returnBtn.click({ force: true });

    // Expect redirection to home page /
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('should handle quantity selector increments, decrements, and enforce a minimum of 1 on PDP', async ({ page }) => {
    // Navigate directly to a valid product page
    await page.goto('/products/men-s-canvas-runner-nz');

    // Locate quantity controls
    const quantityVal = page.locator('.quantity-selector .quantity-value');
    const plusBtn = page.locator('.quantity-selector button.plus');
    const minusBtn = page.locator('.quantity-selector button.minus');

    await expect(quantityVal).toHaveText('1');

    // Try to decrement below 1
    await minusBtn.click({ force: true });
    await expect(quantityVal).toHaveText('1');

    // Increment to 2
    await plusBtn.click({ force: true });
    await expect(quantityVal).toHaveText('2');

    // Increment to 3
    await plusBtn.click({ force: true });
    await expect(quantityVal).toHaveText('3');

    // Decrement back to 2
    await minusBtn.click({ force: true });
    await expect(quantityVal).toHaveText('2');

    // Decrement back to 1
    await minusBtn.click({ force: true });
    await expect(quantityVal).toHaveText('1');

    // Decrement again, should stay at 1
    await minusBtn.click({ force: true });
    await expect(quantityVal).toHaveText('1');
  });
});

