/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test/test-utils';
import Login from './Login';
import { useLoginMutation } from '../services/authApi';

jest.mock('../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

jest.mock('../services/authApi', () => ({
  useLoginMutation: jest.fn(),
}));

const mockUseLoginMutation = useLoginMutation as jest.Mock;

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<div>Dashboard destination</div>} />
    </Routes>,
    { route: '/login' }
  );
}

describe('Login', () => {
  let login: jest.Mock;

  beforeEach(() => {
    login = jest.fn();
    mockUseLoginMutation.mockReturnValue([login, { isLoading: false }]);
  });

  it('renders the login form and account links', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: 'Account Login' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username \/ Email \/ Mobile/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Forgot Password?' })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
    expect(screen.getByRole('link', { name: 'Register here' })).toHaveAttribute(
      'href',
      '/register'
    );
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows the loading label while signing in', () => {
    mockUseLoginMutation.mockReturnValue([login, { isLoading: true }]);
    renderLogin();

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    const { container } = renderLogin();
    const password = container.querySelector('input[type="password"]') as HTMLInputElement;

    await user.click(container.querySelector('button[type="button"]') as HTMLButtonElement);

    expect(password.type).toBe('text');
  });

  it('logs in, stores credentials and navigates to the dashboard', async () => {
    const user = userEvent.setup();
    login.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        user: { id: '7', name: 'Asha', email: 'asha@example.com', role: 'CANDIDATE' },
        token: 'jwt-7',
      }),
    });
    const { container, store } = renderLogin();

    await user.type(screen.getByLabelText(/Username \/ Email \/ Mobile/), 'asha@example.com');
    await user.type(container.querySelector('input[type="password"]') as HTMLInputElement, 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(screen.getByText('Dashboard destination')).toBeInTheDocument());
    expect(login).toHaveBeenCalledWith({ email: 'asha@example.com', password: 'secret123' });
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.token).toBe('jwt-7');
  });

  it('shows the backend error when login fails', async () => {
    const user = userEvent.setup();
    login.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue({ data: 'Invalid username or password' }),
    });
    const { container } = renderLogin();

    await user.type(screen.getByLabelText(/Username \/ Email \/ Mobile/), 'asha@example.com');
    await user.type(container.querySelector('input[type="password"]') as HTMLInputElement, 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument();
  });

  it('shows the fallback login error when no backend message is present', async () => {
    const user = userEvent.setup();
    login.mockReturnValue({ unwrap: jest.fn().mockRejectedValue({}) });
    const { container } = renderLogin();

    await user.type(screen.getByLabelText(/Username \/ Email \/ Mobile/), 'asha@example.com');
    await user.type(container.querySelector('input[type="password"]') as HTMLInputElement, 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(
      await screen.findByText('Invalid login details. Please check your credentials.')
    ).toBeInTheDocument();
  });
});
