import { expect, test } from '@playwright/test';

test('BootScene arranca y la página no hace scroll', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#game canvas')).toBeVisible();
  await page.waitForTimeout(500);
  const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight);
  expect(scrolls).toBe(false);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `test-results/boot-${info.project.name}.png` });
});
