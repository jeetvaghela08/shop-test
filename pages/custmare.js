const { expect } = require('@playwright/test');

class costomerPage {


  



    constructor(page) {
        this.page = page;



        // nev Locators
        this.logoLink = page.getByRole('link', { name: '🛒 ShopTest' });
        this.productsNav = page.getByTestId('nav-link-products');
        this.cartNav = page.getByTestId('nav-cart');
        this.loginNav = page.getByTestId('nav-login');
        this.signUpNav = page.getByTestId('nav-signup');
        this.productsHeading = page.getByRole('heading', { name: 'Products' });

        // Add more locators as needed
        this.addToCartButton = page.getByTestId('product-card-add-to-cart');
        this.loginRequiredMessage = page.getByText('Please log in to add items to your cart');
        this.productImageLink = page.getByTestId('product-card-image-link');
        this.addToCartButtoninProductDetail = page.getByTestId('add-to-cart-button');

        //sharch
        this.customerSearchInput = page.getByTestId('product-search-input');

        //in 1 product detail page
        this.productDetailHeading = page.getByTestId('product-title')
        this.productDetailDescription = page.getByTestId('product-description')
        this.productDetailPrice = page.getByTestId('product-price')
        this.productDetailAddToCartButton = page.getByTestId('product-add-to-cart')
        this.productDetailImage = page.getByRole('img', { name: 'Mechanical Keyboard RGB' })

        this.productDetailBackButton = page.getByTestId('product-detail').getByRole('link', { name: 'Products' })
        this.productDetailReviewsSection = page.getByText('Charlie Customer')


        // Wishlist button
        this.productDetailWishlistButton = page.getByTestId('product-add-to-wishlist');
        this.wishlistPageHeading = page.getByTestId('nav-link-wishlist');

        //login page heading 
        this.loginPageHeading = page.getByRole('heading', { name: 'Log in' })



        // custmare locetors e2e 
        this.productDetailImagee2e = page.getByRole('img', { name: 'new Product' })
    
        this.wishlistMoveToCartButton = page.getByTestId('wishlist-move-to-cart').first();
     this.gotocartButton = page.getByTestId('nav-cart');
    this.cartPageTitle = page.getByTestId('page-title')
    
    }

    // =====================================================
    // CUSTOMER login and verify product detail page
    // =====================================================
   async clickOnProductImage(productName) {

    const productCard = this.page
        .getByTestId('product-card')
        .filter({ hasText: productName });

    await expect(productCard).toBeVisible({
        timeout: 10000
    });

    await productCard
        .getByTestId('product-card-image-link')
        .click();
}

 async verifyProductDetailPagee2e(
    productName,
    productDescription,
    productPrice,
    productCategory
) {
    // Wait for Product Detail Page
    await expect(this.productDetailHeading).toBeVisible();

    // Verify Product Name
    await expect(this.productDetailHeading).toHaveText(productName);

    // Verify Product Description
    await expect(this.productDetailDescription).toBeVisible();
    await expect(this.productDetailDescription).toHaveText(productDescription);

    // Verify Product Price
    await expect(this.productDetailPrice).toBeVisible();
    await expect(this.productDetailPrice)
        .toContainText(String(productPrice));

    // Verify Product Image
    await expect(this.productDetailImagee2e).toBeVisible();

    // Verify Category
    if (productCategory) {
        await expect(this.page.getByText(productCategory, { exact: true }))
            .toBeVisible();
    }

    // Verify Add to Cart button
    await expect(this.productDetailAddToCartButton).toBeVisible();

    // Verify Back button
    await expect(this.productDetailBackButton).toBeVisible();
}



async clickAddToCartCUSTOMER() {
    await expect(this.productDetailAddToCartButton).toBeVisible();
    await expect(this.productDetailAddToCartButton).toBeEnabled();

    await this.productDetailAddToCartButton.click();
}

        
    

   async clickWishlistCUSTOMER() {
    await expect(this.productDetailWishlistButton).toBeVisible();

    await Promise.all([
        this.page.waitForResponse(response =>
            response.url().includes('/api/wishlist') &&
            response.ok()
        ),
        this.productDetailWishlistButton.click()
    ]);
}
    
async verifyProductAddedToWishlist(productName) {
    await expect(
        this.page.getByRole('heading', {
            name: 'Wishlist'
        })
    ).toBeVisible();

    const wishlistProduct = this.page
        .getByTestId('wishlist-item-name')
        .filter({ hasText: productName });

    await expect(wishlistProduct).toBeVisible({
        timeout: 10000
    });
}
    
    async gotoWishlistPage() {
        await this.wishlistPageHeading.click();
        // await this.wishlistPageHeading.waitFor({ state: 'visible' });
        // await this.productImageLink.first().click();
        // await expect(this.productDetailWishlistButton).toBeVisible();
    }
       async wishlisinaddToCartButton() {

        await expect(this.wishlistMoveToCartButton).toBeVisible();
        await expect(this.wishlistMoveToCartButton).toBeEnabled();
        await this.wishlistMoveToCartButton.click();
       
    }
    async cartButton() {
        await expect(this.gotocartButton).toBeVisible();
        await expect(this.gotocartButton).toBeEnabled();
        await this.gotocartButton.click();
}

    
    async verifyProductAddedToCart(productName) {
        await expect(this.cartPageTitle).toBeVisible();

    await expect(
        this.page.getByRole('heading', {
            name: 'Your cart'
        })
    ).toBeVisible();

    const cartProduct = this.page
        .getByTestId('cart-item-name')
        .filter({ hasText: productName });

    await expect(cartProduct).toBeVisible({
        timeout: 10000
    });
}
}

module.exports = costomerPage;