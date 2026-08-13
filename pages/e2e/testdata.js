import { generateDynamicProductData, generateDynamicShippingData } from './dataHelper.js';

export class testData {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.product = generateDynamicProductData();
    this.shipping = generateDynamicShippingData();
    this.credentials = {
      admin: { email: 'admin@shop.test', password: 'Password123!' },
      customer: { email: 'customer@shop.test', password: 'Password123!' },
    };
  }
}
