import { test, expect } from '@playwright/test';

test('shows error message on invalid login', async ({ page }) => {
  await page.goto('/');
  
  // Fill the login form
  await page.fill('input[type="email"]', 'test-checkly@example.com');
  await page.fill('input[type="password"]', 'wrongpassword123');
  
  // Click the submit button
  await page.click('button[type="submit"]');
  
  // Verify that the error message appears
  const errorMessage = page.locator('text=Identifiants invalides');
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
});
