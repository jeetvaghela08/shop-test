import { expect } from '@playwright/test';

export class CartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.cartLink = page.locator('[data-testid="cart-link"]');
    this.proceedToCheckoutButton = page.locator('[data-testid="proceed-to-checkout-button"]');
  }

  async openCart() {
    await this.cartLink.click();
  }

  /**
   * Verifies the details of a product in the cart.
   * @param {{name: string, price: number, quantity: number}} productData
   */
  async verifyProductInCart(productData) {
    // Using a test-id for the cart item row would be more robust if available.
    // For now, locating by class and text is a reasonable fallback.
    const productRow = this.page.locator('.cart-item', { hasText: productData.name });
    await expect(productRow).toBeVisible();

    // Prefer data-testid for child elements if they exist to improve locator stability.
    const productName = productRow.locator('.item-name'); // e.g., page.getByTestId('cart-item-name')
    const productPrice = productRow.locator('.item-price'); // e.g., page.getByTestId('cart-item-price')
    const productQuantity = productRow.locator('input[type="number"]'); // e.g., page.getByTestId('cart-item-quantity')

    await expect(productName).toHaveText(productData.name);
    await expect(productPrice).toHaveText(new RegExp(`\\$\\s*${productData.price.toFixed(2)}`));
    await expect(productQuantity).toHaveValue(productData.quantity.toString());
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }
}