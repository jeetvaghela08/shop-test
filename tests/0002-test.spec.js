import { test, expect } from '../fixtures/testFixtures.js';
import { ProductPage } from '../pages/e2e/ProductPage.js';
import { DashboardPage } from '../pages/e2e/DashboardPage.js';
import costomerPage from '../pages/custmare.js';
import mainhome from '../pages/homepage.js';

test('sell adds product and Customer verifies product', async ({
  browser,
  testData,
}) => {

// SELLER - CUSTOMOR

  const { product } = testData;

  // =====================================================
  // SELLER
  // =====================================================

  const adminContext = await browser.newContext({
    storageState: '.auth/seller.json',
  });

  const adminPage = await adminContext.newPage();

  // ProductPage -> Admin Page
  const adminProductPage = new ProductPage(adminPage);

  await adminPage.goto(
    'https://shopteststore.netlify.app/admin/products'
  );

  await adminProductPage.clickAddProduct();
  await adminProductPage.createNewProduct(product);
  await adminProductPage.verifyProductIsVisible(product.name);


  // =====================================================
  // CUSTOMER
  // =====================================================

  const customerContext = await browser.newContext({
    storageState: '.auth/customer.json',
  });

  const customerPage = await customerContext.newPage();

  // DashboardPage -> Customer Page
  const customerDashboardPage = new DashboardPage(customerPage);

  // Homepage -> Customer Page
  const customerHomePage = new costomerPage(customerPage);

  await customerPage.goto(
    'https://shopteststore.netlify.app/wishlist'
  );

  // Navigate/Search Product
  await customerDashboardPage.navigateToProductManagement();

  await customerDashboardPage.searchForProduct(product.name);


  // =====================================================
  // PRODUCT DETAIL
  // =====================================================

  await customerHomePage.clickOnProductImage();

  await customerHomePage.verifyProductDetailPagee2e(
    product.name,
    product.description,
    product.price,
    product.category
  );



  // =====================================================
  // ADD TO WISHLIST
  // =====================================================

  await customerHomePage.clickWishlistCUSTOMER();
  await customerHomePage.gotoWishlistPage();
  await customerHomePage.verifyProductAddedToWishlist(product.name);
  await customerHomePage.wishlisinaddToCartButton();
  await customerHomePage.cartButton();
  await customerHomePage.verifyProductAddedToCart(product.name);
  // =====================================================
  // ADD TO CART
  // =====================================================

  //  await customerHomePage.clickAddToCartCUSTOMER();


  await adminContext.close();
  await customerContext.close();

});