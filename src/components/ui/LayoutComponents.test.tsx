/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Container,
  Section,
  PageHeader,
  Grid,
  ResponsiveDrawer,
  Sidebar,
  TopNavbar,
  Footer,
} from './LayoutComponents';

describe('Container', () => {
  it('renders children and merges className', () => {
    const { container } = render(<Container className="custom-class">Hello</Container>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('Section', () => {
  it('renders an id and children', () => {
    const { container } = render(<Section id="about">Body</Section>);
    expect(container.querySelector('section')).toHaveAttribute('id', 'about');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('renders the title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders subtitle and action children when provided', () => {
    render(
      <PageHeader title="Jobs" subtitle="All open roles">
        <button>Add Job</button>
      </PageHeader>
    );
    expect(screen.getByText('All open roles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Job' })).toBeInTheDocument();
  });

  it('omits subtitle when not provided', () => {
    render(<PageHeader title="Only Title" />);
    expect(screen.queryByText('All open roles')).not.toBeInTheDocument();
  });
});

describe('Grid', () => {
  it('renders children', () => {
    render(
      <Grid cols={2}>
        <span>One</span>
        <span>Two</span>
      </Grid>
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('falls back to the default column class for invalid cols', () => {
    const { container } = render(<Grid cols={99 as unknown as number}>X</Grid>);
    expect(container.firstChild).toHaveClass('grid-cols-1', 'md:grid-cols-3');
  });
});

describe('ResponsiveDrawer', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ResponsiveDrawer isOpen={false} onClose={jest.fn()}>
        Content
      </ResponsiveDrawer>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and children when open', () => {
    render(
      <ResponsiveDrawer isOpen onClose={jest.fn()} title="Nav">
        Drawer content
      </ResponsiveDrawer>
    );
    expect(screen.getByText('Nav')).toBeInTheDocument();
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('uses the default "Menu" title', () => {
    render(
      <ResponsiveDrawer isOpen onClose={jest.fn()}>
        Content
      </ResponsiveDrawer>
    );
    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('calls onClose from the backdrop and the close button', async () => {
    const onClose = jest.fn();
    const { container } = render(
      <ResponsiveDrawer isOpen onClose={onClose} title="Nav">
        Content
      </ResponsiveDrawer>
    );
    await userEvent.click(container.querySelector('.bg-black\\/40') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(container.querySelector('button') as HTMLButtonElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('Sidebar / TopNavbar / Footer', () => {
  it('Sidebar renders children', () => {
    render(<Sidebar>Side</Sidebar>);
    expect(screen.getByText('Side')).toBeInTheDocument();
  });

  it('TopNavbar renders children', () => {
    render(<TopNavbar>Top</TopNavbar>);
    expect(screen.getByText('Top')).toBeInTheDocument();
  });

  it('Footer renders children', () => {
    render(<Footer>Bottom</Footer>);
    expect(screen.getByText('Bottom')).toBeInTheDocument();
  });
});
