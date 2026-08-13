
import { test, expect } from '@playwright/test';
import fs from 'fs';
import { signupPage, loginPage } from '../pages/auth-pom/auth';
import dotenv from 'dotenv';

dotenv.config();

test.setTimeout(120_000);

test('auth setup', async ({ browser }) => {
  const users = [
    {
      role: 'admin',
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
      authFile: '.auth/admin.json',
    },
    {
      role: 'customer',
      username: process.env.CUSTOMER_USERNAME,
      password: process.env.CUSTOMER_PASSWORD,
      authFile: '.auth/customer.json',
    },
    {
      role: 'seller',
      username: process.env.SELLER_USERNAME,
      password: process.env.SELLER_PASSWORD,
      authFile: '.auth/seller.json',
    },
    {
      role: 'abc',
      username: process.env.ABC_USERNAME,
      password: process.env.ABC_PASSWORD,
      authFile: '.auth/abc.json',
    },
  ];

  if (!fs.existsSync('.auth')) {
    fs.mkdirSync('.auth', { recursive: true });
  }

  for (const user of users) {
    if (fs.existsSync(user.authFile)) {
      console.log(`↪ ${user.role} auth file already exists; skipping`);
      continue;
    }

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const signup = new signupPage(page);
      const login = new loginPage(page);

      await signup.url();
      await page.waitForLoadState('domcontentloaded', { timeout: 60_000 });
      await login.login(user.username, user.password);

      await page.waitForLoadState('load', { timeout: 60_000 });
      await page.waitForTimeout(1000);
      await context.storageState({ path: user.authFile });

      const authState = JSON.parse(fs.readFileSync(user.authFile, 'utf8'));
      expect(
        authState.cookies?.length > 0 ||
          authState.origins?.some((origin) => (origin.localStorage?.length || 0) > 0),
        `Expected ${user.role} auth state to contain cookies or localStorage`
      ).toBeTruthy();

      console.log(`✅ ${user.role} auth file created`);
    } finally {
      await context.close();
    }
  }
});