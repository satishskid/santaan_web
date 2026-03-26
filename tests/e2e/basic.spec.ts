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
  
});
