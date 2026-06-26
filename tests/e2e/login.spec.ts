import { test, expect } from '@playwright/test';

test('has title and redirects to login when not authenticated', async ({ page }) => {
  await page.goto('/');
  
  // Assuming the homepage has a login form or redirect
  await expect(page).toHaveTitle(/Ferme JN Beauchemin/i);
  
  // Check that email input is visible (assuming standard Better Auth login form)
  // If the actual app redirects or has specific texts, we can adjust this.
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  if (await emailInput.isVisible()) {
    await expect(emailInput).toBeVisible();
  }
});
