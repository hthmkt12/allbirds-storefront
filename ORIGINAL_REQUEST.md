# Original User Request

## Initial Request — 2026-06-14T21:41:03+07:00

<USER_REQUEST>
Implement a Customer Account & Order History feature in the Allbirds Storefront by expanding the Account Drawer, fetching order history from the CMS, and adding E2E verification tests.

Working directory: F:/Allbirds
Integrity mode: development

## Requirements

### R1. Simulated Customer Login
- Modify `src/components/account-drawer.tsx` to support entering a customer email address.
- Persist the logged-in email in `localStorage` under `customer_email`.
- Render a "Sign Out" button to clear this state.

### R2. Order History Display
- Fetch orders from the CMS API (`GET /api/orders?where[email][equals]=<email>`) or a CMS client helper in `src/utils/cms-client.ts`.
- If the CMS is offline, fall back to displaying simulated mock orders for that email.
- Format and display each order found: Order Date, Shipping Status, Total Price, and details of all items ordered (Name, Size, Color, Quantity, and Image).

### R3. Automated E2E Verification
- Create a Playwright test file `e2e-tests/tests/f7-customer-account.spec.ts`.
- The test must place an order via the checkout view, open the Account Drawer, log in with that order's email, and verify that the newly created order correctly displays in the drawer.

## Acceptance Criteria

### Compiling & Verification
- [ ] Root `npm run build` passes with zero typescript or bundler errors.
- [ ] Playwright test command `npx playwright test e2e-tests/tests/f7-customer-account.spec.ts` passes successfully on Chromium.
- [ ] State management: Logging in correctly updates `localStorage.customer_email` and logs out cleanly.
- [ ] UI standards: The drawer maintains full keyboard accessibility, close gestures (overlay click, Escape key, close button), and absolutely no horizontal scrollbar overflow (width <= 390px) on mobile viewports.
- [ ] Code Quality: Pure ASCII in all comments and strings.
</USER_REQUEST>

## Follow-up — 2026-06-14T15:31:25Z

<USER_REQUEST>
Integrate a Simulated Payment Gateway at Checkout for the Allbirds Storefront, supporting mock Credit Card and QR Code payment flows, database schema extensions, and E2E verification.

Working directory: F:/Allbirds
Integrity mode: development

## Requirements

### R1. Payment Options Selection
- Modify `src/components/checkout-view.tsx` to add a "Payment Method" step at Checkout.
- Support selecting between "Credit Card" and "QR Code (Mobile Banking)".

### R2. Credit Card Input & Validation
- Render Card Number, Expiration Date (MM/YY), and CVV/CVC fields.
- Validate Card Number using the Luhn algorithm. Validate Expiration Date (MM/YY format, must be in the future). Validate CVV (3-4 digits).
- If the Card Number ends with `9999`, simulate a declined card error and display "Payment Failed: Card Declined" inline.
- On valid credit card submission, show a processing spinner for 2 seconds before navigating to confirmation.

### R3. VietQR Code Flow
- Display a simulated VietQR modal/block displaying the order total amount and a transaction ID.
- Automatically advance to the confirmation page after 3 seconds, simulating successful QR scan.

### R4. CMS Orders Schema Extension
- Modify `payload-cms/src/collections/Orders.ts` to add `paymentMethod` (select: 'card', 'qr') and `paymentStatus` (select: 'unpaid', 'paid', default 'unpaid').
- Regenerate Payload types and ensure checkout submissions populate these fields in the database.

### R5. E2E Playwright Tests
- Create `e2e-tests/tests/f8-payment-gateway.spec.ts`.
- Verify input validations, declined card scenario (ends in `9999`), credit card success flow, and VietQR scan success flow.
- Assert that completed orders in the database have their payment details recorded correctly.

## Acceptance Criteria

### Compiling & Verification
- [ ] Root `npm run build` passes with zero typescript or bundler errors.
- [ ] Payload CMS build (`npm run build` inside `payload-cms/`) compiles cleanly with zero errors.
- [ ] Playwright test command `npx playwright test e2e-tests/tests/f8-payment-gateway.spec.ts` passes successfully on Chromium.
- [ ] Checkout forms are responsive and maintain absolutely no horizontal scrollbar overflow (width <= 390px) on mobile viewports.
- [ ] Pure ASCII only in all modified/created files' comments and strings.
</USER_REQUEST>
