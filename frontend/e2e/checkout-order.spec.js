import { test, expect } from '@playwright/test';
import {
  setupE2EApiMocks,
  mockUser,
  createMockToken,
  initialProducts,
} from './helpers.js';

test.describe('E2E: User Checkout and Order Placement Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EApiMocks(page, {
      currentUser: mockUser,
      initialCart: [
        {
          product: initialProducts[0],
          quantity: 2,
        },
      ],
    });
  });

  test('completes full checkout flow: cart -> delivery address -> review -> place order', async ({
    page,
  }) => {
    // 1. Log in via token in localStorage
    const token = createMockToken(mockUser);
    await page.addInitScript((jwt) => {
      window.localStorage.setItem('jwt_token', jwt);
    }, token);

    // 2. Visit Cart page
    await page.goto('/cart');
    await expect(
      page.getByRole('heading', {
        name: 'Wireless Noise Cancelling Headphones',
      }),
    ).toBeVisible();

    // 3. Click Checkout
    const checkoutBtn = page.getByRole('button', { name: /^checkout$/i });
    await expect(checkoutBtn).toBeVisible();
    await checkoutBtn.click();

    // 4. On Checkout page, fill delivery address form
    await expect(page).toHaveURL(/.*\/checkout/);
    await expect(
      page.getByRole('heading', { name: /checkout/i }),
    ).toBeVisible();

    await page.locator('input[name="fullName"]').fill('Jane Customer');
    await page.locator('input[name="phone"]').fill('9876543210');
    await page.locator('input[name="street"]').fill('123 High Street');
    await page.locator('input[name="city"]').fill('Mumbai');
    await page.locator('select[name="state"]').selectOption('Maharashtra');
    await page.locator('input[name="pincode"]').fill('400001');

    // 5. Submit Address
    const saveAddressBtn = page.getByRole('button', { name: /save address/i });
    await saveAddressBtn.click();

    // 6. Review Order screen
    await expect(
      page.getByRole('heading', { name: /review order/i }),
    ).toBeVisible();
    await expect(
      page.getByText('Wireless Noise Cancelling Headphones'),
    ).toBeVisible();
    await expect(page.getByText(/quantity:\s*2/i)).toBeVisible();

    // 7. Place Order
    const placeOrderBtn = page.getByRole('button', { name: /place order/i });
    await expect(placeOrderBtn).toBeVisible();
    await placeOrderBtn.click();

    // 8. Verify Confirmation Screen
    await expect(
      page.getByRole('heading', { name: /order placed successfully/i }),
    ).toBeVisible();
    await expect(page.getByText(/thank you, jane customer!/i)).toBeVisible();
    await expect(page.getByText(/cash on delivery/i)).toBeVisible();
  });
});
