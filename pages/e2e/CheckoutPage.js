import { expect } from '@playwright/test';

export class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.addressInput = page.getByTestId('address-input');
    this.cityInput = page.getByTestId('city-input');
    this.postalCodeInput = page.getByTestId('postal-code-input');
    this.countryInput = page.getByTestId('country-input');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
  }

  /**
   * Fills the shipping details and completes the checkout process.
   * @param {ReturnType<import('./dataHelper.js').generateDynamicShippingData>} shippingData
   */
  async fillShippingDetails(shippingData) {
    await this.addressInput.fill(shippingData.address);
    await this.cityInput.fill(shippingData.city);
    await this.postalCodeInput.fill(shippingData.postalCode);
    await this.countryInput.fill(shippingData.country);
    await this.continueButton.click(); // To shipping
    await this.continueButton.click(); // To payment
    await this.continueButton.click(); // To place order
    // The final step requires clicking the "Place Order" button.
    await this.placeOrderButton.click(); 
  }
}