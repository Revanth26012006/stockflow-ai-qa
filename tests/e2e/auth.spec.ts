import { test, expect } from '@playwright/test';

test.describe('Authentication Tests (AUTH-01 to AUTH-04)', () => {

  test.beforeEach(async ({ page }) => {
    // Clear session state
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
  });

  test('AUTH-01 — Valid user can log in', async ({ page }) => {
    await expect(page.getByTestId('login-form')).toBeVisible();

    // Perform demo login
    await page.getByTestId('demo-login-btn').click();

    // Verify successful redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId('dashboard-title')).toContainText('Dashboard');
    await expect(page.getByTestId('user-email')).toBeVisible();
  });

  test('AUTH-02 — Invalid credentials are rejected', async ({ page }) => {
    await page.getByTestId('email-input').fill('nonexistent@user.com');
    await page.getByTestId('password-input').fill('WrongPassword123!');
    await page.getByTestId('submit-login-btn').click();

    // Verify login error alert is rendered
    await expect(page.getByTestId('login-error-alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('AUTH-03 — Authenticated user can sign out', async ({ page }) => {
    // Sign in first
    await page.getByTestId('demo-login-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Sign out
    await page.getByTestId('logout-btn').click();

    // Verify session ends and returns to login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-form')).toBeVisible();
  });

  test('AUTH-04 — Unauthenticated user cannot access protected pages', async ({ page }) => {
    // Attempt direct access to protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/products');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/create-order');
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login/);
  });

});
