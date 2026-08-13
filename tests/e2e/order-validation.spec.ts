import { test, expect } from '@playwright/test';

test.describe('Invalid-Input Tests (INVALID-01 to INVALID-05)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('demo-login-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByTestId('seed-products-btn').click();
    await page.waitForTimeout(300);
  });

  test('INVALID-01 — Quantity = 0 is rejected', async ({ page }) => {
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Invalid Qty 0 Test');

    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('0');
    await page.getByTestId('add-item-btn').click();

    // Verify warning alert shown
    await expect(page.getByTestId('order-warning-alert')).toBeVisible();
    await expect(page.getByTestId('order-warning-alert')).toContainText('positive integer');

    // Verify submit button disabled
    await expect(page.getByTestId('submit-order-btn')).toBeDisabled();

    // Verify stock remains 45
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    expect(await page.locator('[data-testid="product-stock-prod_1"]').innerText()).toBe('45');
  });

  test('INVALID-02 — Negative quantity is rejected', async ({ page }) => {
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Negative Qty Test');

    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('-5');
    await page.getByTestId('add-item-btn').click();

    // Verify warning alert shown
    await expect(page.getByTestId('order-warning-alert')).toBeVisible();

    // Verify stock remains 45
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    expect(await page.locator('[data-testid="product-stock-prod_1"]').innerText()).toBe('45');
  });

  test('INVALID-03 — Quantity greater than available stock is rejected', async ({ page }) => {
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const availableStock = parseInt(await page.locator('[data-testid="product-stock-prod_1"]').innerText(), 10);

    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Overstock Request Test');

    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill((availableStock + 100).toString());
    await page.getByTestId('add-item-btn').click();

    // Verify stock alert displayed
    await expect(page.getByTestId('order-warning-alert')).toBeVisible();
    await expect(page.getByTestId('submit-order-btn')).toBeDisabled();

    // Verify stock unchanged
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    expect(await page.locator('[data-testid="product-stock-prod_1"]').innerText()).toBe(availableStock.toString());
  });

  test('INVALID-04 — Missing customer name is rejected', async ({ page }) => {
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();

    // Leave customer name empty
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();

    // Submit button should be disabled due to empty customer name
    await expect(page.getByTestId('submit-order-btn')).toBeDisabled();

    // If spaces entered
    await page.getByTestId('customer-name-input').fill('   ');
    await expect(page.getByTestId('submit-order-btn')).toBeDisabled();

    // Verify stock unchanged
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    expect(await page.locator('[data-testid="product-stock-prod_1"]').innerText()).toBe('45');
  });

  test('INVALID-05 — Empty order submission is prevented', async ({ page }) => {
    await page.getByTestId('nav-create-order').click();
    await page.getByTestId('customer-name-input').fill('Empty Order Customer');

    // Do NOT add any products
    await expect(page.getByTestId('empty-order-placeholder')).toBeVisible();
    await expect(page.getByTestId('submit-order-btn')).toBeDisabled();
  });

});
