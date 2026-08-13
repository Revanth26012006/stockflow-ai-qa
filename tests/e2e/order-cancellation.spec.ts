import { test, expect } from '@playwright/test';

test.describe('Order Cancellation Tests (CANCEL-01 to CANCEL-08)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('demo-login-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.getByTestId('seed-products-btn').click();
    await page.waitForTimeout(300);
  });

  test('CANCEL-01 — Cancel confirmed order', async ({ page }) => {
    // 1. Create a valid order
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Cancellation Entity 01');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    // 2. Navigate to Order Details page
    await expect(page).toHaveURL(/\/orders\/ord_/);
    await expect(page.getByTestId('detail-order-status')).toHaveText('Fulfilled');

    // 3. Verify cancel button is visible
    const cancelBtn = page.getByTestId('cancel-order-btn');
    await expect(cancelBtn).toBeVisible();

    // 4. Click cancel button
    await cancelBtn.click();

    // 5. Verify cancellation succeeds & feedback appears
    await expect(page.getByTestId('cancel-success-banner')).toBeVisible();
    await expect(page.getByTestId('cancel-success-banner')).toContainText('Order Cancelled — Inventory Restored Atomically');
  });

  test('CANCEL-02 — Inventory restoration', async ({ page }) => {
    // 1. Record initial stock of Product A (Mouse prod_1: 45)
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const mouseStockCell = page.locator('[data-testid="product-stock-prod_1"]');
    const initialStock = parseInt(await mouseStockCell.innerText(), 10);
    expect(initialStock).toBe(45);

    // 2. Order Product A x 3 (Stock becomes 45 - 3 = 42)
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Restoration Customer');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('3');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    // Verify stock decremented to 42
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    expect(parseInt(await mouseStockCell.innerText(), 10)).toBe(42);

    // 3. Cancel the order
    await page.getByTestId('nav-orders').click();
    await page.locator('tr:has-text("Restoration Customer") a, tr:has-text("Restoration Customer") button').first().click();
    await expect(page.getByTestId('cancel-order-btn')).toBeVisible();
    await page.getByTestId('cancel-order-btn').click();
    await expect(page.getByTestId('cancel-success-banner')).toBeVisible();

    // 4. Verify stock restored back to original N (45) through UI
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const restoredStock = parseInt(await mouseStockCell.innerText(), 10);
    expect(restoredStock).toBe(initialStock);
  });

  test('CANCEL-03 — Status transition', async ({ page }) => {
    // 1. Create order
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Status Transition Buyer');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_2' });
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    // 2. Cancel order
    await expect(page.getByTestId('cancel-order-btn')).toBeVisible();
    await page.getByTestId('cancel-order-btn').click();

    // 3. Verify status changes to CANCELLED and badge is red
    await expect(page.getByTestId('detail-order-status')).toHaveText('CANCELLED');
    await expect(page.getByTestId('detail-order-status')).toHaveClass(/badge-red/);

    // 4. Verify cancel button is no longer available
    await expect(page.getByTestId('cancel-order-btn')).toBeHidden();
  });

  test('CANCEL-04 — Double cancellation prevention', async ({ page }) => {
    // 1. Create order
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Double Cancellation Guard');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    // 2. Cancel order once via UI
    await page.getByTestId('cancel-order-btn').click();
    await expect(page.getByTestId('cancel-success-banner')).toBeVisible();
    await expect(page.getByTestId('detail-order-status')).toHaveText('CANCELLED');

    // 3. Verify cancel button is hidden so UI prevents second click
    await expect(page.getByTestId('cancel-order-btn')).toBeHidden();

    // 4. Attempt API-level second cancellation via evaluate to verify rejection logic
    const orderUrl = page.url();
    const orderIdMatch = orderUrl.match(/orders\/(ord_[^\/]+)/);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;
    expect(orderId).not.toBeNull();

    const rejectResult = await page.evaluate(async (targetId) => {
      try {
        const { cancelOrderAtomic } = await import('/src/services/inventoryService.ts');
        await cancelOrderAtomic(targetId);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }, orderId!);

    expect(rejectResult.success).toBe(false);
    expect(rejectResult.error).toContain('already cancelled');
  });

  test('CANCEL-05 — No double inventory restoration', async ({ page }) => {
    // 1. Record initial stock of Mouse (prod_1: 45)
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const mouseStockCell = page.locator('[data-testid="product-stock-prod_1"]');
    const initialStock = parseInt(await mouseStockCell.innerText(), 10); // 45

    // 2. Order Mouse x 2 (Stock becomes 43)
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('No Double Restock Corp');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('2');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    // 3. Cancel once -> stock returns to 45
    await page.getByTestId('cancel-order-btn').click();
    await expect(page.getByTestId('cancel-success-banner')).toBeVisible();

    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    expect(parseInt(await mouseStockCell.innerText(), 10)).toBe(initialStock); // 45

    // 4. Verify stock stays at N (45) and does NOT become N + Q (47)
    await page.reload();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const stockAfterReload = parseInt(await mouseStockCell.innerText(), 10);
    expect(stockAfterReload).toBe(initialStock);
    expect(stockAfterReload).not.toBe(initialStock + 2);
  });

  test('CANCEL-06 — Multi-product atomic restoration', async ({ page }) => {
    // 1. Record initial stocks for Mouse (prod_1: 45) and Keyboard (prod_2: 25)
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const mouseStockInitial = parseInt(await page.locator('[data-testid="product-stock-prod_1"]').innerText(), 10);
    const keybStockInitial  = parseInt(await page.locator('[data-testid="product-stock-prod_2"]').innerText(), 10);

    // 2. Create order with Mouse x 2 and Keyboard x 3
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Multi Restoration Org');

    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('2');
    await page.getByTestId('add-item-btn').click();

    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_2' });
    await page.getByTestId('quantity-input').fill('3');
    await page.getByTestId('add-item-btn').click();

    await page.getByTestId('submit-order-btn').click();

    // Verify decrements (Mouse 43, Keyboard 22)
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    expect(parseInt(await page.locator('[data-testid="product-stock-prod_1"]').innerText(), 10)).toBe(mouseStockInitial - 2);
    expect(parseInt(await page.locator('[data-testid="product-stock-prod_2"]').innerText(), 10)).toBe(keybStockInitial - 3);

    // 3. Cancel order
    await page.getByTestId('nav-orders').click();
    await page.locator('tr:has-text("Multi Restoration Org") a, tr:has-text("Multi Restoration Org") button').first().click();
    await page.getByTestId('cancel-order-btn').click();
    await expect(page.getByTestId('cancel-success-banner')).toBeVisible();

    // 4. Verify BOTH products return to exact initial stocks
    await page.getByTestId('nav-products').click();
    await expect(page.getByTestId('products-table')).toBeVisible();
    const mouseStockRestored = parseInt(await page.locator('[data-testid="product-stock-prod_1"]').innerText(), 10);
    const keybStockRestored  = parseInt(await page.locator('[data-testid="product-stock-prod_2"]').innerText(), 10);

    expect(mouseStockRestored).toBe(mouseStockInitial);
    expect(keybStockRestored).toBe(keybStockInitial);
  });

  test('CANCEL-07 — Order cancellation eligibility guard', async ({ page }) => {
    // 1. Create order and cancel it
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('Eligibility Guard User');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    await page.getByTestId('cancel-order-btn').click();
    await expect(page.getByTestId('detail-order-status')).toHaveText('CANCELLED');

    // 2. Verify cancel button is hidden on Order Details page for CANCELLED order
    await expect(page.getByTestId('cancel-order-btn')).toBeHidden();
  });

  test('CANCEL-08 — UI feedback and selector verification', async ({ page }) => {
    // 1. Create order
    await page.getByTestId('nav-create-order').click();
    await expect(page.getByTestId('product-select-dropdown')).toBeVisible();
    await page.getByTestId('customer-name-input').fill('UI Feedback Test Entity');
    await page.getByTestId('product-select-dropdown').selectOption({ value: 'prod_1' });
    await page.getByTestId('quantity-input').fill('1');
    await page.getByTestId('add-item-btn').click();
    await page.getByTestId('submit-order-btn').click();

    // 2. Verify cancel button selector accessibility
    const cancelBtn = page.getByTestId('cancel-order-btn');
    await expect(cancelBtn).toBeVisible();
    await expect(cancelBtn).toContainText('Cancel Order');

    // 3. Click cancel and verify banners & badges
    await cancelBtn.click();
    await expect(page.getByTestId('cancel-success-banner')).toBeVisible();
    await expect(page.getByTestId('cancel-success-banner')).toContainText('Order Cancelled — Inventory Restored Atomically');
    await expect(page.getByTestId('detail-order-status')).toHaveText('CANCELLED');
  });

});
