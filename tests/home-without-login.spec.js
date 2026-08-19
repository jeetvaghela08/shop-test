const { test, expect } = require('../fixtures/home-Fixture');

test('Verify Home Page and Unauthenticated User Product Journey', async ({ page, homepage }) => {
  

    await homepage.url();
    await homepage.verifymainnav();
    await homepage.verifyprodactnav();
    await homepage.productUrl();
    await homepage.clickCardAddToCartAndVerifyLoginMessage();
    await homepage.clickOnProductImage();
    await homepage.verifyProductDetailPage();
    await homepage.addtocart();
    await homepage.addWishlist();
    
}); 