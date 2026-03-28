import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Critical Path', () => {

  test('Rejects invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/username or email/i).fill('invalid.user@example.com');
    await page.getByLabel(/pin\s*\/\s*password/i).fill('000000');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText('Invalid username or PIN')).toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/login$/);
  });

  test('Logs in and loads Action Board (requires seeded user)', async ({ page }) => {
    const testUser = process.env.TEST_USER_EMAIL;
    const testPass = process.env.TEST_USER_PASSWORD;

    test.skip(!testUser || !testPass, 'Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run this test.');

    await page.goto('/login');
    await page.getByLabel(/username or email/i).fill(testUser!);
    await page.getByLabel(/pin\s*\/\s*password/i).fill(testPass!);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.waitForURL('**/admin/dashboard');
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CRM Dashboard' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Action Board' })).toBeVisible();
    await page.getByRole('button', { name: 'Action Board' }).click();
    await expect(page.getByRole('heading', { name: 'Your Action Inbox' })).toBeVisible();
  });

});
