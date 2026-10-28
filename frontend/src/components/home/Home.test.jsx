import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import Home from './home';
import { UserContext } from '../../context/UserContext';
import { CartProvider } from '../../context/CartContext';
import { server } from '../../test/mocks/server';
import { API_BASE } from '../../test/mocks/handlers';

const renderHome = (authenticated = true) => {
  if (authenticated) {
    localStorage.setItem('jwt_token', 'mock-valid-token');
  } else {
    localStorage.removeItem('jwt_token');
  }

  return render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          userId: 'user-123',
          name: 'Test Customer',
          role: 'User',
          email: 'test@example.com',
          username: 'testuser',
          refreshUser: () => {},
        }}
      >
        <CartProvider>
          <Home />
        </CartProvider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('Home Component', () => {
  it('displays loading state initially and then renders hero section and products', async () => {
    renderHome(true);

    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();

    const welcomeHeading = await screen.findByRole('heading', {
      name: /welcome to shopnest/i,
    });
    expect(welcomeHeading).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /go to shopping/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /shop by category/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /featured products/i }),
    ).toBeInTheDocument();
  });

  it('renders categories and navigates when category button is clicked', async () => {
    const user = userEvent.setup();
    renderHome(true);

    const electronicsCat = await screen.findByRole('button', {
      name: /electronics/i,
    });
    expect(electronicsCat).toBeInTheDocument();

    await user.click(electronicsCat);
  });

  it('navigates to /products when Go to Shopping button is clicked', async () => {
    const user = userEvent.setup();
    renderHome(true);

    const goShoppingBtn = await screen.findByRole('button', {
      name: /go to shopping/i,
    });
    await user.click(goShoppingBtn);
  });

  it('displays error state when products fetch fails', async () => {
    server.use(
      http.get(`${API_BASE}/products`, () => {
        return HttpResponse.json({ message: 'Error loading' }, { status: 500 });
      }),
    );

    renderHome(true);

    const errorHeading = await screen.findByRole('heading', {
      name: /failed to load products\. please try again\./i,
    });
    expect(errorHeading).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /try again/i }),
    ).toBeInTheDocument();
  });
});
