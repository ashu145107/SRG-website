/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { renderWithProviders, screen, waitFor } from '../test/test-utils';
import ActivateAccount from './ActivateAccount';
import { useActivateAccountMutation } from '../services/authApi';

jest.mock('../services/authApi', () => ({
  useActivateAccountMutation: jest.fn(),
}));

const mockUseActivateAccountMutation = useActivateAccountMutation as jest.Mock;

function renderPage(route = '/activate') {
  return renderWithProviders(<ActivateAccount />, { route });
}

describe('ActivateAccount', () => {
  let activate: jest.Mock;

  beforeEach(() => {
    activate = jest.fn();
    mockUseActivateAccountMutation.mockReturnValue([activate, { isLoading: false }]);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the invalid-link state when no activation code is present', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: 'Invalid Activation Link' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Please make sure you are using a valid and complete activation link.')
    ).toBeInTheDocument();
    expect(activate).not.toHaveBeenCalled();
  });

  it('shows the loading state while activation is in progress', () => {
    mockUseActivateAccountMutation.mockReturnValue([activate, { isLoading: true }]);
    renderPage('/activate?d=abc123');

    expect(screen.getByRole('heading', { name: 'Activating your account...' })).toBeInTheDocument();
    expect(screen.getByText('We are verifying your activation link')).toBeInTheDocument();
  });

  it('activates the account with the code from the query string', async () => {
    activate.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ isSuccess: true }) });
    renderPage('/activate?d=abc123');

    expect(
      await screen.findByRole('heading', { name: 'Account Activated Successfully!' })
    ).toBeInTheDocument();
    expect(activate).toHaveBeenCalledWith({ code: 'abc123' });
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login');
  });

  it('accepts token and code query parameter names', async () => {
    activate.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({ success: true }) });
    const { unmount } = renderPage('/activate?token=token-1');
    await screen.findByRole('heading', { name: 'Account Activated Successfully!' });
    expect(activate).toHaveBeenCalledWith({ code: 'token-1' });
    unmount();

    activate.mockClear();
    renderPage('/activate?code=code-1');
    await screen.findByRole('heading', { name: 'Account Activated Successfully!' });
    expect(activate).toHaveBeenCalledWith({ code: 'code-1' });
  });

  it('shows the failure state when the API reports an unsuccessful activation', async () => {
    activate.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        isSuccess: false,
        error: { message: 'This link has expired.' },
      }),
    });
    renderPage('/activate?d=expired');

    expect(await screen.findByRole('heading', { name: 'Activation Failed' })).toBeInTheDocument();
    expect(screen.getByText('This link has expired.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  });

  it('shows the server-error state when the mutation rejects', async () => {
    activate.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue({ data: 'Server is unavailable' }),
    });
    renderPage('/activate?d=abc123');

    expect(await screen.findByRole('heading', { name: 'Server Error' })).toBeInTheDocument();
    expect(screen.getByText('Server is unavailable')).toBeInTheDocument();
  });
});
