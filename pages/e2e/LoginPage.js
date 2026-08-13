import { expect } from '@playwright/test';

export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
//   constructor(page) {
//         this.page = page;
//         // locators
//         this.signUpLink = page.locator('a:has-text("Sign Up")');
//         this.firstNameInput = page.locator('input[name="firstName"]');
//         this.lastNameInput = page.locator('input[name="lastName"]');
//         this.emailInput = page.locator('input[name="email"]');
//         this.passwordInput = page.locator('input[name="password"]');
//         this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
//         this.signUpButton = page.locator('button:has-text("Sign Up")');
//   }

  /**
   * Navigates to the login page.
   */
  async goto() {
    await this.page.goto('https://shopteststore.netlify.app/login');
     }



  async adminLogin() {
    await this.page.goto('https://shopteststore.netlify.app/admin');
    const loginBtn = this.page.getByTestId('nav-login');
  }

    constructor(page) {
        this.page = page;
        // Locators
        this.usernameInput = page.locator('input[id="username"], input[type="email"], input[placeholder*="Username"]');
        this.loginBtn = page.getByTestId('nav-login');
        this.passwordInput = page.locator('input[id="password"], input[type="password"]');
        this.loginButton = page.getByTestId('login-submit');
        this.errorMessage = page.locator('.error-message, [role="alert"], .alert-danger');
        this.logoutBtn = this.page.getByRole('button', { name: 'Logout' });
    }

    /** Navigates to the login page of the store.*/
    async navigate() {
        await this.page.goto('https://shopteststore.netlify.app/');
   
    }
 async login(username, password) {

  // If already logged in, logout first
  if (await this.logoutBtn.isVisible()) {
    await this.logoutBtn.click();
    await this.loginBtn.waitFor({ state: 'visible' });
  }

  await this.loginBtn.click();
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
  await this.loginButton.click();

  await this.logoutBtn.waitFor({ state: 'visible' });
}
        
async fillAdminCredentials() {
                this.admin = this.page.getByTestId('login-quickfill-admin');
                this.loginBtn = this.page.getByTestId('nav-login');
                await this.loginBtn.click();
                await this.admin.click();
                await this.loginButton.click();
            }
            
            async verifySuccessfulLogin() {
    await expect(this.logoutBtn).toBeVisible();
  }
        }
      