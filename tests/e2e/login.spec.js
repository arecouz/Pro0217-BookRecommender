import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('textbox', { name: 'ENTER YOUR FIRST NAME BELOW' }).click();
  await page.getByRole('textbox', { name: 'ENTER YOUR FIRST NAME BELOW' }).fill('test');
  await page.getByRole('button', { name: 'SUBMIT' }).click();
  await page.goto('http://localhost:3000/library-interior/');
  await page.getByRole('link', { name: 'My Books' }).click();
  await page.getByRole('heading', { name: 'test\'s Reading List' }).click();
});