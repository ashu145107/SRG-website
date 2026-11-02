/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LegalBlockRenderer } from './LegalBlockRenderer';
import { LegalBlock } from '../../content/legal/types';

describe('LegalBlockRenderer', () => {
  it('renders a paragraph', () => {
    render(<LegalBlockRenderer block={{ type: 'paragraph', text: 'Policy paragraph' }} />);
    expect(screen.getByText('Policy paragraph').tagName).toBe('P');
  });

  it('renders a subheading', () => {
    render(<LegalBlockRenderer block={{ type: 'subheading', text: 'Policy heading' }} />);
    expect(screen.getByRole('heading', { name: 'Policy heading' })).toBeInTheDocument();
  });

  it('renders a list with every item', () => {
    render(<LegalBlockRenderer block={{ type: 'list', items: ['First item', 'Second item'] }} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
  });

  it('renders a callout', () => {
    render(<LegalBlockRenderer block={{ type: 'callout', text: 'Important notice' }} />);
    expect(screen.getByText('Important notice')).toBeInTheDocument();
  });

  it('renders a table with headers and rows', () => {
    render(
      <LegalBlockRenderer
        block={{
          type: 'table',
          headers: ['Purpose', 'Data'],
          rows: [
            ['Registration', 'Name'],
            ['Support', 'Email'],
          ],
        }}
      />
    );

    expect(screen.getByRole('columnheader', { name: 'Purpose' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Data' })).toBeInTheDocument();
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders nothing for an unsupported block type', () => {
    const { container } = render(
      <LegalBlockRenderer block={{ type: 'unknown' } as unknown as LegalBlock} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
