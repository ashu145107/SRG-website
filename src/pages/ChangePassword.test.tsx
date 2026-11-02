/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { authenticatedAuthState, renderWithProviders, screen } from '../test/test-utils';
import ChangePassword from './ChangePassword';
import { useChangePasswordMutation } from '../services/authApi';

jest.mock('../services/authApi', () => ({
  useChangePasswordMutation: jest.fn(),
}));

const mockUseChangePasswordMutation = useChangePasswordMutation as jest.Mock;

function renderPage() {
  return renderWithProviders(<ChangePassword />, {
    route: '/change-password',
    preloadedState: { auth: authenticatedAuthState({ id: '42', name: 'Asha Patil' }) },
  });
}

function fillPasswords(container: HTMLElement, oldPassword: string, next: string, confirm: string) {
  const inputs = container.querySelectorAll('input');
  fireEvent.change(inputs[0], { target: { value: oldPassword } });
  fireEvent.change(inputs[1], { target: { value: next } });
  fireEvent.change(inputs[2], { target: { value: confirm } });
  return inputs;
}

describe('ChangePassword', () => {
  let changePassword: jest.Mock;

  beforeEach(() => {
    changePassword = jest.fn();
    mockUseChangePasswordMutation.mockReturnValue([changePassword, { isLoading: false }]);
  });

  it('renders the password form, strength meter and account actions', () => {
    const { container } = renderPage();

    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(3);
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change Password' })).toBeInTheDocument();
  });

  it('shows the loading state on the submit button', () => {
    mockUseChangePasswordMutation.mockReturnValue([changePassword, { isLoading: true }]);
    renderPage();

    expect(screen.getByRole('button', { name: /Change Password/ })).toBeDisabled();
  });

  it('requires the old password', () => {
    const { container } = renderPage();

    fireEvent.submit(container.querySelector('form')!);

    expect(screen.getByText('Please enter your old password.')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('rejects a weak new password', () => {
    const { container } = renderPage();
    fillPasswords(container, 'old-password', 'abc', 'abc');

    fireEvent.submit(container.querySelector('form')!);

    expect(
      screen.getByText(
        'Choose a strong password - min 8 characters with upper/lower case, a number and a special character.'
      )
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('rejects mismatched new passwords', () => {
    const { container } = renderPage();
    fillPasswords(container, 'old-password', 'Strong1!', 'Other1!');

    fireEvent.submit(container.querySelector('form')!);

    expect(
      screen.getByText('New password and confirmation do not match.')
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('changes the password and shows the success dialog', async () => {
    const user = userEvent.setup();
    changePassword.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ isSuccess: true, value: 'Password updated.' }),
    });
    const { container } = renderPage();
    fillPasswords(container, 'old-password', 'Strong1!', 'Strong1!');

    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByRole('heading', { name: 'Success!' })).toBeInTheDocument();
    expect(screen.getByText('Password updated.')).toBeInTheDocument();
    expect(changePassword).toHaveBeenCalledWith({
      userId: 42,
      oldPassword: 'old-password',
      newPassword: 'Strong1!',
    });
  });

  it('shows an error dialog when the API rejects the change', async () => {
    const user = userEvent.setup();
    changePassword.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        isSuccess: false,
        value: 'Old password is incorrect.',
      }),
    });
    const { container } = renderPage();
    fillPasswords(container, 'wrong-password', 'Strong1!', 'Strong1!');

    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByRole('heading', { name: 'Error!' })).toBeInTheDocument();
    expect(screen.getByText('Old password is incorrect.')).toBeInTheDocument();
  });

  it('shows an error dialog when the mutation fails', async () => {
    const user = userEvent.setup();
    changePassword.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue({ data: 'Network unavailable' }),
    });
    const { container } = renderPage();
    fillPasswords(container, 'old-password', 'Strong1!', 'Strong1!');

    await user.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(await screen.findByRole('heading', { name: 'Error!' })).toBeInTheDocument();
    expect(screen.getByText('Network unavailable')).toBeInTheDocument();
  });
});
