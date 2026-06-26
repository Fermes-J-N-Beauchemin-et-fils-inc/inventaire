# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> has title and redirects to login when not authenticated
- Location: tests/e2e/login.spec.ts:3:5

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Inventaire/i
Received string:  "Ferme JN Beauchemin"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    14 × unexpected value "Ferme JN Beauchemin"

```

```yaml
- img "Logo Fermes J.N. Beauchemin"
- heading "Se connecter" [level=1]
- paragraph: Accédez à votre plateforme de gestion agricole
- text: Courriel
- textbox "Courriel":
  - /placeholder: "Ex: admin@example.com"
- text: Mot de passe
- textbox "Mot de passe":
  - /placeholder: ••••••••
- button "Se connecter"
- text: La Ferme JN Beauchemin Et Fils.inc 2139 rang St-Pierre, Saint-Ours QC J0G 1P0 450 785-5537
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('has title and redirects to login when not authenticated', async ({ page }) => {
  4  |   await page.goto('/');
  5  |   
  6  |   // Assuming the homepage has a login form or redirect
> 7  |   await expect(page).toHaveTitle(/Inventaire/i);
     |                      ^ Error: expect(page).toHaveTitle(expected) failed
  8  |   
  9  |   // Check that email input is visible (assuming standard Better Auth login form)
  10 |   // If the actual app redirects or has specific texts, we can adjust this.
  11 |   const emailInput = page.locator('input[type="email"], input[name="email"]');
  12 |   if (await emailInput.isVisible()) {
  13 |     await expect(emailInput).toBeVisible();
  14 |   }
  15 | });
  16 | 
```