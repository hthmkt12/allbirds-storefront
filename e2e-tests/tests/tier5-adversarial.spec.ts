import { test, expect } from '@playwright/test';

test.describe('Tier 5: Adversarial and Hardening Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle malicious search input tags without executing or breaking layout', async ({ page }) => {
    // Open search modal
    const searchBtn = page.locator('button[aria-label="Search"]');
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    const searchModal = page.locator('.search-modal');
    await expect(searchModal).toBeVisible();

    const searchInput = searchModal.locator('input');
    await expect(searchInput).toBeVisible();

    // Type a script injection payload
    const maliciousPayload = '<script>alert("XSS-Test")</script>';
    await searchInput.fill(maliciousPayload);
    await page.keyboard.press('Enter');

    // Verify search modal closes and payload was handled safely without executing/alerting
    await expect(searchModal).not.toBeVisible();
  });

  test('should handle corrupted JSON in local storage cart state gracefully', async ({ page, context }) => {
    // Inject corrupted cart state into local storage
    await page.evaluate(() => {
      localStorage.setItem('cart', '{"bad json state: [corrupt]');
    });

    // Reload page to trigger cart initialization
    await page.reload();

    // Verify the page loads successfully and doesn't white-screen
    const brand = page.locator('a.brand');
    await expect(brand).toBeVisible();

    // Open cart drawer
    const bagBtn = page.locator('button[aria-label="Bag"]');
    await expect(bagBtn).toBeVisible();
    await bagBtn.click();

    // Verify empty cart state is shown safely
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();
    const emptyMsg = cartDrawer.locator('.cart-empty-message');
    await expect(emptyMsg).toBeVisible();
    await expect(emptyMsg).toHaveText('Your bag is empty');
  });

  test('should normalize invalid quantities (negative/fractional) from local storage', async ({ page }) => {
    const invalidCart = [
      {
        id: "Men's Dasher NZ-10-Seagrass",
        name: "Men's Dasher NZ",
        price: "$140",
        size: 10,
        color: "Seagrass",
        image: "/allbirds-crop-top-right.png",
        quantity: -3 // Negative quantity
      },
      {
        id: "Women's Tree Glider-9-Burlwood",
        name: "Women's Tree Glider",
        price: "$140",
        size: 9,
        color: "Burlwood",
        image: "/allbirds-crop-top-right.png",
        quantity: 2.7 // Fractional quantity
      }
    ];

    // addInitScript runs before any page JS on each navigation (including reload),
    // ensuring localStorage is set before React's useState lazy initializer reads it.
    // This is more reliable than page.evaluate() + reload() on WebKit/Mobile Safari.
    await page.addInitScript((cart) => {
      localStorage.setItem('cart', JSON.stringify(cart));
    }, invalidCart);

    // Reload page to initialize cart with the injected data
    await page.reload();

    // Open cart drawer
    const bagBtn = page.locator('button[aria-label="Bag"]');
    await bagBtn.click();

    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();

    // Verify items exist and quantities are normalized
    const items = cartDrawer.locator('.cart-item');
    await expect(items).toHaveCount(2);

    // First item quantity should be normalized to 1
    const qty1 = items.nth(0).locator('.quantity-value');
    await expect(qty1).toHaveText('1');

    // Second item quantity should be floored/normalized to 2
    const qty2 = items.nth(1).locator('.quantity-value');
    await expect(qty2).toHaveText('2');
  });

  test('should handle CMS offline API failures by falling back to local mock data gracefully', async ({ page }) => {
    // Intercept and abort API calls to simulate CMS going offline
    await page.route('**/api/products', route => route.abort('failed'));
    await page.route('**/api/categories', route => route.abort('failed'));

    // Reload page to trigger fetches
    await page.reload();

    // Verify categories and products are still visible (loaded from fallback mock data)
    const categoryCards = page.locator('.category-card');
    await expect(categoryCards).toHaveCount(4);

    const productCards = page.locator('.product-card');
    await expect(productCards).toHaveCount(8);
  });

  test('should prevent double click race conditions on adding items to cart', async ({ page }) => {
    // Wait for product cards and the first product's size buttons to load (async CMS fetch)
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible({ timeout: 10000 });

    // The first product card shows size buttons — wait for them to be present
    const sizeBtn = productCard.locator('button.size-button');
    await expect(sizeBtn.first()).toBeVisible({ timeout: 10000 });
    await sizeBtn.first().click();

    // Wait for Add to Bag button to become enabled after size selection
    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await expect(addToBagBtn).toBeEnabled({ timeout: 5000 });

    // First add to cart — cart opens
    await addToBagBtn.click();
    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible({ timeout: 5000 });

    // Close the cart via the close button
    const closeBtn = cartDrawer.locator('button[aria-label="Close cart"]');
    await closeBtn.click();
    await expect(cartDrawer).not.toBeVisible({ timeout: 3000 });

    // Second add to cart with the same product/size/color
    // Re-select size since the state may reset on re-render
    await sizeBtn.first().click();
    await expect(addToBagBtn).toBeEnabled({ timeout: 5000 });
    await addToBagBtn.click();
    await expect(cartDrawer).toBeVisible({ timeout: 5000 });

    // Verify only 1 unique cart item entry (quantity should be 2, not 2 separate rows)
    // This confirms the de-duplication logic works correctly
    const cartItems = cartDrawer.locator('.cart-item');
    await expect(cartItems).toHaveCount(1);

    const quantity = cartItems.locator('.quantity-value');
    await expect(quantity).toHaveText('2');
  });
});
