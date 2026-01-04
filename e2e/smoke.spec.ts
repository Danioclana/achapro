import { test, expect } from '@playwright/test';

test('has title and login button', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/AchaPro/);

  // Expect the page to have a link with the name "Entrar".
  await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
});
