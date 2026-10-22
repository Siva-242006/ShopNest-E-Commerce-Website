import { test, expect } from '@playwright/test';
import { setupE2EApiMocks, mockUser } from './helpers.js';

test.describe('E2E: User Login -> Browse Catalog -> Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EApiMocks(page, {
      currentUser: mockUser,
      initialCart: [],
    });
  });

  test('completes full flow from login through browsing and adding product to cart', async ({
    page,
  }) => {
    // 1. Visit Login page
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: /welcome back/i }),
    ).toBeVisible();

    // 2. Perform Login
    await page.locator('#username').fill('customer');
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: /^login$/i }).click();

    // 3. User navigates to Products catalog
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Verify catalog items render
    const headphones = page.getByText('Wireless Noise Cancelling Headphones');
    await expect(headphones).toBeVisible();
    await expect(page.getByText('Classic Organic Cotton Hoodie')).toBeVisible();

    // 4. Test Search filter
    const searchInput = page.getByPlaceholder('Search by name...');
    await searchInput.fill('Headphones');
    await expect(headphones).toBeVisible();
    await expect(
      page.getByText('Classic Organic Cotton Hoodie'),
    ).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.getByText('Classic Organic Cotton Hoodie')).toBeVisible();

    // 5. Navigate to Product Detail page
    await headphones.click();
    await expect(page).toHaveURL(/.*\/products\/prod-101/);
    await expect(
      page.getByRole('heading', {
        name: 'Wireless Noise Cancelling Headphones',
      }),
    ).toBeVisible();
    await expect(page.getByText('SoundMaster')).toBeVisible();

    // 6. Add to Cart
    const addToCartBtn = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();

    // 7. Navigate to Cart and verify item presence
    await page.goto('/cart');
    await expect(
      page.getByRole('heading', {
        name: 'Wireless Noise Cancelling Headphones',
      }),
    ).toBeVisible();
    await expect(page.getByText(/cart summary/i)).toBeVisible();
    await expect(page.getByText(/total items/i)).toBeVisible();
  });
});
