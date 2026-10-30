/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test/polyfills';
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navbar } from './Navbar';
import {
  renderWithProviders,
  authenticatedAuthState,
  defaultAuthState,
} from '../test/test-utils';

// The real baseApi reads import.meta.env (a Vite-only syntax Jest cannot
// parse). Stub it with an inert reducer/middleware so the harness store works.
jest.mock('../services/baseApi', () => ({
  baseApi: {
    reducerPath: 'srgApi',
    reducer: (state: unknown = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
    util: { resetApiState: () => ({ type: 'srgApi/resetApiState' }) },
  },
  getApiBaseUrl: () => '',
}));

// NotificationBell depends on a React Query provider which the test harness
// does not mount; stub it out so only Navbar's own logic is under test.
jest.mock('./NotificationBell', () => ({
  NotificationBell: () => null,
}));

describe('Navbar', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
  });

  it('renders guest actions (Login / Sign Up) and no dashboard link', () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: defaultAuthState } });

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Dashboard/ })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Logout')).not.toBeInTheDocument();
  });

  it('renders authenticated actions (Dashboard + Logout) instead of Login', () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: authenticatedAuthState() },
    });

    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute(
      'href',
      '/dashboard'
    );
    expect(screen.getByTitle('Logout')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('opens the desktop Jobs dropdown on hover', async () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: defaultAuthState } });

    expect(screen.queryByRole('link', { name: 'Post a Requirement' })).not.toBeInTheDocument();

    await userEvent.hover(screen.getByRole('button', { name: 'Jobs' }));

    expect(screen.getByRole('link', { name: 'Post a Requirement' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Candidate Registration' })).toBeInTheDocument();
  });

  it('opens the SHG coming-soon popup from the SHG dropdown', async () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: defaultAuthState } });

    await userEvent.hover(screen.getByRole('button', { name: 'SHG & Livelihood' }));
    await userEvent.click(screen.getByRole('button', { name: /About Self-Help Groups/ }));

    expect(await screen.findByText('Self-Help Group Information')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('toggles the mobile menu drawer', async () => {
    renderWithProviders(<Navbar />, { preloadedState: { auth: defaultAuthState } });

    expect(screen.queryByText('SHG & Products')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Menu' }));

    expect(screen.getByText('SHG & Products')).toBeInTheDocument();
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(1);
  });

  it('shows authenticated mobile drawer entries (Go to Dashboard / Logout)', async () => {
    renderWithProviders(<Navbar />, {
      preloadedState: { auth: authenticatedAuthState() },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Menu' }));

    expect(screen.getByRole('link', { name: /Go to Dashboard/ })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Logout' }).length).toBeGreaterThan(0);
  });
});
