import { test, expect } from '@playwright/test';

test.describe('F2 Challenger: Cart Drawer Edge Cases', () => {
  test('should handle decimal prices and format them correctly', async ({ page }) => {
    const decimalCart = [
      {
        id: "item-decimal",
        name: "Decimal Shoe",
        price: "$120.50",
        size: 8,
        color: "Grey",
        image: "/allbirds-crop-top-left.png",
        quantity: 1
      }
    ];

    await page.addInitScript((cart) => {
      localStorage.setItem('cart', JSON.stringify(cart));
    }, decimalCart);

    await page.goto('/');
    await page.locator('button[aria-label="Bag"]').click();

    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();

    // Verify subtotal display - it will show $120.50 after formatting
    const subtotal = cartDrawer.locator('.cart-subtotal');
    await expect(subtotal).toHaveText('$120.50');
  });

  test('should parse negative prices as positive due to regex cleaning', async ({ page }) => {
    const negativeCart = [
      {
        id: "item-negative",
        name: "Negative Shoe",
        price: "-$100.00",
        size: 8,
        color: "Black",
        image: "/allbirds-crop-top-left.png",
        quantity: 1
      }
    ];

    await page.addInitScript((cart) => {
      localStorage.setItem('cart', JSON.stringify(cart));
    }, negativeCart);

    await page.goto('/');
    await page.locator('button[aria-label="Bag"]').click();

    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();

    // Verify subtotal is positive $100 because regex [^0-9.] strips the negative sign
    const subtotal = cartDrawer.locator('.cart-subtotal');
    await expect(subtotal).toHaveText('$100');
  });

  test('should handle extremely large quantities without crashing', async ({ page }) => {
    const hugeCart = [
      {
        id: "item-huge",
        name: "Huge Shoe",
        price: "$100",
        size: 8,
        color: "White",
        image: "/allbirds-crop-top-left.png",
        quantity: 999999
      }
    ];

    await page.addInitScript((cart) => {
      localStorage.setItem('cart', JSON.stringify(cart));
    }, hugeCart);

    await page.goto('/');
    await page.locator('button[aria-label="Bag"]').click();

    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();

    const subtotal = cartDrawer.locator('.cart-subtotal');
    await expect(subtotal).toHaveText('$99999900');
  });

  test('should handle empty price strings by normalizing to $0 without crashing the page', async ({ page }) => {
    const emptyPriceCart = [
      {
        id: "item-empty-price",
        name: "No Price Shoe",
        price: "",
        size: 8,
        color: "White",
        image: "/allbirds-crop-top-left.png",
        quantity: 1
      }
    ];

    await page.addInitScript((cart) => {
      localStorage.setItem('cart', JSON.stringify(cart));
    }, emptyPriceCart);

    await page.goto('/');
    await page.locator('button[aria-label="Bag"]').click();

    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();

    // The subtotal will normalize to $0
    const subtotal = cartDrawer.locator('.cart-subtotal');
    await expect(subtotal).toHaveText('$0');
  });

  test('should handle empty image path gracefully by rendering fallback image', async ({ page }) => {
    const emptyImageCart = [
      {
        id: "item-empty-image",
        name: "No Image Shoe",
        price: "$100",
        size: 8,
        color: "Blue",
        image: "",
        quantity: 1
      }
    ];

    await page.addInitScript((cart) => {
      localStorage.setItem('cart', JSON.stringify(cart));
    }, emptyImageCart);

    await page.goto('/');
    await page.locator('button[aria-label="Bag"]').click();

    const cartDrawer = page.locator('.cart-drawer');
    await expect(cartDrawer).toBeVisible();

    // Verify the cart item exists and fallback image renders
    const item = cartDrawer.locator('.cart-item');
    await expect(item).toBeVisible();
    
    // The image locator is inside the item
    const img = item.locator('img');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', '/allbirds-crop-top-left.png');
  });
});
