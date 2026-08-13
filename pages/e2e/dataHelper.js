/**
 * Generates a unique product object with dynamic data.
 * @returns {{name: string, slug: string, sku: string, price: number, quantity: number, category: string, description: string, images: string[], isActive: boolean}}
 */
export function generateDynamicProductData() {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);
  const categories = [
    'Books',
    'Clothing',
    'Electronics',
    'Home & Kitchen',
    'Sports & Outdoors',
    

  ];

  return {
    name: `new Product ${timestamp}`,
    slug: `new-product-${timestamp}`,
    sku: `NEW-SKU-${timestamp}`,
    price: Math.floor(Math.random() * (1000 - 100 + 1)) + 100, // Random price between 100 and 1000
    quantity: Math.floor(Math.random() * 100) + 1, // Random quantity between 1 and 100
    category: categories[Math.floor(Math.random() * categories.length)],
    description: `This is an auto-generated description for product #${randomNum}.`,
    images: [`https://picsum.photos/seed/${timestamp}/400/300`], // Generate a dynamic image URL
    // isActive: Math.random() > 0.5, // Randomly active or inactive
    isActive: true, // Set isActive to true for testing purposes
  };
}

/**
 * Generates a dynamic shipping address object.
 * @returns {{address: string, city: string, postalCode: string, country: string}}
 */
export function generateDynamicShippingData() {
  return {
    address: `${Math.floor(Math.random() * 999) + 1} Test Street`,
    city: 'Testville',
    postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
    country: 'Testland',
  };
}