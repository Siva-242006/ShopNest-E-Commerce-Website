import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import OrdersPage from './ordersPage';
import { UserContext } from '../../context/UserContext';
import { CartProvider } from '../../context/CartContext';
import { server } from '../../test/mocks/server';
import { API_BASE, mockUserCart } from '../../test/mocks/handlers';

const renderOrdersPage = (role = 'User') => {
  localStorage.setItem('jwt_token', 'mock-valid-token');

  return render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          userId: 'user-123',
          name: 'Test User',
          role,
          email: 'test@example.com',
          username: 'testuser',
          refreshUser: () => {},
        }}
      >
        <CartProvider>
          <OrdersPage />
        </CartProvider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('OrdersPage Component', () => {
  it('renders user orders list with status, total amount, and items', async () => {
    renderOrdersPage('User');

    expect(screen.getByText(/loading orders\.\.\./i)).toBeInTheDocument();

    const orderId = await screen.findByText(/order-101/i);
    expect(orderId).toBeInTheDocument();
    expect(screen.getAllByText(/delivered/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/total: rs\. 6,497/i)).toBeInTheDocument();
  });

  it('allows toggling order details', async () => {
    const user = userEvent.setup();
    renderOrdersPage('User');

    await screen.findByText(/order-101/i);

    const toggleBtn = screen.getByRole('button', { name: /view details/i });
    await user.click(toggleBtn);

    expect(await screen.findByText(/delivery address/i)).toBeInTheDocument();
    expect(screen.getByText(/9876543210/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /hide details/i }),
    ).toBeInTheDocument();
  });

  it('renders empty orders state when no orders are found', async () => {
    server.use(
      http.get(`${API_BASE}/orders/my-orders`, () => {
        return HttpResponse.json([]);
      }),
    );

    renderOrdersPage('User');

    expect(await screen.findByText(/no orders found\./i)).toBeInTheDocument();
  });

  it('fetches admin orders when logged in as Admin', async () => {
    server.use(
      http.get(`${API_BASE}/admin/orders`, () => {
        return HttpResponse.json([
          {
            _id: 'admin-order-999',
            user: { name: 'Customer Bob', email: 'bob@example.com' },
            items: mockUserCart.items,
            totalAmount: 12000,
            status: 'Pending',
            createdAt: '2026-03-02T10:00:00.000Z',
            shippingAddress: {
              fullName: 'Customer Bob',
              street: 'Market St',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
            },
          },
        ]);
      }),
    );

    renderOrdersPage('Admin');

    const adminOrderId = await screen.findByText(/admin-order-999/i);
    expect(adminOrderId).toBeInTheDocument();
    expect(screen.getByText(/bob@example\.com/i)).toBeInTheDocument();
    expect(screen.getByText(/all orders/i)).toBeInTheDocument();
  });

  it('handles server errors gracefully and shows empty state', async () => {
    server.use(
      http.get(`${API_BASE}/orders/my-orders`, () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      }),
    );

    renderOrdersPage('User');

    expect(await screen.findByText(/no orders found\./i)).toBeInTheDocument();
  });
});
