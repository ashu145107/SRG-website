/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { renderWithProviders, screen } from '../../test/test-utils';
import LegalHub from './LegalHub';

jest.mock('../../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

jest.mock('../../components/SiteFooter', () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

const DOCUMENT_SLUGS = [
  'privacy-policy',
  'terms-candidate',
  'terms-employer',
  'consent-forms',
  'disclaimer',
  'cookie-policy',
  'code-of-conduct',
  'grievance-officer',
  'data-request',
];

describe('LegalHub', () => {
  it('renders the legal hub heading, grouping labels and footer note', () => {
    renderWithProviders(<LegalHub />, { route: '/legal' });

    expect(screen.getByRole('heading', { level: 1, name: 'Legal & Policies' })).toBeInTheDocument();
    expect(screen.getByText('For everyone')).toBeInTheDocument();
    expect(screen.getByText('For candidates')).toBeInTheDocument();
    expect(screen.getByText('For employers')).toBeInTheDocument();
    expect(screen.getByText(/These policies apply to the Dindori Pranit Job Portal/)).toBeInTheDocument();
  });

  it('links to every legal document', () => {
    renderWithProviders(<LegalHub />, { route: '/legal' });

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    for (const slug of DOCUMENT_SLUGS) {
      expect(hrefs).toContain(`/legal/${slug}`);
    }
  });

  it('renders help links for the grievance officer and data requests', () => {
    renderWithProviders(<LegalHub />, { route: '/legal' });

    expect(screen.getByRole('link', { name: 'Contact grievance officer' })).toHaveAttribute(
      'href',
      '/legal/grievance-officer'
    );
    expect(screen.getByRole('link', { name: 'Make a data request' })).toHaveAttribute(
      'href',
      '/legal/data-request'
    );
  });
});
