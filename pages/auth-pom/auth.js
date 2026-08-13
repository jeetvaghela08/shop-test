const { expect } = require('@playwright/test');

class signupPage {

    async url() {

        await this.page.goto('https://shopteststore.netlify.app/');
    }

    constructor(page) {
        this.page = page;
        // locators
        this.signUpLink = page.locator('a:has-text("Sign Up")');
        this.firstNameInput = page.locator('input[name="firstName"]');
        this.lastNameInput = page.locator('input[name="lastName"]');
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
        this.signUpButton = page.locator('button:has-text("Sign Up")');
    }
    async signupUrl() {

        await this.page.goto('https://shopteststore.netlify.app/register');
       
    }

    async navigateToSignUpPage() {
        await this.signUpLink.click();
    }
}


class loginPage {


    constructor(page) {
        this.page = page;
        // Locators
        this.usernameInput = page.locator('input[id="username"], input[type="email"], input[placeholder*="Username"]');
        this.loginBtn = page.getByTestId('nav-login');
        this.passwordInput = page.locator('input[id="password"], input[type="password"]');
        this.loginButton = page.getByTestId('login-submit');
        this.errorMessage = page.locator('.error-message, [role="alert"], .alert-danger');
        this.logoutBtn = this.page.getByRole('button', { name: 'Logout' });
    }

    /** Navigates to the login page of the store.*/
    async navigate() {
        await this.page.goto('https://shopteststore.netlify.app/');
   
    }
 async login(username, password) {

  await this.loginBtn.waitFor({ state: 'visible', timeout: 60_000 });

  // If already logged in, logout first
  if (await this.logoutBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await this.logoutBtn.click();
    await this.loginBtn.waitFor({ state: 'visible', timeout: 60_000 });
  }

  await this.loginBtn.click();
  await this.usernameInput.waitFor({ state: 'visible', timeout: 60_000 });
  await this.usernameInput.fill(username);
  await this.passwordInput.waitFor({ state: 'visible', timeout: 60_000 });
  await this.passwordInput.fill(password);
  await this.loginButton.waitFor({ state: 'visible', timeout: 60_000 });
  await this.loginButton.click();

  await this.page.waitForFunction(() => {
    const token = window.localStorage.getItem('shop_access_token') || window.localStorage.getItem('shop_refresh_token');
    const logoutVisible = document.body.innerText.match(/logout/i);
    return Boolean(token || logoutVisible);
  }, { timeout: 60_000 });

  await this.logoutBtn.waitFor({ state: 'visible', timeout: 60_000 }).catch(() => null);
}
        
async fillAdminCredentials() {
                this.admin = this.page.getByTestId('login-quickfill-admin');
                this.loginBtn = this.page.getByTestId('nav-login');
                await this.loginBtn.click();
                await this.admin.click();
                await this.loginButton.click();
            }
            
        }

    

module.exports = { signupPage, loginPage };

// ============ Customer/Shop Page Class ============
// class shopPage {
//     constructor(page) {
//         this.page = page;
        
//         // Product listing selectors
//         this.productSearchInput = page.locator('input[placeholder*="Search" i]')
//             .or(page.locator('[data-testid="product-search"]'))
//             .or(page.locator('input[type="search"]'))
        
//         this.productItems = page.locator('[data-testid="product-item"], .product-card, .product-row, .product-list-item')
        
//         this.productName = (name) => page.locator(`text="${name}"`).first()
//         this.productPrice = (price) => page.locator(`text="${price}"`).first()
        
//         this.addToCartButton = page.getByRole('button', { name: /add to cart|add|buy/i })
//         this.cartIcon = page.getByTestId('nav-cart')
//     }
    
//     async navigateToShop() {
//         await this.page.goto('https://shopteststore.netlify.app/products');
//         await this.page.waitForLoadState('networkidle');
//     }
    
//     async navigateHome() {
//         await this.page.goto('https://shopteststore.netlify.app/');
//         await this.page.waitForLoadState('networkidle');
//     }
    
//     async searchProduct(productName) {
//         try {
//             const searchInput = this.productSearchInput.first();
            
//             if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
//                 await searchInput.clear();
//                 await searchInput.fill(productName);
//                 await this.page.keyboard.press('Enter');
//                 await this.page.waitForLoadState('networkidle');
//                 await this.page.waitForTimeout(1000);
//                 return true;
//             }
//             return false;
//         } catch (error) {
//             console.error('Error searching product:', error.message);
//             throw error;
//         }
//     }
    
//     async findProductByName(productName) {
//         try {
//             const productElement = this.productName(productName);
//             await productElement.waitFor({ state: 'visible', timeout: 10000 }).catch(() => false);
//             return await productElement.isVisible({ timeout: 2000 }).catch(() => false);
//         } catch (error) {
//             console.error(`Product "${productName}" not found:`, error.message);
//             return false;
//         }
//     }
    
//     async getProductCount() {
//         try {
//             const count = await this.productItems.count();
//             console.log(`Found ${count} products on page`);
//             return count;
//         } catch (error) {
//             console.error('Error getting product count:', error.message);
//             return 0;
//         }
//     }
    
//     async verifyProductWithDetails(productName, price, description) {
//         try {
//             // Verify product name
//             const nameElement = this.productName(productName);
//             const nameVisible = await nameElement.isVisible({ timeout: 5000 }).catch(() => false);
            
//             if (!nameVisible) {
//                 return false;
//             }
            
//             // Verify price if provided
//             if (price) {
//                 const priceElement = this.productPrice(price);
//                 const priceVisible = await priceElement.isVisible({ timeout: 5000 }).catch(() => false);
//                 if (!priceVisible) {
//                     console.warn(`Price "${price}" not found for product`);
//                     return false;
//                 }
//             }
            
//             return true;
//         } catch (error) {
//             console.error('Error verifying product details:', error.message);
//             return false;
//         }
//     }
// }

// module.exports = { signupPage, loginPage, /* shopPage */ };