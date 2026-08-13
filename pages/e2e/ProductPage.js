import { expect } from '@playwright/test';

export class ProductPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    // Admin - Add Product
    this.admin = page.getByTestId('nav-link-admin')
    this.adminproduct = page.getByTestId('admin-nav-products')
    this.addProductButton =  page.getByTestId('admin-product-new')

    this.productNameInput = page.getByTestId('product-form-name');
    this.slugInput = page.getByTestId('product-form-slug');
    this.skuInput = page.getByTestId('product-form-sku');
    this.priceInput = page.getByTestId('product-form-price');
    this.quantityInput = page.getByTestId('product-form-stock');
    this.categorySelect = page.getByTestId('product-form-category');
    this.imageInput = page.getByTestId('product-form-images');
    this.activeToggle = page.getByTestId('product-form-active');
    this.descriptionInput = page.getByTestId('product-form-description');
    this.saveProductButton = page.getByTestId('product-form-submit');

    // Admin - Product List Filters
    this.adminFilterSearchInput = page.getByTestId('product-search-input');
    this.adminFilterCategorySelect = page.getByTestId('filter-category');
    this.adminFilterSortSelect = page.getByTestId('product-filter-sort');

    // Customer - Product Details
    this.addToCartButton = page.getByTestId('add-to-cart-button');
    this.cartCount = page.getByTestId('cart-count');

    // Customer - Product List Filters
    this.customerSearchInput = page.getByTestId('product-search-input');
    this.customerCategorySelect = page.getByTestId('filter-category');
    this.customerSortSelect = page.getByTestId('filter-sort');
    this.inStockCheckbox = page.getByTestId('filter-instock');
    this.clearFiltersButton = page.getByTestId('filter-clear');
  }

  /** goto product butn flow */
 async gotoProductPage() {
     await this.admin.click();
    
    await this.adminproduct.click();
    

  }

  /**
   * Clicks the button to add a new product.
   */


  async clickAddProduct() {
    await this.addProductButton.click();
  }

  /**
   * Fills the new product form and saves it.
   * @param {ReturnType<import('../utils/dataHelper.js').generateDynamicProductData>} productData
   */
  async createNewProduct(productData) {
    await this.productNameInput.fill(productData.name);
    await this.slugInput.fill(productData.slug);
    await this.skuInput.fill(productData.sku);
    await this.priceInput.fill(productData.price.toString());
    await this.quantityInput.fill(productData.quantity.toString());
    await this.categorySelect.selectOption({ label: productData.category });
    await this.imageInput.fill(productData.images.join(','));
    await this.descriptionInput.fill(productData.description);

    // Ensure the 'Active' toggle is checked for the product to be visible in the store.
    // The .check() method may not work on custom-styled toggles, so we verify and click if needed.
    if (!(await this.activeToggle.isChecked())) {
      await this.activeToggle.click();
    }
    await this.saveProductButton.click();
  }

  /**
   * Verifies that the newly created product is visible in the product list.
   * @param {string} productName
   */
  async verifyProductIsVisible(productName) {
    const productRow = this.page.locator('tr', { hasText: productName });
    await expect(productRow).toBeVisible();
  }

  /**
   * Clicks on a product in a list to view its details.
   * @param {string} productName
   */
  async viewProductDetails(productName) {
    await this.page.locator(`[data-testid="product-name"]`, { hasText: productName }).click();
  }

  async addProductToCart() {
    await this.addToCartButton.click();
  }

  /**
   * Searches for a product on the admin product list page.
   * @param {string} productName
   */
  async searchProduct(productName) {
    await this.adminFilterSearchInput.fill(productName);
    // Wait for the API call that filters the products to complete.
    await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
  }

  /**
   * Filters the admin product list by a specific category.
   * @param {string} categoryName
   */   
  async selectAdminCategory(categoryName) {
    await this.adminFilterCategorySelect.selectOption(categoryName);
    // Wait for the API call that filters the products to complete.
    await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
  }

  /**
   * Sorts the admin product list based on the provided option.
   * @param {'Newest'
   * | 'Price: low to high'
   *  | 'Price: high to low' 
   * | 'Top rated' |
   *  'Name A–Z'} sortOption
   */
  async sortAdminProducts(sortOption) {
    await this.adminFilterSortSelect.selectOption({ label: sortOption });
    // Wait for the API call that sorts the products to complete.
    await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
  }

  // --- Customer Facing Filter Methods ---

  /**
   * Filters the customer product list by category.
   * @param {string} categoryName
   */
  async selectCategory(categoryValue) {
    await this.customerCategorySelect.selectOption(categoryValue);
    await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
  }

  /**
   * Sorts the customer product list.
   * @param {string} sortValue - The value of the sort option (e.g., 'price_asc').
   */
  async sortProducts(sortValue) {
    await this.customerSortSelect.selectOption(sortValue);
    await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
  }

  /**
   * Toggles the 'In Stock Only' filter.
   * @param {boolean} enable - true to check the box, false to uncheck it.
   */
  async setInStockOnly(enable) {
    if (enable) {
      await this.inStockCheckbox.click();
    } else {
      await this.inStockCheckbox.uncheck();
    }
    await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
  }

  /**
   * Clears all applied filters on the customer product list.
   */
  async clearFilters() {
    if (await this.clearFiltersButton.isVisible()) {
      await this.clearFiltersButton.click();
      await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
    }
  }

  /**
   * Applies multiple filters to the customer product list at once.
   * @param {{search?: string, category?: string, sort?: string, inStock?: boolean}} filters
   */
  async filterProducts(filters) {
    let needsWait = false;

    if (filters.search) {
      await this.customerSearchInput.fill(filters.search);
      needsWait = true;
    }
    if (filters.category) {
      await this.customerCategorySelect.selectOption(filters.category);
      needsWait = true;
    }
    if (filters.sort) {
      await this.customerSortSelect.selectOption(filters.sort);
      needsWait = true;
    }
    if (typeof filters.inStock === 'boolean') {
      await (filters.inStock ? this.inStockCheckbox.check() : this.inStockCheckbox.uncheck());
      needsWait = true;
    }

    // Wait for the final API response after all filters are applied.
    if (needsWait) {
      await this.page.waitForResponse(resp => resp.url().includes('/api/products') && resp.status() === 200);
    }
  }
}