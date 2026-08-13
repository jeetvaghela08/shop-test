import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/e2e/LoginPage.js';
import { DashboardPage } from '../pages/e2e/DashboardPage.js';
import { ProductPage } from '../pages/e2e/ProductPage.js';
import { CartPage } from '../pages/e2e/CartPage.js';
import { CheckoutPage } from '../pages/e2e/CheckoutPage.js';
import { testData } from '../pages/e2e/testdata.js';

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
 
  testData: async ({ page }, use) => {
    await use(new testData(page));
  }
});

export { expect } from '@playwright/test';