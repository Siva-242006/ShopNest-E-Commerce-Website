import { render, screen, act } from '@testing-library/react';
import { UserProvider, useUserDetails } from './UserContext';

const TestUserComponent = () => {
  const { userId, name, role, email, username, refreshUser } = useUserDetails();

  return (
    <div>
      <div data-testid="user-id">{userId || 'anonymous'}</div>
      <div data-testid="user-name">{name || 'no-name'}</div>
      <div data-testid="user-role">{role || 'no-role'}</div>
      <div data-testid="user-email">{email || 'no-email'}</div>
      <div data-testid="user-username">{username || 'no-username'}</div>
      <button onClick={refreshUser}>Refresh User</button>
    </div>
  );
};

// Helper to create a fake JWT with given payload
const createMockJwt = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = 'fake-signature';
  return `${header}.${body}.${signature}`;
};

describe('UserContext', () => {
  it('initializes with empty values when no token is in localStorage', () => {
    localStorage.clear();

    render(
      <UserProvider>
        <TestUserComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId('user-id')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('user-name')).toHaveTextContent('no-name');
    expect(screen.getByTestId('user-role')).toHaveTextContent('no-role');
  });

  it('decodes token from localStorage on mount and exposes user attributes', () => {
    const mockToken = createMockJwt({
      id: 'usr-123',
      name: 'John Doe',
      role: 'User',
      email: 'john@example.com',
      username: 'johndoe',
    });

    localStorage.setItem('jwt_token', mockToken);

    render(
      <UserProvider>
        <TestUserComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId('user-id')).toHaveTextContent('usr-123');
    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('user-role')).toHaveTextContent('User');
    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'john@example.com',
    );
    expect(screen.getByTestId('user-username')).toHaveTextContent('johndoe');
  });

  it('resets state when token is invalid or corrupted', () => {
    localStorage.setItem('jwt_token', 'invalid-corrupt-token');

    render(
      <UserProvider>
        <TestUserComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId('user-id')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('user-role')).toHaveTextContent('no-role');
  });

  it('updates state dynamically when refreshUser is called after login', async () => {
    localStorage.clear();

    render(
      <UserProvider>
        <TestUserComponent />
      </UserProvider>,
    );

    expect(screen.getByTestId('user-id')).toHaveTextContent('anonymous');

    // Simulate login storing new token
    const adminToken = createMockJwt({
      id: 'admin-999',
      name: 'Super Admin',
      role: 'Admin',
      email: 'admin@shopnest.com',
      username: 'admin',
    });
    localStorage.setItem('jwt_token', adminToken);

    // Call refreshUser
    await act(async () => {
      screen.getByRole('button', { name: /refresh user/i }).click();
    });

    expect(screen.getByTestId('user-id')).toHaveTextContent('admin-999');
    expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
  });
});
