import { test, expect } from '@playwright/test';
import { setupE2EApiMocks, mockAdmin, initialProducts } from './helpers.js';

test.describe('E2E: Admin Login -> Product Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EApiMocks(page, {
      currentUser: mockAdmin,
      products: [...initialProducts],
    });
  });

  test('admin logs in, views admin privileges, creates product, and deletes product', async ({
    page,
  }) => {
    // 1. Log in as Admin via login screen
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: /welcome back/i }),
    ).toBeVisible();

    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('adminpassword');
    await page.getByRole('button', { name: /^login$/i }).click();

    // 2. Navigate to Products
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();

    // Verify admin "+ Add New Product" button is visible
    const addProductBtn = page.getByRole('button', {
      name: /\+ add new product/i,
    });
    await expect(addProductBtn).toBeVisible();

    // Verify admin Edit and Delete buttons on product cards
    const deleteButtons = page.locator('.product-delete-btn');
    await expect(deleteButtons.first()).toBeVisible();

    // 3. Click "+ Add New Product" and navigate to form
    await addProductBtn.click();
    await expect(page).toHaveURL(/.*\/admin\/products\/add/);
    await expect(
      page.getByRole('heading', { name: /add product/i }),
    ).toBeVisible();

    // 4. Fill Product Form
    await page.locator('input[name="name"]').fill('Smart Fitness Watch');
    await page
      .locator('textarea[name="description"]')
      .fill('Waterproof fitness tracker with heart rate and sleep monitor.');
    await page.locator('input[name="price"]').fill('1999');
    await page
      .locator('input[name="image"]')
      .fill(
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      );
    await page.locator('input[name="brand"]').fill('FitTech');
    await page.getByLabel('Category').selectOption('Electronics');
    await page.locator('input[name="stock"]').fill('20');

    // 5. Submit Form
    await page.getByRole('button', { name: /^add product$/i }).click();

    // 6. Redirected back to products list with new product visible
    await expect(page).toHaveURL(/.*\/products/);
    await expect(page.getByText('Smart Fitness Watch')).toBeVisible();

    // 7. Test Deleting the product
    const deleteBtn = page
      .locator('.product-card')
      .filter({ hasText: 'Smart Fitness Watch' })
      .locator('.product-delete-btn');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Confirm product is removed from DOM
    await expect(page.getByText('Smart Fitness Watch')).not.toBeVisible();
  });
});
