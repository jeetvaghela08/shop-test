const { test, expect } = require('../fixtures/home-Fixture');

test('Verify Home Page', async ({ page, homepage }) => {


  await homepage.url();
  await homepage.verifyHomePage();
  await homepage.clickOnProductsNav();
  await homepage.clickOnCartNav();
  await homepage.searchProducts('Mechanical Keyboard RGB');
  await homepage.clickOnProductImage();
  await homepage.verifyProductDetailPage();
  await homepage.clickAddToCart();
  await homepage.clickWishlist();
  const productsGrid = this.page.getByTestId('products-grid');

});