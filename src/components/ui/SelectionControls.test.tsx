/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, Radio, ToggleSwitch, Dropdown, MultiSelect } from './SelectionControls';

describe('Checkbox', () => {
  it('renders the label and fires onChange when toggled', async () => {
    const onChange = jest.fn();
    render(<Checkbox label="Accept terms" onChange={onChange} />);
    const input = screen.getByLabelText('Accept terms') as HTMLInputElement;
    await userEvent.click(input);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(true);
  });
});

describe('Radio', () => {
  it('renders the label and can be selected', async () => {
    render(<Radio name="grp" label="Option A" value="a" />);
    const input = screen.getByLabelText('Option A') as HTMLInputElement;
    expect(input).toHaveAttribute('type', 'radio');
    await userEvent.click(input);
    expect(input.checked).toBe(true);
  });
});

describe('ToggleSwitch', () => {
  it('calls onToggle with the new checked value', async () => {
    const onToggle = jest.fn();
    render(<ToggleSwitch label="Notifications" checked={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('renders the label when provided', () => {
    render(<ToggleSwitch label="Dark mode" checked onToggle={jest.fn()} />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('omits the label when not provided', () => {
    render(<ToggleSwitch checked onToggle={jest.fn()} />);
    expect(screen.queryByText('Dark mode')).not.toBeInTheDocument();
  });
});

describe('Dropdown', () => {
  const options = [
    { value: '', label: '-- Select --' },
    { value: 'a', label: 'Apple' },
    { value: 'b', label: 'Banana' },
  ];

  it('renders label and all options', () => {
    render(<Dropdown label="Fruit" options={options} />);
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Banana' })).toBeInTheDocument();
  });

  it('fires onChange when a new option is selected', async () => {
    const onChange = jest.fn();
    render(<Dropdown label="Fruit" options={options} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox'), 'b');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('b');
  });

  it('renders an error message', () => {
    render(<Dropdown label="Fruit" options={options} error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});

describe('MultiSelect', () => {
  const options = [
    { value: 'a', label: 'Apple' },
    { value: 'b', label: 'Banana' },
  ];

  it('shows the placeholder when nothing is selected', () => {
    render(<MultiSelect options={options} selectedValues={[]} onChange={jest.fn()} />);
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  it('uses a custom placeholder', () => {
    render(
      <MultiSelect options={options} selectedValues={[]} onChange={jest.fn()} placeholder="Pick fruit" />
    );
    expect(screen.getByText('Pick fruit')).toBeInTheDocument();
  });

  it('adds a value when an unselected option is clicked', async () => {
    const onChange = jest.fn();
    render(<MultiSelect options={options} selectedValues={['a']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Banana' }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('removes a value when a selected option is clicked', async () => {
    const onChange = jest.fn();
    render(<MultiSelect options={options} selectedValues={['a', 'b']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Apple' }));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });
});
