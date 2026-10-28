import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import Login from './index';
import { UserProvider } from '../../context/UserContext';
import { server } from '../../test/mocks/server';
import { API_BASE } from '../../test/mocks/handlers';

const renderLogin = () => {
  return render(
    <MemoryRouter>
      <UserProvider>
        <Login />
      </UserProvider>
    </MemoryRouter>,
  );
};

describe('Login Component', () => {
  it('renders login form with username, password, toggle button, and submit button', () => {
    renderLogin();

    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your username/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show password/i }),
    ).toBeInTheDocument();
  });

  it('toggles password visibility when the eye button is clicked', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(
      screen.getByRole('button', { name: /hide password/i }),
    ).toBeInTheDocument();
  });

  it('displays error message when login fails with 400 invalid credentials', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(
      screen.getByPlaceholderText(/enter your username/i),
      'wronguser',
    );
    await user.type(
      screen.getByPlaceholderText(/enter your password/i),
      'wrongpassword',
    );
    await user.click(screen.getByRole('button', { name: /login/i }));

    const errorMsg = await screen.findByText(/invalid credentials/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('handles server network failure gracefully with generic error message', async () => {
    server.use(
      http.post(`${API_BASE}/login`, () => {
        return HttpResponse.error();
      }),
    );

    const user = userEvent.setup();
    renderLogin();

    await user.type(
      screen.getByPlaceholderText(/enter your username/i),
      'testuser',
    );
    await user.type(
      screen.getByPlaceholderText(/enter your password/i),
      'password123',
    );
    await user.click(screen.getByRole('button', { name: /login/i }));

    const errorMsg = await screen.findByText(
      /an unexpected error occurred\. please try again\./i,
    );
    expect(errorMsg).toBeInTheDocument();
  });

  it('successfully logs in with valid credentials and sets token in localStorage', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(
      screen.getByPlaceholderText(/enter your username/i),
      'testuser',
    );
    await user.type(
      screen.getByPlaceholderText(/enter your password/i),
      'password123',
    );
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Verify token was stored in localStorage
    expect(localStorage.getItem('jwt_token')).toBeTruthy();
  });
});
