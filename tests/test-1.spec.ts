import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Recording...
});await page.goto('https://shopteststore.netlify.app/');
await page.getByTestId('nav-link-p
await page.getByTestId('product-search-input').click();
await page.getByTestId('product-search-input').fill('Mechanical Keyboard RGB');
await page.getByTestId('product-search-input').press('Enter');
await page.getByTestId('product-card-image-link').click();
await page.getByTestId('product-card-image-link').click();
await page.getByTestId('product-card-image-link').click();
await page.getByTestId('product-card-image-link').dblclick();
await page.getByText('ElectronicsMechanical').click();
await page.getByText('ElectronicsMechanical').click();
await page.getByTestId('product-card-name').click();
await page.getByTestId('product-card-image-link').dblclick();
await page.getByTestId('product-card-image-link').click();roducts').click();