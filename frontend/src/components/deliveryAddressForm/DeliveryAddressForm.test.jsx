import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeliveryAddressForm from './deliveryAddressForm';
import { vi } from 'vitest';

describe('DeliveryAddressForm Component', () => {
  it('renders all address form fields', () => {
    const { container } = render(
      <DeliveryAddressForm onAddressSubmit={vi.fn()} />,
    );

    expect(
      screen.getByRole('heading', { name: /delivery address/i }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[name="fullName"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('input[name="phone"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="street"]')).toBeInTheDocument();
    expect(
      container.querySelector('input[name="landmark"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('input[name="city"]')).toBeInTheDocument();
    expect(container.querySelector('select[name="state"]')).toBeInTheDocument();
    expect(
      container.querySelector('input[name="pincode"]'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /save address/i }),
    ).toBeInTheDocument();
  });

  it('displays validation error messages when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<DeliveryAddressForm onAddressSubmit={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /save address/i });
    await user.click(submitBtn);

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Phone must be 10 digits')).toBeInTheDocument();
    expect(screen.getByText('Street is required')).toBeInTheDocument();
    expect(screen.getByText('City is required')).toBeInTheDocument();
    expect(
      screen.getByText('Please select or enter a state'),
    ).toBeInTheDocument();
    expect(screen.getByText('Pincode must be 6 digits')).toBeInTheDocument();
  });

  it('shows otherState input when "Other" is selected as State', async () => {
    const { container } = render(
      <DeliveryAddressForm onAddressSubmit={vi.fn()} />,
    );

    const stateSelect = container.querySelector('select[name="state"]');
    fireEvent.change(stateSelect, { target: { value: 'Other' } });

    expect(
      container.querySelector('input[name="otherState"]'),
    ).toBeInTheDocument();
  });

  it('submits valid address data and calls onAddressSubmit callback', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn();
    const { container } = render(
      <DeliveryAddressForm onAddressSubmit={mockOnSubmit} />,
    );

    fireEvent.change(container.querySelector('input[name="fullName"]'), {
      target: { value: 'Alice Smith' },
    });
    fireEvent.change(container.querySelector('input[name="phone"]'), {
      target: { value: '9876543210' },
    });
    fireEvent.change(container.querySelector('input[name="street"]'), {
      target: { value: '10 Downing St' },
    });
    fireEvent.change(container.querySelector('input[name="city"]'), {
      target: { value: 'Bangalore' },
    });
    fireEvent.change(container.querySelector('select[name="state"]'), {
      target: { value: 'Karnataka' },
    });
    fireEvent.change(container.querySelector('input[name="pincode"]'), {
      target: { value: '560001' },
    });

    const submitBtn = screen.getByRole('button', { name: /save address/i });
    await user.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      fullName: 'Alice Smith',
      phone: '9876543210',
      street: '10 Downing St',
      landmark: '',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    });
  });
});
