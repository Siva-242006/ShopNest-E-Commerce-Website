import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { UserProvider } from './context/UserContext';
import { CartProvider } from './context/CartContext';

describe('ShopNest App Routing', () => {
  it('redirects unauthenticated user accessing root to /login', () => {
    localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/']}>
        <UserProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </UserProvider>
      </MemoryRouter>,
    );

    // Verify login page elements are shown because user is not authenticated
    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your username/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i),
    ).toBeInTheDocument();
  });

  it('renders NotFound component on unknown route', () => {
    render(
      <MemoryRouter initialEntries={['/some-unknown-random-route']}>
        <UserProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </UserProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
