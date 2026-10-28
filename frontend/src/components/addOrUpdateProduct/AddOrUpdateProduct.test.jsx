import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import AddOrUpdateProductForm from './addOrUpdateProduct';
import { UserContext } from '../../context/UserContext';
import { CartProvider } from '../../context/CartContext';
import { server } from '../../test/mocks/server';
import { API_BASE } from '../../test/mocks/handlers';

const renderAddOrUpdateProduct = ({
  role = 'Admin',
  initialEntries = ['/admin/products/add'],
} = {}) => {
  localStorage.setItem('jwt_token', 'mock-valid-token');

  return render(
    <MemoryRouter initialEntries={initialEntries}>
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
          <Routes>
            <Route
              path="/admin/products/add"
              element={<AddOrUpdateProductForm />}
            />
            <Route
              path="/admin/products/update/:id"
              element={<AddOrUpdateProductForm />}
            />
            <Route path="/products" element={<div>Products Catalog</div>} />
          </Routes>
        </CartProvider>
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('AddOrUpdateProductForm Component', () => {
  it('displays Access Denied when logged in as normal User', () => {
    renderAddOrUpdateProduct({ role: 'User' });

    expect(
      screen.getByText(/access denied: only admins can manage products\./i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /add product/i }),
    ).not.toBeInTheDocument();
  });

  it('renders Add Product form with all inputs and category select for Admin', async () => {
    const { container } = renderAddOrUpdateProduct({ role: 'Admin' });

    expect(
      screen.getByRole('heading', { name: /add product/i }),
    ).toBeInTheDocument();
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(
      container.querySelector('textarea[name="description"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('input[name="price"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="image"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="brand"]')).toBeInTheDocument();
    expect(
      await screen.findByRole('option', { name: 'Electronics' }),
    ).toBeInTheDocument();
    expect(container.querySelector('input[name="stock"]')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add product/i }),
    ).toBeInTheDocument();
  });

  it('loads and pre-populates existing product data in edit mode', async () => {
    renderAddOrUpdateProduct({
      role: 'Admin',
      initialEntries: ['/admin/products/update/prod-1'],
    });

    expect(
      await screen.findByDisplayValue('Wireless Bluetooth Headphones'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /update product/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /update product/i }),
    ).toBeInTheDocument();
  });

  it('submits form successfully and navigates to /products', async () => {
    const { container } = renderAddOrUpdateProduct({ role: 'Admin' });

    await screen.findByRole('option', { name: 'Electronics' });

    fireEvent.change(container.querySelector('input[name="name"]'), {
      target: { value: 'New Test Product' },
    });
    fireEvent.change(container.querySelector('textarea[name="description"]'), {
      target: { value: 'Product description here' },
    });
    fireEvent.change(container.querySelector('input[name="price"]'), {
      target: { value: '1500' },
    });
    fireEvent.change(container.querySelector('input[name="image"]'), {
      target: { value: 'https://example.com/test.jpg' },
    });
    fireEvent.change(container.querySelector('input[name="brand"]'), {
      target: { value: 'BrandTest' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Electronics' },
    });
    fireEvent.change(container.querySelector('input[name="stock"]'), {
      target: { value: '10' },
    });

    fireEvent.submit(container.querySelector('form'));

    expect(await screen.findByText(/products catalog/i)).toBeInTheDocument();
  });

  it('displays error message when submission fails', async () => {
    server.use(
      http.post(`${API_BASE}/products/add`, () => {
        return HttpResponse.json(
          { message: 'Database connection failed' },
          { status: 500 },
        );
      }),
    );

    const { container } = renderAddOrUpdateProduct({ role: 'Admin' });

    await screen.findByRole('option', { name: 'Electronics' });

    fireEvent.change(container.querySelector('input[name="name"]'), {
      target: { value: 'New Test Product' },
    });
    fireEvent.change(container.querySelector('textarea[name="description"]'), {
      target: { value: 'Product description here' },
    });
    fireEvent.change(container.querySelector('input[name="price"]'), {
      target: { value: '1500' },
    });
    fireEvent.change(container.querySelector('input[name="image"]'), {
      target: { value: 'https://example.com/test.jpg' },
    });
    fireEvent.change(container.querySelector('input[name="brand"]'), {
      target: { value: 'BrandTest' },
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Electronics' },
    });
    fireEvent.change(container.querySelector('input[name="stock"]'), {
      target: { value: '10' },
    });

    fireEvent.submit(container.querySelector('form'));

    expect(
      await screen.findByText('Database connection failed'),
    ).toBeInTheDocument();
  });
});
