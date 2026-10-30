import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DataTable,
  ServerSideTable,
  Card,
  StatisticCard,
  EmptyState,
  Badge,
  Tag,
  Timeline,
} from './DataComponents';

describe('Card', () => {
  it('renders a title and children', () => {
    render(
      <Card title="Profile">
        <p>Body content</p>
      </Card>
    );
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('omits the heading when no title is given and passes className through', () => {
    const { container } = render(
      <Card className="custom-card">
        <p>Only body</p>
      </Card>
    );
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass('custom-card');
  });
});

describe('StatisticCard', () => {
  it('renders title, value and trend', () => {
    render(<StatisticCard title="Total Jobs" value={42} trend="+5%" />);
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    render(<StatisticCard title="Users" value={7} icon={<span data-testid="stat-icon">i</span>} />);
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="Nothing here" desc="Come back later" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Come back later')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders children with the primary theme by default', () => {
    render(<Badge>New</Badge>);
    const el = screen.getByText('New');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('bg-orange-50');
  });

  it('applies the success theme variant', () => {
    render(<Badge type="success">Done</Badge>);
    expect(screen.getByText('Done')).toHaveClass('bg-emerald-50');
  });

  it('applies the danger theme variant', () => {
    render(<Badge type="danger">Fail</Badge>);
    expect(screen.getByText('Fail')).toHaveClass('bg-rose-50');
  });
});

describe('Tag', () => {
  it('renders its children', () => {
    render(<Tag>Engineering</Tag>);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });
});

describe('Timeline', () => {
  it('renders each item title, description and time', () => {
    render(
      <Timeline
        items={[
          { title: 'Applied', time: '10:00', desc: 'Application received' },
          { title: 'Reviewed', time: '11:00' },
        ]}
      />
    );
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Application received')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('Reviewed')).toBeInTheDocument();
    expect(screen.getByText('11:00')).toBeInTheDocument();
  });
});

describe('DataTable', () => {
  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'role',
      header: 'Role',
      render: (row: { id: number; name: string; role: string }) => <strong>{row.role.toUpperCase()}</strong>,
    },
  ];
  const data = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
  ];

  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument();
  });

  it('renders row values using defaults and custom renderers', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ADMIN').length).toBeGreaterThan(0);
  });

  it('calls onRowClick with the row when a row is clicked', async () => {
    const onRowClick = jest.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);
    await userEvent.click(screen.getAllByText('Alice')[0]);
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('renders the empty state when there is no data', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getAllByText('No data available').length).toBeGreaterThan(0);
    expect(screen.getAllByText('No data records currently found here.').length).toBeGreaterThan(0);
  });
});

describe('ServerSideTable', () => {
  it('shows the loader while loading', () => {
    render(<ServerSideTable columns={[{ key: 'name', header: 'Name' }]} data={[]} loading />);
    expect(screen.getByText('Shree Swami Samarth...')).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Name' })).not.toBeInTheDocument();
  });

  it('renders the underlying table when not loading', () => {
    render(<ServerSideTable columns={[{ key: 'name', header: 'Name' }]} data={[{ id: 1, name: 'Alice' }]} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
  });
});
