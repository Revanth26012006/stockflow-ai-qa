import { test, expect } from '@playwright/test';

test.describe('Data-Integrity & Atomic Rollback Tests (ATOMIC-01)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('demo-login-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByTestId('seed-products-btn').click();
    await page.waitForTimeout(300);
  });

  test('ATOMIC-01 — No partial inventory update on multi-product order failure', async ({ page }) => {
    // 1. Record initial stock of Product A (Mouse prod_1: 45) and Product B (Chair prod_6: 0)
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const stockAInitial = parseInt(await page.locator('[data-testid="product-stock-prod_1"]').innerText(), 10); // 45
    const stockBInitial = parseInt(await page.locator('[data-testid="product-stock-prod_6"]').innerText(), 10); // 0

    expect(stockAInitial).toBe(45);
    expect(stockBInitial).toBe(0);

    // 2. Open Create Order page
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Atomic Rollback Entity');

    // 3. Add Product A (Mouse - 2 units)
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('2');
    await page.getByTestId('add-item-btn').click();
    await expect(page.getByTestId('selected-item-row-prod_1')).toBeVisible();

    // 4. Attempt to select Product B (Chair - 5 units, stock is 0 and option disabled)
    const chairOption = page.locator('option[value="prod_6"]');
    await expect(chairOption).toBeDisabled();

    // Now edit row 1 Qty to exceed stock (50 units for Mouse) to force over-stock rejection
    await page.locator('[data-testid="item-qty-input-prod_1"]').fill('50');

    // Verify row displays over-stock error and submit button is disabled
    await expect(page.getByTestId('row-error-prod_1')).toBeVisible();
    await expect(page.getByTestId('submit-order-btn')).toBeDisabled();

    // 5. Navigate back to Products page and verify stock remains 100% UNCHANGED
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const stockAFinal = parseInt(await page.locator('[data-testid="product-stock-prod_1"]').innerText(), 10);
    const stockBFinal = parseInt(await page.locator('[data-testid="product-stock-prod_6"]').innerText(), 10);

    expect(stockAFinal).toBe(45); // Unchanged!
    expect(stockBFinal).toBe(0);  // Unchanged!

    // 6. Verify NO partial order document was created in Orders history
    await page.getByTestId('nav-orders').click();
    await expect(page.locator('td:has-text("Atomic Rollback Entity")')).toHaveCount(0);
  });

});
