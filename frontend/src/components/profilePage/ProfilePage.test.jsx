import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './profilePage';
import { UserContext } from '../../context/UserContext';
import { CartProvider } from '../../context/CartContext';

const renderProfilePage = () => {
  localStorage.setItem('jwt_token', 'mock-valid-token');

  return render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          userId: 'user-123',
          name: 'Jane Customer',
          role: 'User',
          email: 'jane@example.com',
          username: 'janecust',
          refreshUser: () => {},
        }}
      >
        <CartProvider>
          <ProfilePage />
        </CartProvider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('ProfilePage Component', () => {
  it('renders user details (Name, Username, Email, Role)', () => {
    renderProfilePage();

    expect(
      screen.getByRole('heading', { name: /my profile/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Jane Customer')).toBeInTheDocument();
    expect(screen.getByText('janecust')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('validates mismatched new passwords on submit', async () => {
    const user = userEvent.setup();
    renderProfilePage();

    const oldPwdInput = screen.getByPlaceholderText('Old Password');
    const newPwdInput = screen.getByPlaceholderText('New Password');
    const confirmPwdInput = screen.getByPlaceholderText('Confirm New Password');

    fireEvent.change(oldPwdInput, { target: { value: 'old123456' } });
    fireEvent.change(newPwdInput, { target: { value: 'newpassword1' } });
    fireEvent.change(confirmPwdInput, {
      target: { value: 'mismatchpassword' },
    });

    const submitBtn = screen.getByRole('button', { name: /update password/i });
    await user.click(submitBtn);

    expect(
      screen.getByText('New password and confirm password do not match'),
    ).toBeInTheDocument();
  });

  it('validates password length under 6 characters', async () => {
    const user = userEvent.setup();
    renderProfilePage();

    const oldPwdInput = screen.getByPlaceholderText('Old Password');
    const newPwdInput = screen.getByPlaceholderText('New Password');
    const confirmPwdInput = screen.getByPlaceholderText('Confirm New Password');

    fireEvent.change(oldPwdInput, { target: { value: 'old123456' } });
    fireEvent.change(newPwdInput, { target: { value: '123' } });
    fireEvent.change(confirmPwdInput, { target: { value: '123' } });

    const submitBtn = screen.getByRole('button', { name: /update password/i });
    await user.click(submitBtn);

    expect(
      screen.getByText('Password must be at least 6 characters long'),
    ).toBeInTheDocument();
  });

  it('submits valid password change and displays success message', async () => {
    const user = userEvent.setup();
    renderProfilePage();

    const oldPwdInput = screen.getByPlaceholderText('Old Password');
    const newPwdInput = screen.getByPlaceholderText('New Password');
    const confirmPwdInput = screen.getByPlaceholderText('Confirm New Password');

    fireEvent.change(oldPwdInput, { target: { value: 'currentPass123' } });
    fireEvent.change(newPwdInput, { target: { value: 'newSecretPass123' } });
    fireEvent.change(confirmPwdInput, {
      target: { value: 'newSecretPass123' },
    });

    const submitBtn = screen.getByRole('button', { name: /update password/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText('Password updated successfully!'),
    ).toBeInTheDocument();
  });

  it('displays API error message when password update fails', async () => {
    const user = userEvent.setup();
    renderProfilePage();

    const oldPwdInput = screen.getByPlaceholderText('Old Password');
    const newPwdInput = screen.getByPlaceholderText('New Password');
    const confirmPwdInput = screen.getByPlaceholderText('Confirm New Password');

    fireEvent.change(oldPwdInput, { target: { value: 'wrongpassword' } });
    fireEvent.change(newPwdInput, { target: { value: 'newValidPass123' } });
    fireEvent.change(confirmPwdInput, { target: { value: 'newValidPass123' } });

    const submitBtn = screen.getByRole('button', { name: /update password/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText('Current password incorrect'),
    ).toBeInTheDocument();
  });
});
