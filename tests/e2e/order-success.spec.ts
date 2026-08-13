import { test, expect } from '@playwright/test';

test.describe('Normal Order-Flow Tests (ORD-01 to ORD-03)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('demo-login-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByTestId('seed-products-btn').click();
    await page.waitForTimeout(300);
  });

  test('ORD-01 — Single-product order', async ({ page }) => {
    // 1. Open Products page & record initial stock of Logitech Mouse (45)
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const mouseStockCell = page.locator('[data-testid="product-stock-prod_1"]');
    const initialStock = parseInt(await mouseStockCell.innerText(), 10);
    expect(initialStock).toBeGreaterThan(0);

    // 2. Open Create Order page
    await page.getByTestId('nav-create-order').click();
    await expect(page).toHaveURL(/\/create-order/);
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();

    // 3. Fill customer name
    await page.getByTestId('customer-name-input').fill('Acme Fulfillment Corp');

    // 4. Select Logitech MX Master 3S Mouse
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });

    // 5. Enter quantity = 1 & add item
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();
    await expect(page.getByTestId('selected-items-list')).toBeVisible();

    // 6. Submit order
    await page.getByTestId('submit-order-btn').click();

    // 7. Verify confirmation displayed & order status is Fulfilled/CONFIRMED
    await expect(page).toHaveURL(/\/orders\/ord_/);
    await expect(page.getByTestId('order-success-banner')).toBeVisible();
    await expect(page.getByTestId('detail-customer-name')).toHaveText('Acme Fulfillment Corp');
    await expect(page.getByTestId('detail-order-status')).toHaveText('Fulfilled');

    // 8. Verify inventory decreases by exact quantity (initialStock - 1)
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const finalStock = parseInt(await mouseStockCell.innerText(), 10);
    expect(finalStock).toBe(initialStock - 1);
  });

  test('ORD-02 — Multi-product order', async ({ page }) => {
    // Record initial stocks for Mouse (prod_1) and Keyboard (prod_2)
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const mouseStockInitial = parseInt(await page.locator('[data-testid="product-stock-prod_1"]').innerText(), 10);
    const keybStockInitial  = parseInt(await page.locator('[data-testid="product-stock-prod_2"]').innerText(), 10);

    // Create Order with two products
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Multi Product Buyer Inc');

    // Add Product 1 (Mouse x 2)
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('2');
    await page.getByTestId('add-item-btn').click();

    // Add Product 2 (Keyboard x 3)
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_2' });
    await page.getByTestId('quantity-input').fill('3');
    await page.getByTestId('add-item-btn').click();

    // Submit order
    await page.getByTestId('submit-order-btn').click();

    // Verify order details page shows both reserved items
    await expect(page).toHaveURL(/\/orders\/ord_/);
    await expect(page.getByTestId('order-items-table')).toBeVisible();
    await expect(page.getByTestId('item-name-0')).toBeVisible();
    await expect(page.getByTestId('item-name-1')).toBeVisible();

    // Verify inventory decreases for both products
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const mouseStockFinal = parseInt(await page.locator('[data-testid="product-stock-prod_1"]').innerText(), 10);
    const keybStockFinal  = parseInt(await page.locator('[data-testid="product-stock-prod_2"]').innerText(), 10);

    expect(mouseStockFinal).toBe(mouseStockInitial - 2);
    expect(keybStockFinal).toBe(keybStockInitial - 3);
  });

  test('ORD-03 — Exact available stock', async ({ page }) => {
    // Find Dell Monitor (prod_3) stock
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const monitorStockCell = page.locator('[data-testid="product-stock-prod_3"]');
    const availableUnits = parseInt(await monitorStockCell.innerText(), 10);
    expect(availableUnits).toBeGreaterThan(0);

    // Order EXACT available units
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Exact Stock Buyer');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_3' });
    await page.getByTestId('quantity-input').fill(availableUnits.toString());
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    // Verify order succeeds
    await expect(page).toHaveURL(/\/orders\/ord_/);
    await expect(page.getByTestId('order-success-banner')).toBeVisible();

    // Verify inventory becomes 0
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const updatedStock = parseInt(await monitorStockCell.innerText(), 10);
    await expect(page.locator('[data-testid="product-row-prod_3"]').getByTestId('stock-badge-out')).toBeVisible();
  });

});
