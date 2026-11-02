/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen } from '../../test/test-utils';
import LegalDocumentPage from './LegalDocumentPage';

jest.mock('../../components/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

jest.mock('../../components/SiteFooter', () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

function renderPage(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/legal/:slug" element={<LegalDocumentPage />} />
    </Routes>,
    { route }
  );
}

describe('LegalDocumentPage', () => {
  it('renders a known legal document for its slug', () => {
    renderPage('/legal/privacy-policy');

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1. About Us' })).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('site-footer')).toBeInTheDocument();
  });

  it('renders the data request document with its form', () => {
    renderPage('/legal/data-request');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Data Request Form' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Submit a data request' })).toBeInTheDocument();
  });

  it('renders a not-found state for an unknown slug', () => {
    renderPage('/legal/does-not-exist');

    expect(screen.getByRole('heading', { name: 'Document not found' })).toBeInTheDocument();
    expect(
      screen.getByText('The legal document you are looking for does not exist or has moved.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All legal documents' })).toHaveAttribute(
      'href',
      '/legal'
    );
  });
});
