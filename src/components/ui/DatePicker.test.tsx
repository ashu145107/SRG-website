/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test/test-utils';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('lets users select a historical year directly and choose a date', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWithProviders(
      <DatePicker name="birthDate" value="" onChange={onChange} aria-label="Birth date" />
    );

    await user.click(screen.getByRole('button', { name: 'Choose Birth date' }));
    const calendar = screen.getByRole('dialog', { name: 'Choose a date' });
    expect(calendar.parentElement).toBe(document.body);
    expect(calendar).toHaveStyle({ position: 'fixed' });
    await user.selectOptions(screen.getByRole('combobox', { name: 'Year' }), '1994');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Month' }), '5');
    await user.click(screen.getByRole('button', { name: 'Select 1994-06-15' }));

    expect(onChange).toHaveBeenCalledWith('1994-06-15');
    expect(screen.queryByRole('dialog', { name: 'Choose a date' })).not.toBeInTheDocument();
  });

  it('disables dates outside the supplied range', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DatePicker
        name="employmentDate"
        value="2024-06-15"
        onChange={jest.fn()}
        min="2024-06-10"
        max="2024-06-20"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Choose employmentDate' }));

    expect(screen.getByRole('button', { name: 'Select 2024-06-09' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Select 2024-06-21' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Select 2024-06-15' })).toBeEnabled();
  });
});
