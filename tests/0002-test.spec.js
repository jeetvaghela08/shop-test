import { test, expect } from '../fixtures/testFixtures.js';
import { ProductPage } from '../pages/e2e/ProductPage.js';
import { DashboardPage } from '../pages/e2e/DashboardPage.js';
import costomerPage from '../pages/custmare.js';
import mainhome from '../pages/homepage.js';
import dotenv from 'dotenv';
dotenv.config();


test.describe('Product E2E Tests', () => {

  test.describe.configure({ mode: 'serial' });

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

  await adminPage.goto(process.env.SELLER_URL);

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

  await customerPage.goto(process.env.CUSTOMER_URL);
  await customerDashboardPage.navigateToProductManagement();

  await customerDashboardPage.searchForProduct(product.name);
await customerHomePage.clickOnProductImage(product.name);

  // =====================================================
  // PRODUCT DETAIL
  // =====================================================


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


test('Admin adds product and Customer verifies product', async ({
  browser,
  testData,
}) => {
//ADMIN - custmor2
  const { product } = testData;

  // =====================================================
  // ADMIN
  // =====================================================

  const adminContext = await browser.newContext({
    storageState: '.auth/admin.json',
  });

  const adminPage = await adminContext.newPage();

  // ProductPage -> Admin Page
  const adminProductPage = new ProductPage(adminPage);

  await adminPage.goto(process.env.ADMIN_URL);

  await adminProductPage.clickAddProduct();
  await adminProductPage.createNewProduct(product);
  await adminProductPage.verifyProductIsVisible(product.name);


  // =====================================================
  // CUSTOMER
  // =====================================================

  const customerContext = await browser.newContext({
    storageState: '.auth/customer2.json',
  });

  const customerPage = await customerContext.newPage();

  // DashboardPage -> Customer Page
  const customerDashboardPage = new DashboardPage(customerPage);

  // Homepage -> Customer Page
  const customerHomePage = new costomerPage(customerPage);

  await customerPage.goto(process.env.CUSTOMER_URL);

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
  // ADD TO CART
  // =====================================================

   await customerHomePage.clickAddToCartCUSTOMER();


  await adminContext.close();
  await customerContext.close();

});

 
});