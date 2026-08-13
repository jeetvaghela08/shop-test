import { expect } from '@playwright/test';

export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
   this.logoutButton = page.getByTestId('nav-logout');
    this.adminLink = page.getByTestId('nav-link-admin');
    
this.productsLink = page.getByTestId('nav-link-products');

    this.searchInput = page.getByTestId('product-search-input');
    this.searchButton = page.getByTestId('search-button');
  }

  /**
   * Verifies that the user is successfully logged in.
   */
   async verifySuccessfulLogin() {
    await expect(this.logoutButton).toBeVisible();
  }

  /**
   * Navigates to the main Admin dashboard area.
   */
  async navigateToAdmin() {
    await this.adminLink.click();
  }

  /**
   * Navigates to the Product Management page (for Admins).
   */
  async navigateToProductManagement() {
    await this.productsLink.click();
  }

  /**
   * Searches for a product from the main dashboard.
   * @param {string} productName
   */
  async searchForProduct(productName) {
    await this.searchInput.fill(productName);
    await this.searchInput.press('Enter');
    // Wait for the API call that filters the products to complete.
    await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
   await expect(
        this.page.getByText(productName, { exact: true })
    ).toBeVisible(); 
  }

  async logout() {
    await this.logoutButton.click();
  }
}