import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './navbar';
import { UserContext } from '../../context/UserContext';
import { CartContext } from '../../context/CartContext';

const renderNavbar = ({
  role = 'User',
  cartCount = 3,
  token = 'mock-jwt-token',
} = {}) => {
  if (token) {
    localStorage.setItem('jwt_token', token);
  } else {
    localStorage.removeItem('jwt_token');
  }

  return render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          userId: 'user-123',
          name: 'Test Customer',
          role,
          email: 'test@example.com',
          username: 'testuser',
          refreshUser: () => {},
        }}
      >
        <CartContext.Provider
          value={{
            cartItems: [],
            cartCount,
            setCartCount: () => {},
            fetchCart: () => {},
            clearCart: () => {},
          }}
        >
          <Navbar />
        </CartContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('Navbar Component', () => {
  it('renders brand and navigation links for regular User', () => {
    renderNavbar({ role: 'User', cartCount: 4 });

    expect(screen.getByRole('link', { name: 'ShopNest' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(screen.getByRole('link', { name: /cart 4/i })).toHaveAttribute(
      'href',
      '/cart',
    );
    expect(screen.getByRole('link', { name: 'My Orders' })).toHaveAttribute(
      'href',
      '/orders',
    );
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'href',
      '/profile',
    );

    // Admin links should not be visible for User
    expect(
      screen.queryByRole('link', { name: 'Logs' }),
    ).not.toBeInTheDocument();
  });

  it('renders admin specific navigation links (Orders, Logs) for Admin', () => {
    renderNavbar({ role: 'Admin' });

    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute(
      'href',
      '/orders',
    );
    expect(screen.getByRole('link', { name: 'Logs' })).toHaveAttribute(
      'href',
      '/logs',
    );
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();

    // User cart link should not be visible for Admin
    expect(
      screen.queryByRole('link', { name: /cart/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'My Orders' }),
    ).not.toBeInTheDocument();
  });

  it('toggles mobile menu on toggle button click', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const toggleBtn = screen.getByRole('button', {
      name: /open navigation menu/i,
    });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleBtn);
    expect(
      screen.getByRole('button', { name: /close navigation menu/i }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('removes jwt_token from localStorage and closes menu on logout', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const logoutBtn = screen.getByRole('button', { name: /logout/i });
    expect(logoutBtn).toBeInTheDocument();

    await user.click(logoutBtn);
    expect(localStorage.getItem('jwt_token')).toBeNull();
  });
});
