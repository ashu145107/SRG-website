/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test/test-utils';
import { LegalLayout } from './LegalLayout';
import { LegalDocument } from '../../content/legal/types';

jest.mock('../Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}));

jest.mock('../SiteFooter', () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

const document: LegalDocument = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  subtitle: 'Dindoree Pranit Job Portal',
  effectiveDate: '1 January 2026',
  sections: [
    {
      id: 'about',
      title: '1. About Us',
      blocks: [
        { type: 'paragraph', text: 'We respect your privacy.' },
        { type: 'list', items: ['Name', 'Email'] },
        { type: 'callout', text: 'Contact us for privacy questions.' },
      ],
    },
    {
      id: 'contact',
      title: '2. Contact',
      blocks: [
        {
          type: 'table',
          headers: ['Channel', 'Detail'],
          rows: [['Email', 'admin@dindoripranit.org']],
        },
      ],
    },
  ],
};

describe('LegalLayout', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('renders the document header, table of contents and all sections', () => {
    renderWithProviders(<LegalLayout document={document} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText('Dindoree Pranit Job Portal')).toBeInTheDocument();
    expect(screen.getByText(/1 January 2026/)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '1. About Us' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: '2. Contact' })).toHaveLength(2);
    expect(screen.getByText('We respect your privacy.')).toBeInTheDocument();
    expect(screen.getByText('Contact us for privacy questions.')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Channel' })).toBeInTheDocument();
    expect(screen.getByText('admin@dindoripranit.org')).toBeInTheDocument();
    const legalLinks = screen.getAllByRole('link', { name: 'All legal documents' });
    expect(legalLinks).toHaveLength(2);
    legalLinks.forEach((link) => expect(link).toHaveAttribute('href', '/legal'));
  });

  it('scrolls to a section when its table-of-contents entry is clicked', async () => {
    renderWithProviders(<LegalLayout document={document} />);

    await userEvent.click(screen.getAllByRole('button', { name: '2. Contact' })[0]);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('renders the request form when the document defines one', () => {
    renderWithProviders(
      <LegalLayout
        document={{
          ...document,
          slug: 'data-request',
          title: 'Data Request Form',
          form: 'dsar',
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Submit a data request' })).toBeInTheDocument();
  });

  it('does not render a request form for standard documents', () => {
    renderWithProviders(<LegalLayout document={document} />);
    expect(screen.queryByRole('heading', { name: 'Submit a data request' })).not.toBeInTheDocument();
  });
});
