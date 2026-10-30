import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  TextBox,
  PasswordBox,
  SearchBox,
  TextArea,
  NumberInput,
  CurrencyInput,
  OTPInput,
} from './Inputs';

describe('TextBox', () => {
  it('renders a label and accepts typed input', async () => {
    render(<TextBox label="Email" placeholder="you@example.com" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('you@example.com');
    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('renders an error message when provided', () => {
    render(<TextBox label="Email" error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });
});

describe('PasswordBox', () => {
  it('defaults to a password input and toggles visibility', async () => {
    const { container } = render(<PasswordBox label="Password" defaultValue="secret" />);
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('renders an error message when provided', () => {
    render(<PasswordBox label="Password" error="Too short" />);
    expect(screen.getByText('Too short')).toBeInTheDocument();
  });
});

describe('SearchBox', () => {
  it('renders a label and a searchable input', async () => {
    render(<SearchBox label="Search" placeholder="Find a job" />);
    expect(screen.getByText('Search')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Find a job');
    await userEvent.type(input, 'engineer');
    expect(input).toHaveValue('engineer');
  });
});

describe('TextArea', () => {
  it('renders a label and input value', () => {
    render(<TextArea label="Notes" placeholder="Write here" />);
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Write here')).toBeInTheDocument();
  });

  it('does not show a counter unless showCount and maxLength are provided', () => {
    render(<TextArea placeholder="No counter" />);
    expect(screen.queryByText('0/4000')).not.toBeInTheDocument();
  });

  it('shows an initial counter and updates it as the user types', async () => {
    render(<TextArea showCount maxLength={4000} placeholder="Bio" />);
    expect(screen.getByText('0/4000')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('Bio'), 'abc');
    expect(screen.getByText('3/4000')).toBeInTheDocument();
  });

  it('reflects a controlled value in the counter', () => {
    render(<TextArea showCount maxLength={100} value="hello" onChange={() => {}} />);
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('renders an error message when provided', () => {
    render(<TextArea error="Too long" />);
    expect(screen.getByText('Too long')).toBeInTheDocument();
  });
});

describe('NumberInput', () => {
  it('renders a numeric input with a label', async () => {
    render(<NumberInput label="Age" placeholder="0" />);
    expect(screen.getByText('Age')).toBeInTheDocument();
    const input = screen.getByRole('spinbutton');
    await userEvent.type(input, '25');
    expect(input).toHaveValue(25);
  });

  it('renders an error message when provided', () => {
    render(<NumberInput error="Invalid number" />);
    expect(screen.getByText('Invalid number')).toBeInTheDocument();
  });
});

describe('CurrencyInput', () => {
  it('renders the default rupee symbol', () => {
    render(<CurrencyInput label="Salary" placeholder="0.00" />);
    expect(screen.getByText('₹')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });

  it('supports a custom currency symbol', () => {
    render(<CurrencyInput currencySymbol="$" />);
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.queryByText('₹')).not.toBeInTheDocument();
  });

  it('accepts typed input', async () => {
    render(<CurrencyInput placeholder="Amount" />);
    const input = screen.getByPlaceholderText('Amount');
    await userEvent.type(input, '1000');
    expect(input).toHaveValue('1000');
  });
});

describe('OTPInput', () => {
  it('renders the default number of inputs', () => {
    render(<OTPInput onChange={jest.fn()} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('renders a custom length of inputs', () => {
    render(<OTPInput length={6} onChange={jest.fn()} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('calls onChange with the entered digits and moves focus forward', async () => {
    const onChange = jest.fn();
    render(<OTPInput onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    await userEvent.type(inputs[0], '1');
    expect(onChange).toHaveBeenCalledWith('1');
    expect(inputs[1]).toHaveFocus();
  });

  it('ignores non-numeric input', async () => {
    const onChange = jest.fn();
    render(<OTPInput onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    await userEvent.type(inputs[0], 'a');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders an error message when provided', () => {
    render(<OTPInput onChange={jest.fn()} error="Invalid OTP" />);
    expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
  });
});
