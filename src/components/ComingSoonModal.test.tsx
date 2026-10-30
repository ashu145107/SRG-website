/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComingSoonModal, ComingSoonContent } from './ComingSoonModal';

const Icon = ({ className }: { className?: string }) => (
  <svg data-testid="modal-icon" className={className} />
);

const content: ComingSoonContent = {
  labelEn: 'Skill College',
  labelMr: 'कौशल्य महाविद्यालय',
  titleEn: 'Skill College',
  titleMr: 'कौशल्य महाविद्यालय',
  bodyEn: 'We are building this feature for you.',
  bodyMr: 'आम्ही हे वैशिष्ट्य तुमच्यासाठी तयार करत आहोत.',
  icon: Icon,
};

describe('ComingSoonModal', () => {
  it('renders nothing when closed', () => {
    render(<ComingSoonModal isOpen={false} onClose={jest.fn()} content={content} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders nothing when content is null', () => {
    render(<ComingSoonModal isOpen onClose={jest.fn()} content={null} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the content in a portal when open', () => {
    render(<ComingSoonModal isOpen onClose={jest.fn()} content={content} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Skill College')).toBeInTheDocument();
    expect(screen.getByText('We are building this feature for you.')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.getByText('Got it')).toBeInTheDocument();
    expect(screen.getByTestId('modal-icon')).toBeInTheDocument();
  });

  it('locks body scroll while open and restores it on unmount', () => {
    const { unmount } = render(<ComingSoonModal isOpen onClose={jest.fn()} content={content} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = jest.fn();
    render(<ComingSoonModal isOpen onClose={onClose} content={content} />);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the "Got it" button is clicked', async () => {
    const onClose = jest.fn();
    render(<ComingSoonModal isOpen onClose={onClose} content={content} />);

    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = jest.fn();
    render(<ComingSoonModal isOpen onClose={onClose} content={content} />);

    const backdrop = screen.getByRole('dialog').firstElementChild as HTMLElement;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    render(<ComingSoonModal isOpen onClose={onClose} content={content} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape while closed', () => {
    const onClose = jest.fn();
    render(<ComingSoonModal isOpen={false} onClose={onClose} content={content} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
