/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test/test-utils';
import ForgotPassword from './ForgotPassword';
import { useForgotPasswordMutation } from '../services/authApi';

jest.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

jest.mock('../services/authApi', () => ({
  useForgotPasswordMutation: jest.fn(),
}));

const mockUseForgotPasswordMutation = useForgotPasswordMutation as jest.Mock;

function renderPage() {
  return renderWithProviders(<ForgotPassword />, { route: '/forgot-password' });
}

describe('ForgotPassword', () => {
  let forgot: jest.Mock;

  beforeEach(() => {
    forgot = jest.fn();
    mockUseForgotPasswordMutation.mockReturnValue([forgot, { isLoading: false }]);
  });

  it('renders the recovery form and login link', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Forgot Password?' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('10-digit mobile number')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Login' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('button', { name: 'Recover Password' })).toBeInTheDocument();
  });

  it('shows the loading label while submitting', () => {
    mockUseForgotPasswordMutation.mockReturnValue([forgot, { isLoading: true }]);
    renderPage();

    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
  });

  it('requires an email or mobile number', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Recover Password' }));

    expect(
      screen.getByText('Please enter your registered email or mobile number.')
    ).toBeInTheDocument();
    expect(forgot).not.toHaveBeenCalled();
  });

  it('rejects an invalid email address', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('name@example.com'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Recover Password' }));

    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(forgot).not.toHaveBeenCalled();
  });

  it('rejects an invalid mobile number', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('10-digit mobile number'), '12345');
    await user.click(screen.getByRole('button', { name: 'Recover Password' }));

    expect(
      screen.getByText('Please enter a valid 10-digit mobile number.')
    ).toBeInTheDocument();
    expect(forgot).not.toHaveBeenCalled();
  });

  it('submits valid details and shows the success dialog', async () => {
    const user = userEvent.setup();
    forgot.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        isSuccess: true,
        value: 'Account details has been sent to your email.',
      }),
    });
    renderPage();

    await user.type(screen.getByPlaceholderText('name@example.com'), 'asha@example.com');
    await user.click(screen.getByRole('button', { name: 'Recover Password' }));

    expect(await screen.findByRole('heading', { name: 'Success!' })).toBeInTheDocument();
    expect(screen.getByText('Account details has been sent to your email.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to Login' })).toHaveAttribute('href', '/login');
    expect(forgot).toHaveBeenCalledWith({ email: 'asha@example.com', mobile: '' });
  });

  it('shows the account-not-found dialog for an unknown account', async () => {
    const user = userEvent.setup();
    forgot.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        isSuccess: false,
        value: 'This account does not exist.',
      }),
    });
    renderPage();

    await user.type(screen.getByPlaceholderText('10-digit mobile number'), '9876543210');
    await user.click(screen.getByRole('button', { name: 'Recover Password' }));

    expect(await screen.findByRole('heading', { name: 'Account Not Found' })).toBeInTheDocument();
    expect(screen.getByText(/not registered/i)).toBeInTheDocument();
  });

  it('shows a backend error dialog and can close it', async () => {
    const user = userEvent.setup();
    forgot.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        isSuccess: false,
        value: 'Temporary failure',
      }),
    });
    renderPage();

    await user.type(screen.getByPlaceholderText('name@example.com'), 'asha@example.com');
    await user.click(screen.getByRole('button', { name: 'Recover Password' }));

    expect(await screen.findByRole('heading', { name: 'Error!' })).toBeInTheDocument();
    expect(screen.getByText('Temporary failure')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('heading', { name: 'Error!' })).not.toBeInTheDocument();
  });

  it('shows a request error dialog when the mutation rejects', async () => {
    const user = userEvent.setup();
    forgot.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue({ data: 'Network unavailable' }),
    });
    renderPage();

    await user.type(screen.getByPlaceholderText('name@example.com'), 'asha@example.com');
    await user.click(screen.getByRole('button', { name: 'Recover Password' }));

    expect(await screen.findByRole('heading', { name: 'Error!' })).toBeInTheDocument();
    expect(screen.getByText('Network unavailable')).toBeInTheDocument();
  });
});
