import { render, screen, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { CartProvider, useCart } from './CartContext';
import { UserContext } from './UserContext';
import { server } from '../test/mocks/server';
import { API_BASE } from '../test/mocks/handlers';

const TestCartComponent = () => {
  const { cartItems, cartCount, clearCart, fetchCart } = useCart();

  return (
    <div>
      <div data-testid="cart-count">{cartCount}</div>
      <div data-testid="items-length">{cartItems.length}</div>
      <button onClick={fetchCart}>Fetch Cart</button>
      <button onClick={clearCart}>Clear Cart</button>
      <ul>
        {cartItems.map((item) => (
          <li key={item.product._id} data-testid={`item-${item.product._id}`}>
            {item.product.name} - Qty: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
};

const renderWithUser = (userId = 'user-123') => {
  return render(
    <UserContext.Provider
      value={{
        userId,
        name: 'Test User',
        role: 'User',
        email: 'test@example.com',
        username: 'test',
        refreshUser: () => {},
      }}
    >
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    </UserContext.Provider>,
  );
};

describe('CartContext', () => {
  it('initializes with 0 items if no userId is logged in', () => {
    renderWithUser('');

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('automatically fetches cart on mount when userId is present', async () => {
    renderWithUser('user-123');

    // Wait for MSW response
    const headphonesItem = await screen.findByTestId('item-prod-1');
    expect(headphonesItem).toHaveTextContent(
      'Wireless Bluetooth Headphones - Qty: 2',
    );
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');
    expect(screen.getByTestId('items-length')).toHaveTextContent('2');
  });

  it('resets cartItems and cartCount to 0 when clearCart is executed', async () => {
    renderWithUser('user-123');

    // Ensure cart was loaded first
    await screen.findByTestId('item-prod-1');
    expect(screen.getByTestId('cart-count')).toHaveTextContent('2');

    // Trigger clearCart
    await act(async () => {
      screen.getByRole('button', { name: /clear cart/i }).click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('items-length')).toHaveTextContent('0');
  });

  it('handles cart API failure gracefully without crashing', async () => {
    server.use(
      http.get(`${API_BASE}/cart/:userId`, () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      }),
    );

    renderWithUser('user-123');

    // Cart items should remain empty on error
    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });
});
