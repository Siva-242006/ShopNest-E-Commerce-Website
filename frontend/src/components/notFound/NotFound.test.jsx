import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './notFound';
import { UserContext } from '../../context/UserContext';
import { CartProvider } from '../../context/CartContext';

const renderNotFound = () => {
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
          <NotFound />
        </CartProvider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('NotFound Component', () => {
  it('renders 404 error code and Page Not Found heading', () => {
    renderNotFound();

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the page you are looking for does not exist/i),
    ).toBeInTheDocument();
  });

  it('renders navigation buttons: Go Home and Browse Products', async () => {
    const user = userEvent.setup();
    renderNotFound();

    const homeButton = screen.getByRole('button', { name: /go home/i });
    const browseButton = screen.getByRole('button', {
      name: /browse products/i,
    });

    expect(homeButton).toBeInTheDocument();
    expect(browseButton).toBeInTheDocument();

    await user.click(homeButton);
    await user.click(browseButton);
  });
});
