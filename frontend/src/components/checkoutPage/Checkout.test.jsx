import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import CheckoutPage from './checkoutPage';
import { UserContext } from '../../context/UserContext';
import { CartContext } from '../../context/CartContext';
import { server } from '../../test/mocks/server';
import { API_BASE, mockUserCart } from '../../test/mocks/handlers';
import { vi } from 'vitest';

const renderCheckoutPage = (cartItems = mockUserCart.items) => {
  localStorage.setItem('jwt_token', 'mock-valid-token');
  const mockClearCart = vi.fn();

  const { container } = render(
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
            cartItems,
            cartCount: cartItems.length,
            setCartCount: vi.fn(),
            fetchCart: vi.fn(),
            clearCart: mockClearCart,
          }}
        >
          <CheckoutPage />
        </CartContext.Provider>
      </UserContext.Provider>
    </MemoryRouter>,
  );

  return { container, mockClearCart };
};

const fillAndSaveAddress = async (user, container) => {
  const fullNameInput = container.querySelector('input[name="fullName"]');
  const phoneInput = container.querySelector('input[name="phone"]');
  const streetInput = container.querySelector('input[name="street"]');
  const cityInput = container.querySelector('input[name="city"]');
  const pincodeInput = container.querySelector('input[name="pincode"]');
  const stateSelect = container.querySelector('select[name="state"]');

  fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
  fireEvent.change(phoneInput, { target: { value: '9876543210' } });
  fireEvent.change(streetInput, { target: { value: '42 Tech Park' } });
  fireEvent.change(cityInput, { target: { value: 'Chennai' } });
  fireEvent.change(pincodeInput, { target: { value: '600001' } });
  fireEvent.change(stateSelect, { target: { value: 'Tamil Nadu' } });

  await user.click(screen.getByRole('button', { name: /save address/i }));
};

describe('Checkout Component', () => {
  it('renders delivery address form with required fields', () => {
    const { container } = renderCheckoutPage();

    expect(
      screen.getByRole('heading', { name: /delivery address/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[name="fullName"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('input[name="phone"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="street"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="city"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="state"]')).toBeInTheDocument();
    expect(
      container.querySelector('input[name="pincode"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save address/i }),
    ).toBeInTheDocument();
  });

  it('submits address and displays order review card with Place Order button', async () => {
    const user = userEvent.setup();
    const { container } = renderCheckoutPage();

    await fillAndSaveAddress(user, container);

    // After saving address, Review Order view is rendered
    expect(
      await screen.findByRole('heading', { name: /review order/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Wireless Bluetooth Headphones'),
    ).toBeInTheDocument();
    expect(screen.getByText('Casual Cotton T-Shirt')).toBeInTheDocument();
    expect(screen.getByText(/rs\. 6,497/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /place order/i }),
    ).toBeInTheDocument();
  });

  it('places order successfully, calls clearCart, and displays confirmation', async () => {
    const user = userEvent.setup();
    const { container, mockClearCart } = renderCheckoutPage();

    await fillAndSaveAddress(user, container);

    const placeOrderButton = await screen.findByRole('button', {
      name: /place order/i,
    });
    await user.click(placeOrderButton);

    expect(mockClearCart).toHaveBeenCalled();
    expect(
      await screen.findByRole('heading', {
        name: /order placed successfully/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/your order has been placed/i)).toBeInTheDocument();
  });

  it('handles order API failure gracefully with alert message', async () => {
    server.use(
      http.post(`${API_BASE}/orders/add`, () => {
        return HttpResponse.json({ message: 'Order failure' }, { status: 500 });
      }),
    );

    const user = userEvent.setup();
    const { container } = renderCheckoutPage();

    await fillAndSaveAddress(user, container);

    const placeOrderButton = await screen.findByRole('button', {
      name: /place order/i,
    });
    await user.click(placeOrderButton);

    expect(window.alert).toHaveBeenCalledWith(
      'Something went wrong while placing order.',
    );
  });
});
