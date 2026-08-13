import { test, expect } from '@playwright/test';

test.describe('Edge-Case Tests (EDGE-01 to EDGE-05)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('demo-login-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByTestId('seed-products-btn').click();
    await page.waitForTimeout(300);
  });

  test('EDGE-01 — Quantity = 1', async ({ page }) => {
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Edge Customer Qty 1');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    await expect(page).toHaveURL(/\/orders\/ord_/);
    await expect(page.getByTestId('order-success-banner')).toBeVisible();
    await expect(page.getByTestId('detail-total-items')).toContainText('1 units');
  });

  test('EDGE-02 — Quantity exactly equals available stock', async ({ page }) => {
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const stock = parseInt(await page.locator('[data-testid="product-stock-prod_4"]').innerText(), 10); // Anker Dock stock (30)

    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Edge All Stock Buyer');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_4' });
    await page.getByTestId('quantity-input').fill(stock.toString());
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    await expect(page).toHaveURL(/\/orders\/ord_/);
    await expect(page.getByTestId('order-success-banner')).toBeVisible();
  });

  test('EDGE-03 — Multiple products with different quantities', async ({ page }) => {
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Edge Varying Quantities');

    // Item 1: Qty 2
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('2');
    await page.getByTestId('add-item-btn').click();

    // Item 2: Qty 4
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_4' });
    await page.getByTestId('quantity-input').fill('4');
    await page.getByTestId('add-item-btn').click();

    await page.getByTestId('submit-order-btn').click();

    await expect(page).toHaveURL(/\/orders\/ord_/);
    await expect(page.getByTestId('item-quantity-0')).toHaveText('2');
    await expect(page.getByTestId('item-quantity-1')).toHaveText('4');
  });

  test('EDGE-04 — Verify order summary totals calculation', async ({ page }) => {
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Totals Calculation Check');

    // Add Mouse ($99.99 x 2 = $199.98)
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('2');
    await page.getByTestId('add-item-btn').click();

    // Add Keyboard ($119.50 x 1 = $119.50)
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_2' });
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();

    // Expected grand total: 199.98 + 119.50 = 319.48
    await expect(page.getByTestId('order-grand-total')).toHaveText('$319.48');

    await page.getByTestId('submit-order-btn').click();
    await expect(page.getByTestId('detail-order-total')).toHaveText('$319.48');
  });

  test('EDGE-05 — Verify inventory persistence after page reload', async ({ page }) => {
    // 1. Order 5 units of Mouse (initial 45 -> 40)
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Persistence Test Corp');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('5');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();
    await expect(page.getByTestId('order-success-banner')).toBeVisible();

    // 2. Reload browser page
    await page.reload();

    // 3. Go to Products page and verify stock persists at 40
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const stockText = await page.locator('[data-testid="product-stock-prod_1"]').innerText();
    expect(parseInt(stockText, 10)).toBe(40);
  });

});
