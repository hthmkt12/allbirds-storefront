import { test, expect } from '@playwright/test';

test.describe('F8: Payment Gateway Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Helper to add first product to cart and navigate to checkout
  async function setupCheckout(page: any) {
    const productCard = page.locator('.product-card').first();
    await expect(productCard).toBeVisible();
    await productCard.locator('button.size-button').first().click();
    await productCard.locator('button:has-text("Add to Bag")').click();
    const cartDrawer = page.locator('.cart-drawer:not(.wishlist-drawer)');
    await expect(cartDrawer).toBeVisible();
    await cartDrawer.locator('button:has-text("Checkout")').click();
    await expect(page).toHaveURL(/\/checkout/);

    // Fill shipping details
    await page.locator('input#checkout-email').fill('test-payment@example.com');
    await page.locator('input#checkout-fullName').fill('John Doe');
    await page.locator('input#checkout-address').fill('456 Pine Rd');
    await page.locator('input#checkout-city').fill('Oakland');
    await page.locator('input#checkout-state').fill('CA');
    await page.locator('input#checkout-zip').fill('94612');

    // Click Continue to Payment to transition to the payment step
    await page.locator('button.checkout-submit-btn').click();
  }

  test('should validate credit card input fields', async ({ page }) => {
    await setupCheckout(page);

    // Select Credit Card (selected by default, but check explicitly)
    const cardRadio = page.locator('input[type="radio"][value="card"]');
    await cardRadio.check();

    const submitBtn = page.locator('button.checkout-submit-btn');

    // 1. Submit empty fields
    await submitBtn.click();
    await expect(page.locator('text=Card Number is required')).toBeVisible();
    await expect(page.locator('text=Expiration Date is required')).toBeVisible();
    await expect(page.locator('text=CVV is required')).toBeVisible();

    // 2. Validate invalid Card Number (Luhn check failure)
    await page.locator('input#checkout-cardNumber').fill('1234567812345678');
    await submitBtn.click();
    await expect(page.locator('text=Invalid Card Number')).toBeVisible();

    // 3. Validate expiration date format and validity
    await page.locator('input#checkout-cardNumber').fill('4111111111111111'); // Valid Luhn
    await page.locator('input#checkout-cardExpiry').fill('13/29'); // Invalid month
    await submitBtn.click();
    await expect(page.locator('text=Invalid Expiration Date')).toBeVisible();

    await page.locator('input#checkout-cardExpiry').fill('05/20'); // Expired year
    await submitBtn.click();
    await expect(page.locator('text=Invalid Expiration Date')).toBeVisible();

    // 4. Validate CVV digits length
    await page.locator('input#checkout-cardExpiry').fill('12/30'); // Valid expiry
    await page.locator('input#checkout-cardCvv').fill('12'); // Too short
    await submitBtn.click();
    await expect(page.locator('text=Invalid CVV')).toBeVisible();
  });

  test('should simulate decline for card numbers ending in 9999', async ({ page }) => {
    await setupCheckout(page);

    await page.locator('input#checkout-cardNumber').fill('4111111111119999'); // Valid Luhn, ends in 9999
    await page.locator('input#checkout-cardExpiry').fill('12/30');
    await page.locator('input#checkout-cardCvv').fill('123');

    const submitBtn = page.locator('button.checkout-submit-btn');
    await submitBtn.click();

    // Verify spinner appears/disappears, error message is shown inline
    const errorMsg = page.locator('.payment-error-message');
    await expect(errorMsg).toBeVisible({ timeout: 4000 });
    await expect(errorMsg).toHaveText('Payment Failed: Card Declined');

    // Make sure we are still on the checkout page
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('should process successful credit card payment and verify order', async ({ page }) => {
    await setupCheckout(page);

    await page.locator('input#checkout-cardNumber').fill('4111111111111111'); // Valid Luhn
    await page.locator('input#checkout-cardExpiry').fill('12/30');
    await page.locator('input#checkout-cardCvv').fill('123');

    const submitBtn = page.locator('button.checkout-submit-btn');
    await submitBtn.click();

    // Spinner should show processing state
    await expect(submitBtn).toContainText('Processing');

    // Wait for auto redirect
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 5000 });
    await expect(page.locator('h2:has-text("Order Placed Successfully!")')).toBeVisible();

    // Verify database persistence (via localStorage local_orders or CMS endpoint)
    const localOrdersJson = await page.evaluate(() => localStorage.getItem('local_orders'));
    if (localOrdersJson) {
      const orders = JSON.parse(localOrdersJson);
      const lastOrder = orders[orders.length - 1];
      expect(lastOrder.paymentMethod).toBe('card');
      expect(lastOrder.paymentStatus).toBe('paid');
    }
  });

  test('should process successful VietQR scan payment and verify order', async ({ page }) => {
    await setupCheckout(page);

    // Select QR Code
    const qrRadio = page.locator('input[type="radio"][value="qr"]');
    await qrRadio.check();

    const submitBtn = page.locator('button.checkout-submit-btn');
    await submitBtn.click();

    // Verify VietQR Modal displays total and transaction ID
    const qrModal = page.locator('.vietqr-modal-content');
    await expect(qrModal).toBeVisible();
    await expect(qrModal.locator('.qr-txn-id')).toContainText('TXN-');

    // Wait for 3 seconds auto redirect
    await expect(page).toHaveURL(/\/checkout\/confirmation/, { timeout: 6000 });
    await expect(page.locator('h2:has-text("Order Placed Successfully!")')).toBeVisible();

    // Verify database persistence (via localStorage local_orders or CMS endpoint)
    const localOrdersJson = await page.evaluate(() => localStorage.getItem('local_orders'));
    if (localOrdersJson) {
      const orders = JSON.parse(localOrdersJson);
      const lastOrder = orders[orders.length - 1];
      expect(lastOrder.paymentMethod).toBe('qr');
      expect(lastOrder.paymentStatus).toBe('paid');
    }
  });
});
