import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductsItem from './ProductsItem';
import { UserContext } from '../../context/UserContext';
import { CartContext } from '../../context/CartContext';
import { vi } from 'vitest';

const renderProductsItem = (productId = 'prod-1', cartCount = 0) => {
  localStorage.setItem('jwt_token', 'mock-valid-token');
  const mockFetchCart = vi.fn();

  render(
    <MemoryRouter initialEntries={[`/products/${productId}`]}>
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
            cartItems: [],
            cartCount,
            setCartCount: vi.fn(),
            fetchCart: mockFetchCart,
            clearCart: vi.fn(),
          }}
        >
          <Routes>
            <Route path="/products/:id" element={<ProductsItem />} />
          </Routes>
        </CartContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  );

  return { mockFetchCart };
};

describe('ProductsItem Component', () => {
  it('renders product details: name, brand, category, price, and stock count', async () => {
    renderProductsItem('prod-1');

    expect(
      await screen.findByRole('heading', {
        name: 'Wireless Bluetooth Headphones',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('AudioTech')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText(/rs\.\s*2999/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // Stock is 10
    expect(
      screen.getByText(
        'High quality noise cancelling headphones with bass boost',
      ),
    ).toBeInTheDocument();
  });

  it('increments and decrements quantity within available stock limits', async () => {
    const user = userEvent.setup();
    renderProductsItem('prod-1');

    await screen.findByText('Wireless Bluetooth Headphones');

    const incrementButton = screen.getByRole('button', { name: '+' });
    const decrementButton = screen.getByRole('button', { name: '-' });
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();

    await user.click(incrementButton);
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();

    await user.click(incrementButton);
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();

    await user.click(decrementButton);
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('triggers add to cart API call and updates cart when clicked', async () => {
    const user = userEvent.setup();
    const { mockFetchCart } = renderProductsItem('prod-1');

    await screen.findByText('Wireless Bluetooth Headphones');

    const addToCartButton = screen.getByRole('button', {
      name: /add to cart/i,
    });
    await user.click(addToCartButton);

    expect(mockFetchCart).toHaveBeenCalled();
  });

  it('displays out-of-stock badge and alert if stock is 0', async () => {
    const user = userEvent.setup();
    renderProductsItem('prod-3'); // Out of stock product in mock (stock: 0)

    await screen.findByText('Out of Stock Coffee Mug');
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);

    const addToCartButton = screen.getByRole('button', {
      name: /add to cart/i,
    });
    await user.click(addToCartButton);

    expect(window.alert).toHaveBeenCalledWith(
      'Sorry, this product is out of stock.',
    );
  });
});
