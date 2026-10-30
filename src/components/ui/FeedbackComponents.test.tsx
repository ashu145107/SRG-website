import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert, Toast, Modal, ConfirmDialog, Loader, Skeleton } from './FeedbackComponents';

describe('Alert', () => {
  it('renders the message and optional title', () => {
    render(<Alert title="Heads up" message="Something happened" />);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('defaults to the info theme', () => {
    const { container } = render(<Alert message="Info message" />);
    expect(container.firstChild).toHaveClass('bg-blue-50');
  });

  it('applies the success theme', () => {
    const { container } = render(<Alert type="success" message="Saved" />);
    expect(container.firstChild).toHaveClass('bg-emerald-50');
  });

  it('applies the danger theme', () => {
    const { container } = render(<Alert type="danger" message="Failed" />);
    expect(container.firstChild).toHaveClass('bg-red-50');
  });

  it('renders a close button and calls onClose only when provided', async () => {
    const onClose = jest.fn();
    const { rerender } = render(<Alert message="Dismissable" onClose={onClose} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<Alert message="Static" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the message', () => {
    render(<Toast message="Saved successfully" onClose={jest.fn()} />);
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('falls back to a success message when none is provided', () => {
    render(<Toast type="success" message={null as unknown as string} onClose={jest.fn()} />);
    expect(screen.getByText('Operation completed.')).toBeInTheDocument();
  });

  it('falls back to an error message when none is provided', () => {
    render(<Toast type="error" message={null as unknown as string} onClose={jest.fn()} />);
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('auto-dismisses after the duration', () => {
    const onClose = jest.fn();
    render(<Toast message="Saved" onClose={onClose} durationMs={3000} />);
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const onClose = jest.fn();
    render(<Toast message="Saved" onClose={onClose} durationMs={100000} />);
    await user.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Edit">
        <p>Body</p>
      </Modal>
    );
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('renders title and children when open', () => {
    render(
      <Modal isOpen onClose={jest.fn()} title="Edit">
        <p>Body</p>
      </Modal>
    );
    expect(screen.getByRole('heading', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen onClose={onClose} title="Edit">
        <p>Body</p>
      </Modal>
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = jest.fn();
    const { container } = render(
      <Modal isOpen onClose={onClose} title="Edit">
        <p>Body</p>
      </Modal>
    );
    const backdrop = container.querySelector('[class*="bg-black/50"]') as HTMLElement;
    expect(backdrop).not.toBeNull();
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies the maxWidthClass prop', () => {
    const { container } = render(
      <Modal isOpen onClose={jest.fn()} title="Edit" maxWidthClass="max-w-3xl">
        <p>Body</p>
      </Modal>
    );
    expect(container.querySelector('.max-w-3xl')).toBeInTheDocument();
  });
});

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmDialog isOpen={false} onClose={jest.fn()} onConfirm={jest.fn()} title="Delete" message="Sure?" />);
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('renders the title, message and default button text when open', () => {
    render(<ConfirmDialog isOpen onClose={jest.fn()} onConfirm={jest.fn()} title="Delete" message="Are you sure?" />);
    expect(screen.getByRole('heading', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('supports custom confirm and cancel text', () => {
    render(
      <ConfirmDialog
        isOpen
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        title="Delete"
        message="Sure?"
        confirmText="Yes, delete"
        cancelText="No"
      />
    );
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('calls onConfirm and onClose when confirming', async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(<ConfirmDialog isOpen onClose={onClose} onConfirm={onConfirm} title="Delete" message="Sure?" />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls only onClose when cancelling', async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();
    render(<ConfirmDialog isOpen onClose={onClose} onConfirm={onConfirm} title="Delete" message="Sure?" />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Loader', () => {
  it('renders the brand text', () => {
    render(<Loader />);
    expect(screen.getByText('Shree Swami Samarth...')).toBeInTheDocument();
  });

  it('renders in fullScreen mode', () => {
    const { container } = render(<Loader fullScreen />);
    expect(screen.getByText('Shree Swami Samarth...')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('fixed');
  });
});

describe('Skeleton', () => {
  it('renders with the pulse animation and custom className', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('h-4');
    expect(container.firstChild).toHaveClass('w-10');
  });
});
