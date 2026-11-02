/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders, screen } from '../../test/test-utils';
import { LegalRequestForm } from './LegalRequestForm';

const originalLocation = window.location;

function mockLocation() {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { href: '' },
  });
}

describe('LegalRequestForm', () => {
  beforeEach(() => {
    mockLocation();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders the data-request form with all request types', () => {
    renderWithProviders(<LegalRequestForm kind="dsar" />);

    expect(screen.getByRole('heading', { name: 'Submit a data request' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Request type')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Erase my data' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send request via email' })).toBeInTheDocument();
  });

  it('renders the grievance form with a subject field', () => {
    renderWithProviders(<LegalRequestForm kind="grievance" />);

    expect(screen.getByRole('heading', { name: 'File a grievance' })).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.queryByLabelText('Request type')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send grievance via email' })).toBeInTheDocument();
  });

  it('shows a validation error when required fields are empty', () => {
    const { container } = renderWithProviders(<LegalRequestForm kind="dsar" />);

    fireEvent.submit(container.querySelector('form')!);

    expect(screen.getByText('Please fill in your name, email and details.')).toBeInTheDocument();
    expect(window.location.href).toBe('');
  });

  it('builds a mailto link with the data request details', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<LegalRequestForm kind="dsar" />);

    await user.type(screen.getByLabelText('Full name'), 'Asha Patil');
    await user.type(screen.getByLabelText('Email'), 'asha@example.com');
    await user.type(screen.getByLabelText('Mobile number'), '9876543210');
    await user.selectOptions(screen.getByLabelText('I am a'), 'employer');
    await user.selectOptions(screen.getByLabelText('Request type'), 'correction');
    await user.type(screen.getByLabelText('Details'), 'Please correct my surname.');

    fireEvent.submit(container.querySelector('form')!);

    expect(window.location.href).toContain('mailto:admin@dindoripranit.org');
    expect(window.location.href).toContain(
      encodeURIComponent('Data request - Dindori Pranit Job Portal - Correct my data')
    );
    expect(window.location.href).toContain(encodeURIComponent('Full name: Asha Patil'));
    expect(window.location.href).toContain(encodeURIComponent('I am a: Employer'));
    expect(window.location.href).toContain(
      encodeURIComponent('Please correct my surname.')
    );
  });

  it('builds a mailto link with the grievance subject', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<LegalRequestForm kind="grievance" />);

    await user.type(screen.getByLabelText('Full name'), 'Ravi Deshmukh');
    await user.type(screen.getByLabelText('Email'), 'ravi@example.com');
    await user.type(screen.getByLabelText('Subject'), 'Delayed response');
    await user.type(screen.getByLabelText('Details'), 'I have not received a reply.');

    fireEvent.submit(container.querySelector('form')!);

    expect(window.location.href).toContain(
      encodeURIComponent('Grievance - Dindori Pranit Job Portal - Delayed response')
    );
    expect(window.location.href).toContain(encodeURIComponent('Subject: Delayed response'));
  });
});
