
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
    //     {
    //   role: 'admin2',
    //   username: process.env.ADMIN2_USERNAME,
    //   password: process.env.ADMIN2_PASSWORD,
    //   authFile: '.auth/admin2.json',
    // },
    {
      role: 'seller',
      username: process.env.SELLER_USERNAME,
      password: process.env.SELLER_PASSWORD,
      authFile: '.auth/seller.json',
    },
    //     {
    //   role: 'seller2',
    //   username: process.env.SELLER2_USERNAME,
    //   password: process.env.SELLER2_PASSWORD,
    //   authFile: '.auth/seller2.json',
    // },
    //     {
    //   role: 'customer2',
    //   username: process.env.CUSTOMER2_USERNAME,
    //   password: process.env.CUSTOMER2_PASSWORD,
    //   authFile: '.auth/customer2.json',
    // },

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

      await expect(page.getByRole('button', { name: /logout/i }))
    
      .toBeVisible({ timeout: 60_000 });

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