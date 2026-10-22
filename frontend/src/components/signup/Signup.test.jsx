import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Signup from './index';

const renderSignup = () => {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>,
  );
};

describe('Signup Component', () => {
  it('renders all registration fields (name, email, username, password, role)', () => {
    renderSignup();

    expect(
      screen.getByRole('heading', { name: /create account/i }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/choose a username/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/minimum 6 characters/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it('validates password length under 6 characters client-side', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(
      screen.getByPlaceholderText(/enter your name/i),
      'Short Pass',
    );
    await user.type(
      screen.getByPlaceholderText(/enter your email/i),
      'short@example.com',
    );
    await user.type(
      screen.getByPlaceholderText(/choose a username/i),
      'shortpass',
    );
    await user.type(
      screen.getByPlaceholderText(/minimum 6 characters/i),
      '123',
    );
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      screen.getByText(/password must be at least 6 characters long\./i),
    ).toBeInTheDocument();
  });

  it('displays API error message when email is already registered', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(
      screen.getByPlaceholderText(/enter your name/i),
      'Existing User',
    );
    await user.type(
      screen.getByPlaceholderText(/enter your email/i),
      'existing@example.com',
    );
    await user.type(
      screen.getByPlaceholderText(/choose a username/i),
      'existinguser',
    );
    await user.type(
      screen.getByPlaceholderText(/minimum 6 characters/i),
      'secret123',
    );
    await user.click(screen.getByRole('button', { name: /create account/i }));

    const errorMsg = await screen.findByText(/email already exists/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('displays success message on successful registration', async () => {
    const user = userEvent.setup();
    renderSignup();

    await user.type(
      screen.getByPlaceholderText(/enter your name/i),
      'New User',
    );
    await user.type(
      screen.getByPlaceholderText(/enter your email/i),
      'newuser@example.com',
    );
    await user.type(
      screen.getByPlaceholderText(/choose a username/i),
      'newuser',
    );
    await user.type(
      screen.getByPlaceholderText(/minimum 6 characters/i),
      'validpass123',
    );
    await user.click(screen.getByRole('button', { name: /create account/i }));

    const successMsg = await screen.findByText(
      /signup successful! redirecting to login\.\.\./i,
    );
    expect(successMsg).toBeInTheDocument();
  });
});
