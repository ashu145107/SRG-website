/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../services/baseApi', () => ({
  baseApi: {
    reducerPath: 'srgApi',
    reducer: (state: unknown = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  getApiBaseUrl: () => '',
}));

jest.mock('react-router-dom', () => {
  const util = require('util');
  (global as any).TextEncoder = (global as any).TextEncoder || util.TextEncoder;
  (global as any).TextDecoder = (global as any).TextDecoder || util.TextDecoder;
  return jest.requireActual('react-router-dom');
});

import React from 'react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { renderWithProviders, screen } from '../test/test-utils';
import { SiteFooter } from './SiteFooter';

function LocationProbe() {
  const { pathname } = useLocation();
  return <span data-testid="pathname">{pathname}</span>;
}

describe('SiteFooter', () => {
  it('renders the key sections, contact details and legal line', () => {
    renderWithProviders(<SiteFooter />);

    expect(screen.getByText('Swayamrojgar')).toBeInTheDocument();
    expect(screen.getByText('For Groups')).toBeInTheDocument();
    expect(screen.getByText('Careers')).toBeInTheDocument();
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(
      screen.getByText(
        '© 2026 Shree Swami Samarth Seva Marg, Dindori Pranit - Swayamrojgar Vibhag. All Rights Reserved.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('admin@dindoripranit.org')).toHaveAttribute(
      'href',
      'mailto:admin@dindoripranit.org'
    );
    expect(screen.getByRole('link', { name: 'Login portals' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /Google Play/i })).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=dindori.pranit.swayamrojgarapp'
    );
  });

  it('invokes the section handler when a section link is clicked', async () => {
    const scrollTo = jest.fn();
    renderWithProviders(<SiteFooter scrollTo={scrollTo} />);

    await userEvent.click(screen.getByRole('button', { name: 'About us' }));
    expect(scrollTo).toHaveBeenCalledWith('offices');

    await userEvent.click(screen.getByRole('button', { name: 'Our products' }));
    expect(scrollTo).toHaveBeenCalledWith('products');
  });

  it('invokes the gateway handler with the clicked role', async () => {
    const enterGateway = jest.fn();
    renderWithProviders(<SiteFooter enterGateway={enterGateway} />);

    await userEvent.click(screen.getByRole('button', { name: 'Register your group' }));
    expect(enterGateway).toHaveBeenCalledWith('SHG');

    await userEvent.click(screen.getByRole('button', { name: 'Browse jobs' }));
    expect(enterGateway).toHaveBeenCalledWith('CANDIDATE');
  });

  it('falls back to navigating home when no handlers are provided', async () => {
    renderWithProviders(
      <>
        <SiteFooter />
        <LocationProbe />
      </>,
      { route: '/start' }
    );

    expect(screen.getByTestId('pathname')).toHaveTextContent('/start');

    await userEvent.click(screen.getByRole('button', { name: 'Browse jobs' }));
    expect(screen.getByTestId('pathname')).toHaveTextContent('/');
  });
});
