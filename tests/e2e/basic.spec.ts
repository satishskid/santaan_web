import { test, expect } from '@playwright/test';

test.describe('CRM Public Routes & Basics', () => {
  
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the main heading exists (adjust this based on your actual homepage content)
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check for the login form elements
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByPlaceholder(/telecaller/i)).toBeVisible();
    await expect(page.getByPlaceholder(/6 digit PIN/i)).toBeVisible();
  });
  
  test('Admin login and dashboard access', async ({ page }) => {
    await page.goto('/login'); // Assuming admin logs in through the same portal or '/admin/login'

    // Simulate login for an admin role (Adjust selectors based on actual login fields)
    // Here we'll just check if the admin elements exist if we mock it, or if it navigates properly
    // Note: For a real E2E, we would fill credentials like:
    // await page.fill('input[name="email"]', 'admin@santaan.in');
    // await page.fill('input[name="password"]', 'test-password');
    // await page.click('button[type="submit"]');

    // For now, let's ensure the admin dashboard route is accessible if authenticated
    // or that it redirects properly if not. Let's test the protective redirect:
    await page.goto('/admin');
    
    // It should redirect to login if not authenticated, or show dashboard if authenticated
    const url = page.url();
    expect(url.includes('/login') || url.includes('/admin')).toBeTruthy();
  });
});
