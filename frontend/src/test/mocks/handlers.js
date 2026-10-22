import { http, HttpResponse } from 'msw';

export const API_BASE = 'http://localhost:5000';

export const mockProducts = [
  {
    _id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description: 'High quality noise cancelling headphones with bass boost',
    price: 2999,
    category: 'Electronics',
    brand: 'AudioTech',
    image: 'https://example.com/headphones.jpg',
    stock: 10,
    avgRating: 4.8,
    reviews: [
      {
        _id: 'rev-1',
        name: 'Jane Doe',
        rating: 5,
        comment: 'Excellent sound quality!',
        createdAt: '2026-01-01',
      },
    ],
  },
  {
    _id: 'prod-2',
    name: 'Casual Cotton T-Shirt',
    description: 'Comfortable everyday cotton t-shirt',
    price: 499,
    category: 'Clothing',
    brand: 'UrbanStyle',
    image: 'https://example.com/tshirt.jpg',
    stock: 5,
    avgRating: 4.2,
    reviews: [],
  },
  {
    _id: 'prod-3',
    name: 'Out of Stock Coffee Mug',
    description: 'Ceramic coffee mug',
    price: 249,
    category: 'Home & Kitchen',
    brand: 'HomeCrafters',
    image: 'https://example.com/mug.jpg',
    stock: 0,
    avgRating: 3.9,
    reviews: [],
  },
];

export const mockUserCart = {
  items: [
    {
      product: mockProducts[0],
      quantity: 2,
    },
    {
      product: mockProducts[1],
      quantity: 1,
    },
  ],
};

export const handlers = [
  // Authentication
  http.post(`${API_BASE}/login`, async ({ request }) => {
    const body = await request.json();
    if (body.username === 'testuser' && body.password === 'password123') {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(
        JSON.stringify({
          id: 'user-123',
          name: 'Test User',
          username: 'testuser',
          role: 'User',
          email: 'testuser@example.com',
        }),
      );
      return HttpResponse.json({
        token: `${header}.${payload}.sig`,
      });
    }
    return HttpResponse.json({ msg: 'Invalid credentials' }, { status: 400 });
  }),

  http.post(`${API_BASE}/signup`, async ({ request }) => {
    const body = await request.json();
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { msg: 'Email already exists' },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      { msg: 'User registered successfully' },
      { status: 201 },
    );
  }),

  // Products
  http.get(`${API_BASE}/products`, () => {
    return HttpResponse.json(mockProducts);
  }),

  http.get(`${API_BASE}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p._id === params.id);
    if (product) {
      return HttpResponse.json(product);
    }
    return HttpResponse.json({ message: 'Product not found' }, { status: 404 });
  }),

  http.delete(`${API_BASE}/products/delete/:id`, ({ params }) => {
    return HttpResponse.json({
      message: `Product ${params.id} deleted successfully`,
    });
  }),

  // Cart
  http.get(`${API_BASE}/cart/:userId`, () => {
    return HttpResponse.json(mockUserCart);
  }),

  http.post(`${API_BASE}/cart/add`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: 'Item added to cart',
      item: body,
    });
  }),

  http.put(`${API_BASE}/cart/update`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: 'Cart updated',
      item: body,
    });
  }),

  http.delete(`${API_BASE}/cart/:userId/:productId`, () => {
    return HttpResponse.json({ message: 'Item removed from cart' });
  }),

  http.delete(`${API_BASE}/cart/:userId`, () => {
    return HttpResponse.json({ message: 'Cart cleared successfully' });
  }),

  // Orders
  http.get(`${API_BASE}/orders/my-orders`, () => {
    return HttpResponse.json([
      {
        _id: 'order-101',
        items: mockUserCart.items,
        totalAmount: 6497,
        status: 'Delivered',
        createdAt: '2026-03-01T10:00:00.000Z',
        shippingAddress: {
          fullName: 'Test User',
          phone: '9876543210',
          street: '123 Main St',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          country: 'India',
        },
      },
    ]);
  }),

  http.post(`${API_BASE}/orders/add`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: 'Order placed successfully',
      orderId: 'order-102',
      ...body,
    });
  }),

  http.put(`${API_BASE}/orders/:orderId/cancel`, () => {
    return HttpResponse.json({ message: 'Order cancelled successfully' });
  }),

  // Categories
  http.get(`${API_BASE}/categories`, () => {
    return HttpResponse.json([
      { _id: 'cat-1', name: 'Electronics' },
      { _id: 'cat-2', name: 'Clothing' },
      { _id: 'cat-3', name: 'Home & Kitchen' },
    ]);
  }),

  http.post(`${API_BASE}/categories`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { _id: `cat-${Date.now()}`, name: body.name },
      { status: 201 },
    );
  }),

  // Product Admin
  http.post(`${API_BASE}/products/add`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { message: 'Product saved successfully', product: body },
      { status: 201 },
    );
  }),

  http.put(`${API_BASE}/products/update/:id`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: 'Product updated successfully',
      product: body,
    });
  }),

  // Profile / User
  http.put(`${API_BASE}/users/update-password`, async ({ request }) => {
    const body = await request.json();
    if (body.oldPassword === 'wrongpassword') {
      return HttpResponse.json(
        { message: 'Current password incorrect' },
        { status: 400 },
      );
    }
    return HttpResponse.json({ message: 'Password updated successfully!' });
  }),

  // Logs
  http.get(`${API_BASE}/logs`, () => {
    return HttpResponse.json([
      {
        _id: 'log-1',
        timestamp: '2026-03-01T12:00:00.000Z',
        action: 'User Login',
        ip: '192.168.1.1',
        location: { city: 'Mumbai', country: 'India' },
        deviceType: 'Desktop',
        browser: 'Chrome',
        os: 'Windows 11',
      },
      {
        _id: 'log-2',
        timestamp: '2026-03-01T12:05:00.000Z',
        action: 'Viewed Product',
        ip: '192.168.1.1',
        location: { city: 'Mumbai', country: 'India' },
        deviceType: 'Desktop',
        browser: 'Chrome',
        os: 'Windows 11',
      },
    ]);
  }),

  http.delete(`${API_BASE}/logs`, () => {
    return HttpResponse.json({ message: 'All logs deleted successfully!' });
  }),
];
