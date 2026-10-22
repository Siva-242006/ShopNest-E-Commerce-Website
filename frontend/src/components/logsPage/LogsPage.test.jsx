import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import Logs from './logsPage';
import { UserContext } from '../../context/UserContext';
import { CartProvider } from '../../context/CartContext';
import { server } from '../../test/mocks/server';
import { API_BASE } from '../../test/mocks/handlers';

const renderLogs = (role = 'Admin') => {
  localStorage.setItem('jwt_token', 'mock-valid-token');

  return render(
    <MemoryRouter>
      <UserContext.Provider
        value={{
          userId: 'admin-123',
          name: 'Store Admin',
          role,
          email: 'admin@shopnest.com',
          username: 'admin',
          refreshUser: () => {},
        }}
      >
        <CartProvider>
          <Logs />
        </CartProvider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('Logs Component', () => {
  it('displays Access Denied when logged in as normal User', () => {
    renderLogs('User');

    expect(
      screen.getByText(/access denied: only admins can view logs\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/system logs/i)).not.toBeInTheDocument();
  });

  it('renders loading state initially and then displays logs table for Admin', async () => {
    renderLogs('Admin');

    expect(screen.getByText(/loading logs\.\.\./i)).toBeInTheDocument();

    const heading = await screen.findByRole('heading', {
      name: /system logs/i,
    });
    expect(heading).toBeInTheDocument();

    expect(await screen.findByText('User Login')).toBeInTheDocument();
    expect(screen.getByText('Viewed Product')).toBeInTheDocument();
    expect(screen.getAllByText('192.168.1.1').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/mumbai, india/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole('button', { name: /delete all logs/i }),
    ).toBeInTheDocument();
  });

  it('renders empty logs state when no logs exist', async () => {
    server.use(
      http.get(`${API_BASE}/logs`, () => {
        return HttpResponse.json([]);
      }),
    );

    renderLogs('Admin');

    expect(await screen.findByText(/no logs found\./i)).toBeInTheDocument();
  });

  it('handles Delete All Logs click and clears table', async () => {
    const user = userEvent.setup();
    renderLogs('Admin');

    const deleteBtn = await screen.findByRole('button', {
      name: /delete all logs/i,
    });

    await user.click(deleteBtn);

    expect(await screen.findByText(/no logs found\./i)).toBeInTheDocument();
  });

  it('displays error message when fetch logs fails', async () => {
    server.use(
      http.get(`${API_BASE}/logs`, () => {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
      }),
    );

    renderLogs('Admin');

    expect(
      await screen.findByText(
        /failed to fetch logs\. you may not have permission\./i,
      ),
    ).toBeInTheDocument();
  });
});
