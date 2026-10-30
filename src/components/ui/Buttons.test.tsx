import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  IconButton,
  LinkButton,
  LoadingButton,
} from './Buttons';

describe('PrimaryButton (smoke test)', () => {
  it('renders its children', () => {
    render(<PrimaryButton>Sign In</PrimaryButton>);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('fires onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<PrimaryButton onClick={onClick}>Click me</PrimaryButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled while loading', () => {
    render(<PrimaryButton loading>Save</PrimaryButton>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

describe('SecondaryButton', () => {
  it('renders its children', () => {
    render(<SecondaryButton>Cancel</SecondaryButton>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('fires onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<SecondaryButton onClick={onClick}>Cancel</SecondaryButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled while loading', () => {
    render(<SecondaryButton loading>Loading</SecondaryButton>);
    expect(screen.getByRole('button', { name: 'Loading' })).toBeDisabled();
  });
});

describe('DangerButton', () => {
  it('renders its children', () => {
    render(<DangerButton>Delete</DangerButton>);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('fires onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<DangerButton onClick={onClick}>Delete</DangerButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled while loading', () => {
    render(<DangerButton loading>Delete</DangerButton>);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});

describe('IconButton', () => {
  it('renders the provided icon', () => {
    render(<IconButton icon={<span data-testid="icon-glyph">★</span>} aria-label="star" />);
    expect(screen.getByTestId('icon-glyph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'star' })).toBeInTheDocument();
  });

  it('fires onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<IconButton icon={<span>★</span>} aria-label="star" onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: 'star' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('LinkButton', () => {
  it('renders its children', () => {
    render(<LinkButton>Learn more</LinkButton>);
    expect(screen.getByRole('button', { name: 'Learn more' })).toBeInTheDocument();
  });

  it('fires onClick when pressed', async () => {
    const onClick = jest.fn();
    render(<LinkButton onClick={onClick}>Learn more</LinkButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Learn more' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('LoadingButton', () => {
  it('shows the default loadingText while loading and is disabled', () => {
    render(<LoadingButton>Submit</LoadingButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });

  it('shows a custom loadingText while loading', () => {
    render(<LoadingButton loadingText="Saving...">Submit</LoadingButton>);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders children and is enabled when not loading', () => {
    render(<LoadingButton loading={false}>Submit</LoadingButton>);
    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeEnabled();
    expect(screen.queryByText('Please wait...')).not.toBeInTheDocument();
  });
});
