import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import ProductsPage from './products';
import { UserContext } from '../../context/UserContext';
import { CartProvider } from '../../context/CartContext';
import { server } from '../../test/mocks/server';
import { API_BASE } from '../../test/mocks/handlers';

const renderProductsPage = (role = 'User') => {
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
          <ProductsPage />
        </CartProvider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('Products Component', () => {
  it('displays loading state initially and then renders fetched products', async () => {
    renderProductsPage();

    expect(screen.getByText(/loading products\.\.\./i)).toBeInTheDocument();

    const productTitle = await screen.findByText(
      'Wireless Bluetooth Headphones',
    );
    expect(productTitle).toBeInTheDocument();
    expect(screen.getByText('Casual Cotton T-Shirt')).toBeInTheDocument();
  });

  it('filters products correctly when user searches by term', async () => {
    const user = userEvent.setup();
    renderProductsPage();

    await screen.findByText('Wireless Bluetooth Headphones');

    const searchInput = screen.getByPlaceholderText(/search by name\.\.\./i);
    await user.type(searchInput, 'Headphones');

    expect(
      screen.getByText('Wireless Bluetooth Headphones'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Casual Cotton T-Shirt')).not.toBeInTheDocument();
  });

  it('filters products correctly when user selects a category', async () => {
    const user = userEvent.setup();
    renderProductsPage();

    await screen.findByText('Wireless Bluetooth Headphones');

    const categorySelect = screen.getByDisplayValue(/all categories/i);
    await user.selectOptions(categorySelect, 'Clothing');

    expect(screen.getByText('Casual Cotton T-Shirt')).toBeInTheDocument();
    expect(
      screen.queryByText('Wireless Bluetooth Headphones'),
    ).not.toBeInTheDocument();
  });

  it('displays error state when products API call fails', async () => {
    server.use(
      http.get(`${API_BASE}/products`, () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      }),
    );

    renderProductsPage();

    const errorMsg = await screen.findByText(/failed to fetch products/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('displays admin actions (Add Product button) when logged in as Admin', async () => {
    renderProductsPage('Admin');

    await screen.findByText('Wireless Bluetooth Headphones');

    expect(
      screen.getByRole('button', { name: /\+ add new product/i }),
    ).toBeInTheDocument();
  });

  it('does NOT display admin Add Product button for normal User', async () => {
    renderProductsPage('User');

    await screen.findByText('Wireless Bluetooth Headphones');

    expect(
      screen.queryByRole('button', { name: /\+ add new product/i }),
    ).not.toBeInTheDocument();
  });
});
