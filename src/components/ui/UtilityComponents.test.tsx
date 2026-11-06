/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import i18n from '../../i18n/config';
import {
  renderWithProviders,
  defaultAuthState,
  authenticatedAuthState,
} from '../../test/test-utils';
import {
  LanguageSwitcher,
  Pagination,
  Breadcrumb,
  ProtectedRoute,
  PermissionGuard,
} from './UtilityComponents';

describe('LanguageSwitcher', () => {
  it('renders both language buttons', () => {
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'मराठी' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('switches to Marathi and persists the choice', async () => {
    const spy = jest.spyOn(i18n, 'changeLanguage');
    renderWithProviders(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'मराठी' }));
    expect(spy).toHaveBeenCalledWith('mr');
    expect(localStorage.getItem('app_lang')).toBe('mr');
    spy.mockRestore();
  });

  it('switches to English and persists the choice', async () => {
    const spy = jest.spyOn(i18n, 'changeLanguage');
    renderWithProviders(<LanguageSwitcher />);
    await userEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(spy).toHaveBeenCalledWith('en');
    expect(localStorage.getItem('app_lang')).toBe('en');
    spy.mockRestore();
  });

  it('renders the dark variant with the same language controls', async () => {
    const spy = jest.spyOn(i18n, 'changeLanguage');
    const { container } = renderWithProviders(<LanguageSwitcher variant="dark" />);
    expect(container.firstChild).toHaveClass('bg-white/10');
    expect(screen.getByRole('button', { name: 'मराठी' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'मराठी' }));
    expect(spy).toHaveBeenCalledWith('mr');
    expect(localStorage.getItem('app_lang')).toBe('mr');
    spy.mockRestore();
  });
});

describe('Pagination', () => {
  it('renders nothing when there is a single page', () => {
    const { container } = renderWithProviders(
      <Pagination current={1} total={1} onPageChange={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a button per page', () => {
    renderWithProviders(<Pagination current={1} total={3} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('calls onPageChange with the clicked page', async () => {
    const onPageChange = jest.fn();
    renderWithProviders(<Pagination current={1} total={3} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe('Breadcrumb', () => {
  it('renders a link for entries with a path and plain text otherwise', () => {
    renderWithProviders(
      <Breadcrumb paths={[{ label: 'Home', to: '/' }, { label: 'Jobs' }]} />
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Jobs')).toBeInTheDocument();
  });
});

describe('ProtectedRoute', () => {
  const renderRoutes = (preloadedState: { auth: typeof defaultAuthState }) =>
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>SECRET</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route path="/unauthorized" element={<div>UNAUTHORIZED PAGE</div>} />
      </Routes>,
      { route: '/', preloadedState }
    );

  it('redirects guests to /login', () => {
    renderRoutes({ auth: defaultAuthState });
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('SECRET')).not.toBeInTheDocument();
  });

  it('renders children for an authenticated user', () => {
    renderRoutes({ auth: authenticatedAuthState({ role: 'CANDIDATE' }) });
    expect(screen.getByText('SECRET')).toBeInTheDocument();
  });

  it('redirects users without a token to /login', () => {
    renderRoutes({
      auth: { ...authenticatedAuthState(), token: null },
    });
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('SECRET')).not.toBeInTheDocument();
  });

  it('redirects users with an expired token to /login', () => {
    const expiredToken = `header.${btoa(JSON.stringify({ exp: 1 }))}.signature`;
    renderRoutes({
      auth: { ...authenticatedAuthState(), token: expiredToken },
    });
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('SECRET')).not.toBeInTheDocument();
  });

  it('redirects to /unauthorized when the role is not allowed', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <div>ADMIN SECRET</div>
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<div>UNAUTHORIZED PAGE</div>} />
      </Routes>,
      { route: '/', preloadedState: { auth: authenticatedAuthState({ role: 'CANDIDATE' }) } }
    );
    expect(screen.getByText('UNAUTHORIZED PAGE')).toBeInTheDocument();
    expect(screen.queryByText('ADMIN SECRET')).not.toBeInTheDocument();
  });

  it('renders children when the role is allowed', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <div>ADMIN SECRET</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      { route: '/', preloadedState: { auth: authenticatedAuthState({ role: 'ADMIN' }) } }
    );
    expect(screen.getByText('ADMIN SECRET')).toBeInTheDocument();
  });
});

describe('PermissionGuard', () => {
  it('renders the fallback when no user is present', () => {
    renderWithProviders(
      <PermissionGuard permission="canViewUsers" fallback={<div>NO ACCESS</div>}>
        <div>ALLOWED</div>
      </PermissionGuard>,
      { preloadedState: { auth: defaultAuthState } }
    );
    expect(screen.getByText('NO ACCESS')).toBeInTheDocument();
    expect(screen.queryByText('ALLOWED')).not.toBeInTheDocument();
  });

  it('renders nothing by default when no user is present', () => {
    const { container } = renderWithProviders(
      <PermissionGuard permission="canViewUsers">
        <div>ALLOWED</div>
      </PermissionGuard>,
      { preloadedState: { auth: defaultAuthState } }
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('lets ADMIN bypass permission checks', () => {
    renderWithProviders(
      <PermissionGuard permission="canApproveJobs">
        <div>ALLOWED</div>
      </PermissionGuard>,
      { preloadedState: { auth: authenticatedAuthState({ role: 'ADMIN' }) } }
    );
    expect(screen.getByText('ALLOWED')).toBeInTheDocument();
  });

  it('honours an explicit HANDLER permission', () => {
    renderWithProviders(
      <PermissionGuard permission="canViewReports" fallback={<div>NO ACCESS</div>}>
        <div>ALLOWED</div>
      </PermissionGuard>,
      {
        preloadedState: {
          auth: authenticatedAuthState({
            role: 'HANDLER',
            handlerPermissions: { canViewReports: true },
          }),
        },
      }
    );
    expect(screen.getByText('ALLOWED')).toBeInTheDocument();
  });

  it('falls back for a HANDLER without the permission', () => {
    renderWithProviders(
      <PermissionGuard permission="canApproveJobs" fallback={<div>NO ACCESS</div>}>
        <div>ALLOWED</div>
      </PermissionGuard>,
      {
        preloadedState: {
          auth: authenticatedAuthState({
            role: 'HANDLER',
            handlerPermissions: { canViewReports: true },
          }),
        },
      }
    );
    expect(screen.getByText('NO ACCESS')).toBeInTheDocument();
  });
});
