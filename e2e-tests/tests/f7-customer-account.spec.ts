import { test, expect } from '@playwright/test';

test.describe('F7: Customer Account & Order History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should support simulated login, checkout with pre-filled email, and display order history', async ({ page }) => {
    // 1. Open the Account Drawer
    const accountBtn = page.locator('button[aria-label="Account"]');
    await expect(accountBtn).toBeVisible();
    await accountBtn.click();

    const accountDrawer = page.locator('.account-drawer');
    await expect(accountDrawer).toBeVisible();

    // 2. Verify logged-out state (Sign In and Order Lookup are visible)
    const signInHeading = accountDrawer.locator('h3:has-text("Sign In")');
    await expect(signInHeading).toBeVisible();
    const orderLookupHeading = accountDrawer.locator('h3:has-text("Order Lookup")');
    await expect(orderLookupHeading).toBeVisible();

    // 3. Perform Simulated Login
    const emailInput = accountDrawer.locator('#signin-email-input');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('test-customer@example.com');

    const signInBtn = accountDrawer.locator('button:has-text("Sign In")');
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();

    // 4. Verify logged-in state in drawer
    await expect(accountDrawer.locator('strong:has-text("test-customer@example.com")')).toBeVisible();
    const signOutBtn = accountDrawer.locator('button:has-text("Sign Out")');
    await expect(signOutBtn).toBeVisible();
    
    // Verify forms are hidden
    await expect(signInHeading).not.toBeVisible();
    await expect(orderLookupHeading).not.toBeVisible();

    // Verify localStorage has email
    const emailInLocalStorage = await page.evaluate(() => localStorage.getItem('customer_email'));
    expect(emailInLocalStorage).toBe('test-customer@example.com');

    // 5. Close drawer
    const closeBtn = accountDrawer.locator('button[aria-label="Close account"]');
    await closeBtn.click();
    await expect(accountDrawer).not.toBeVisible();

    // 6. Add a product to cart
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible();
    const productName = await productCard.locator('.product-meta h3').innerText();
    
    const sizeBtn = productCard.locator('button.size-button');
    await sizeBtn.first().click();

    const addToBagBtn = productCard.locator('button:has-text("Add to Bag")');
    await addToBagBtn.click();

    const cartDrawer = page.locator('.cart-drawer:not(.wishlist-drawer)');
    await expect(cartDrawer).toBeVisible();

    // 7. Go to Checkout
    const checkoutBtn = cartDrawer.locator('button:has-text("Checkout")');
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // Verify we navigated to checkout page
    await expect(page).toHaveURL(/\/checkout/);

    // 8. Verify email is pre-filled from customer_email
    const checkoutEmailInput = page.locator('input#checkout-email');
    await expect(checkoutEmailInput).toBeVisible();
    const prefilledValue = await checkoutEmailInput.inputValue();
    expect(prefilledValue).toBe('test-customer@example.com');

    // 9. Fill in the rest of shipping details and transition to payment step
    await page.locator('input#checkout-fullName').fill('Jane Doe');
    await page.locator('input#checkout-address').fill('123 Wooly Way');
    await page.locator('input#checkout-city').fill('San Francisco');
    await page.locator('input#checkout-state').fill('CA');
    await page.locator('input#checkout-zip').fill('94107');

    // Click Continue to Payment
    await page.locator('button:has-text("Continue to Payment")').click();

    // Fill payment details (Credit Card is selected by default)
    await page.locator('input#checkout-cardNumber').fill('4111111111111111');
    await page.locator('input#checkout-cardExpiry').fill('12/30');
    await page.locator('input#checkout-cardCvv').fill('123');

    // Get order total to verify later
    const totalText = await page.locator('.checkout-totals div:has-text("Total") span').last().innerText();

    // Submit Order
    const placeOrderBtn = page.locator('button:has-text("Place Order")');
    await placeOrderBtn.click();

    // 10. Verify confirmation page
    await expect(page).toHaveURL(/\/checkout\/confirmation/);
    await expect(page.locator('h2:has-text("Order Placed Successfully!")')).toBeVisible();

    // 11. Open Account Drawer again and verify Order History
    await accountBtn.click();
    await expect(accountDrawer).toBeVisible();

    // Order history list should show 1 order (located by class name order-card)
    const orderItems = accountDrawer.locator('.order-card');
    await expect(orderItems.first()).toBeVisible();
    
    // Check that order total matches checkout total
    const orderTotalInDrawer = await orderItems.first().locator('span:has-text("$")').last().innerText();
    expect(orderTotalInDrawer).toBe(totalText);

    // Check that the product name matches
    const orderProductName = await orderItems.first().locator('div[style*="font-weight: 600"]').first().innerText();
    expect(productName.toUpperCase()).toContain(orderProductName.toUpperCase());

    // 12. Sign Out
    await signOutBtn.click();
    await expect(accountDrawer.locator('strong:has-text("test-customer@example.com")')).not.toBeVisible();
    await expect(signInHeading).toBeVisible();

    // Verify localStorage is cleared
    const emailAfterSignOut = await page.evaluate(() => localStorage.getItem('customer_email'));
    expect(emailAfterSignOut).toBeNull();
  });

  test('should support close gestures', async ({ page }) => {
    const accountBtn = page.locator('button[aria-label="Account"]');
    const accountDrawer = page.locator('.account-drawer');
    const overlay = page.locator('.cart-drawer-overlay.open');

    // Test Escape key close gesture
    await accountBtn.click();
    await expect(accountDrawer).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(accountDrawer).not.toBeVisible();

    // Test overlay click close gesture
    await accountBtn.click();
    await expect(accountDrawer).toBeVisible();
    await overlay.dispatchEvent('click');
    await expect(accountDrawer).not.toBeVisible();

    // Test close button close gesture
    await accountBtn.click();
    await expect(accountDrawer).toBeVisible();
    const closeBtn = accountDrawer.locator('button[aria-label="Close account"]');
    await closeBtn.click();
    await expect(accountDrawer).not.toBeVisible();
  });

  test('should have no horizontal scrollbar/overflow on mobile viewport', async ({ page }) => {
    // Set viewport to mobile screen size
    await page.setViewportSize({ width: 375, height: 667 });
    
    const accountBtn = page.locator('button[aria-label="Account"]');
    await accountBtn.click();
    
    const accountDrawer = page.locator('.account-drawer');
    await expect(accountDrawer).toBeVisible();

    // Verify absolutely no horizontal scrollbar/overflow
    const hasHorizontalScrollbar = await accountDrawer.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });
    expect(hasHorizontalScrollbar).toBe(false);

    // Verify the drawer is within viewport boundaries width-wise
    const box = await accountDrawer.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
    }
  });
});
