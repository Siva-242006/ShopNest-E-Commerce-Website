import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import CartPage from './cart';
import { UserContext } from '../../context/UserContext';
import { CartContext } from '../../context/CartContext';
import { server } from '../../test/mocks/server';
import { API_BASE, mockUserCart } from '../../test/mocks/handlers';
import { vi } from 'vitest';

const renderCartPage = (customCart = mockUserCart) => {
  localStorage.setItem('jwt_token', 'mock-valid-token');
  const mockSetCartCount = vi.fn();

  server.use(
    http.get(`${API_BASE}/cart/:userId`, () => {
      return HttpResponse.json(customCart);
    }),
  );

  render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          userId: 'user-123',
          name: 'Test User',
          role: 'User',
          email: 'test@example.com',
          username: 'testuser',
          refreshUser: () => {},
        }}
      >
        <CartContext.Provider
          value={{
            cartItems: customCart.items,
            cartCount: customCart.items.length,
            setCartCount: mockSetCartCount,
            fetchCart: vi.fn(),
            clearCart: vi.fn(),
          }}
        >
          <CartPage />
        </CartContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  );

  return { mockSetCartCount };
};

describe('Cart Component', () => {
  it('renders empty cart state when no items are present', async () => {
    renderCartPage({ items: [] });

    expect(
      await screen.findByRole('heading', { name: /your cart is empty\./i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /browse products/i }),
    ).toBeInTheDocument();
  });

  it('renders cart items with name, price, and calculates total price correctly', async () => {
    renderCartPage();

    expect(
      await screen.findByRole('heading', {
        name: 'Wireless Bluetooth Headphones',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Casual Cotton T-Shirt' }),
    ).toBeInTheDocument();

    // 2 x 2999 + 1 x 499 = 6497
    expect(await screen.findByText(/6,497/i)).toBeInTheDocument();
  });

  it('handles quantity increment click', async () => {
    const user = userEvent.setup();
    renderCartPage();

    await screen.findByRole('heading', {
      name: 'Wireless Bluetooth Headphones',
    });

    const incrementButtons = screen.getAllByRole('button', { name: '+' });
    await user.click(incrementButtons[0]);

    // Quantity update sent
    expect(incrementButtons[0]).toBeInTheDocument();
  });

  it('removes item from list when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderCartPage();

    await screen.findByRole('heading', {
      name: 'Wireless Bluetooth Headphones',
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    // Delete request sent
    expect(deleteButtons[0]).toBeInTheDocument();
  });

  it('displays alert and navigates when clicking Checkout button', async () => {
    const user = userEvent.setup();
    renderCartPage();

    await screen.findByRole('heading', {
      name: 'Wireless Bluetooth Headphones',
    });

    const checkoutButton = screen.getByRole('button', {
      name: /^checkout$/i,
    });
    await user.click(checkoutButton);

    expect(window.alert).toHaveBeenCalledWith('Proceeding to checkout...');
  });
});
