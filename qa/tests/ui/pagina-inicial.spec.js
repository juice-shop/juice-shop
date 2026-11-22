const { test, expect } = require('@playwright/test');

test('UI - a página inicial do Juice Shop carrega', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle(/Juice Shop/i);

  await expect(page.locator('app-root')).not.toBeEmpty();
});