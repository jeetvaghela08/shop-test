import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { LoginPage } from '../pages/loginpage';

test('auth setup', async ({ page }) => {

  const users = [
    {
      username: 'admin@gmail.com',
      password: 'admin123',
      authFile: '.auth/admin.json'
    },
    {
      username: 'customer@gmail.com',
      password: 'customer123',
      authFile: '.auth/customer.json'
    },
    {
      username: 'seller@gmail.com',
      password: 'seller123',
      authFile: '.auth/seller.json'
    },
     {
      username: 'abc@gmail.com',
      password: 'abc123',
      authFile: '.auth/abc.json'
    }
  ];

  const dir = path.dirname('.auth/admin.json');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const user of users) {

    const loginPage = new LoginPage(page);

    // Open Login Page
    await loginPage.gotoLoginPage();

    // Login
    await loginPage.login(
      user.username,
      user.password
    );

    // Wait for Dashboard
    await page.waitForURL('**/dashboard');

    await expect(page).toHaveURL(/dashboard/);

    // Save Auth State
    await page.context().storageState({
      path: user.authFile
    });

    console.log(`✅ ${user.authFile} auth file created`);

    // Logout (તમારા project પ્રમાણે change કરજો)
    await page.goto('/logout');
  }

});