const { expect } = require('@playwright/test');

class mainhome {


    // Navigate to the Home Page with out login //


    async url() {

        await this.page.goto('https://shopteststore.netlify.app/');
    }

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


        //login page heading 
        this.loginPageHeading = page.getByRole('heading', { name: 'Log in' })



        // custmare locetors e2e 
        this.productDetailImagee2e = page.getByRole('img', { name: 'new Product' })
    }

    
    async verifyHomePage() {
        await expect(this.page).toHaveURL('https://shopteststore.netlify.app/');
        await expect(this.logoLink).toBeVisible();
        await expect(this.productsNav).toBeVisible();
        await expect(this.cartNav).toBeVisible();
        await expect(this.loginNav).toBeVisible();
        await expect(this.signUpNav).toBeVisible();
    }

    async clickOnProductsNav() {
        await this.productsNav.click();
        await this.productsHeading.waitFor({ state: 'visible' });
        await expect(this.page.getByTestId('products-grid')).toBeVisible();
        await expect(this.page.getByTestId('product-card').first()).toBeVisible();
    }


    async clickOnCartNav() {

        await this.addToCartButton.first().click();
        await expect(this.loginRequiredMessage).toBeVisible();
    }


    async searchProducts(query) {

        await this.customerSearchInput.fill(query);
        await this.customerSearchInput.press('Enter');



    }
    async clickOnProductImage() {
        await this.productImageLink.first().click();
    }

    async verifyProductDetailPage() {
        // await expect(this.productDetailHeading).toBeVisible();
        await expect(this.productDetailDescription).toBeVisible();
        await expect(this.productDetailPrice).toBeVisible();
        await expect(this.productDetailImage).toBeVisible();
        await expect(this.productDetailAddToCartButton).toBeVisible();
        await expect(this.productDetailBackButton).toBeVisible();


    }

    async clickAddToCart() {
        await expect(this.productDetailAddToCartButton).toBeEnabled();
        await this.productDetailAddToCartButton.click();

        await expect(this.loginPageHeading).toBeVisible();
    }

    async clickWishlist() {
        await this.productsNav.click();
        await this.productsHeading.waitFor({ state: 'visible' });
        await this.productImageLink.first().click();
        await expect(this.productDetailWishlistButton).toBeVisible();
        await this.productDetailWishlistButton.click();
        await expect(this.loginPageHeading).toBeVisible();
    }



    // =====================================================
    // CUSTOMER login and verify product detail page
    // =====================================================


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
        await this.productDetailWishlistButton.click();
    }
}

module.exports = mainhome;