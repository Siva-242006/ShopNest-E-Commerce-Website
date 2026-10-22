/**
 * Shared mock data & API helpers for Playwright E2E tests
 */

export const mockUser = {
  id: 'user-e2e-1',
  name: 'Test Customer',
  role: 'User',
  email: 'customer@shopnest.com',
  username: 'customer',
};

export const mockAdmin = {
  id: 'admin-e2e-1',
  name: 'Store Admin',
  role: 'Admin',
  email: 'admin@shopnest.com',
  username: 'admin',
};

export const createMockToken = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(user));
  return `${header}.${payload}.mock-signature`;
};

export const initialProducts = [
  {
    _id: 'prod-101',
    name: 'Wireless Noise Cancelling Headphones',
    description: 'Premium over-ear wireless headphones with ANC.',
    price: 3499,
    category: 'Electronics',
    brand: 'SoundMaster',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    stock: 12,
    avgRating: 4.8,
    reviews: [],
  },
  {
    _id: 'prod-102',
    name: 'Classic Organic Cotton Hoodie',
    description: 'Super soft hoodie made of 100% organic cotton.',
    price: 1299,
    category: 'Clothing',
    brand: 'EcoWear',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300',
    stock: 8,
    avgRating: 4.5,
    reviews: [],
  },
];

const API_BASE = 'http://localhost:5000';

export const setupE2EApiMocks = async (page, options = {}) => {
  const {
    currentUser = mockUser,
    products = [...initialProducts],
    initialCart = [
      {
        product: initialProducts[0],
        quantity: 1,
      },
    ],
  } = options;

  let currentProducts = [...products];
  let currentCart = [...initialCart];
  const userOrders = [];

  // Auto-accept window alert and confirm dialogs
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  // Intercept ONLY backend API calls on port 5000, never frontend HTML pages on 3000
  await page.route(`${API_BASE}/**`, async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    // 1. Auth: /login
    if (url.includes('/login') && method === 'POST') {
      const postData = JSON.parse(request.postData() || '{}');
      const isAdmin =
        postData.username === 'admin' || postData.role === 'Admin';
      const user = isAdmin ? mockAdmin : currentUser;
      const token = createMockToken(user);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token }),
      });
    }

    // 2. Categories: /categories
    if (url.includes('/categories') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { _id: 'cat-1', name: 'Electronics' },
          { _id: 'cat-2', name: 'Clothing' },
        ]),
      });
    }

    // 3. Admin / Products: Add
    if (url.includes('/products/add') && method === 'POST') {
      const newProd = JSON.parse(request.postData() || '{}');
      const created = {
        _id: `prod-${Date.now()}`,
        avgRating: 5.0,
        reviews: [],
        ...newProd,
      };
      currentProducts.push(created);
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Product saved successfully',
          product: created,
        }),
      });
    }

    // 4. Products: Delete
    if (url.includes('/products/delete/') && method === 'DELETE') {
      const id = url.split('/').pop();
      currentProducts = currentProducts.filter((p) => p._id !== id);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Product deleted successfully' }),
      });
    }

    // 5. Products: Single product details
    const singleProdMatch = url.match(/\/products\/(prod-[^/?#]+)/);
    if (singleProdMatch && method === 'GET') {
      const id = singleProdMatch[1];
      const prod = currentProducts.find((p) => p._id === id);
      if (prod) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(prod),
        });
      }
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Product not found' }),
      });
    }

    // 6. Products: List
    if (
      (url.endsWith('/products') || url.includes('/products?')) &&
      method === 'GET'
    ) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentProducts),
      });
    }

    // 7. Cart: Operations
    if (url.includes('/cart/add') && method === 'POST') {
      const body = JSON.parse(request.postData() || '{}');
      const prod =
        currentProducts.find((p) => p._id === body.productId) ||
        initialProducts[0];
      const existing = currentCart.find((i) => i.product._id === prod._id);
      if (existing) {
        existing.quantity += body.quantity || 1;
      } else {
        currentCart.push({ product: prod, quantity: body.quantity || 1 });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Item added to cart' }),
      });
    }

    if (url.includes('/cart') && method === 'DELETE') {
      currentCart = [];
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Cart cleared' }),
      });
    }

    if (url.includes('/cart/') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: currentCart }),
      });
    }

    // 8. Orders: Operations
    if (url.includes('/orders/add') && method === 'POST') {
      const orderData = JSON.parse(request.postData() || '{}');
      const createdOrder = {
        _id: `ord-${Date.now()}`,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        ...orderData,
      };
      userOrders.push(createdOrder);
      currentCart = [];
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Order placed successfully',
          order: createdOrder,
        }),
      });
    }

    if (url.includes('/orders/my-orders') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(userOrders),
      });
    }

    if (url.includes('/admin/orders') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(userOrders),
      });
    }

    // Default fallback for any other API request
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'OK' }),
    });
  });
};
