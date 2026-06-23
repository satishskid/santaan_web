import { test, expect } from '@playwright/test';

test.describe('Santaan public website', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Fertility insights page renders public article cards', async ({ page }) => {
    await page.goto('/fertility-insights');

    await expect(page.getByRole('heading', { name: /fertility insights/i })).toBeVisible();
  });

  test('Locations page exposes clinic contact details', async ({ page }) => {
    await page.goto('/contact-centres');

    await expect(page.getByText(/Bhubaneswar/i).first()).toBeVisible();
  });

  test('Blog API returns a public posts envelope', async ({ request }) => {
    const response = await request.get('/api/blogs?limit=1');

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.posts)).toBeTruthy();
  });
});
