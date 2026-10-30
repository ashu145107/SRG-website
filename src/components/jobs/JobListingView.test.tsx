/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { TextEncoder: NodeTextEncoder, TextDecoder: NodeTextDecoder } = require('util');
(global as any).TextEncoder = NodeTextEncoder;
(global as any).TextDecoder = NodeTextDecoder;

const userEvent = require('@testing-library/user-event').default;
const {
  authenticatedAuthState,
  renderWithProviders,
  screen,
  waitFor,
} = require('../../test/test-utils');

import { JobListingView } from './JobListingView';
import { useApplyJobMutation, useSearchJobsQuery } from '../../hooks/useJobQueries';

jest.mock('../../services/baseApi', () => {
  const { createApi, fetchBaseQuery } = require('@reduxjs/toolkit/query/react');
  const baseApi = createApi({
    reducerPath: 'srgApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost', fetchFn: () => Promise.resolve({ status: 200, data: {} }) as any }),
    tagTypes: [
      'User',
      'Job',
      'Company',
      'Candidate',
      'SHG',
      'Application',
      'Initiative',
      'Training',
      'SupportTicket',
    ],
    endpoints: () => ({}),
  });
  return {
    baseApi,
    getApiBaseUrl: () => 'http://localhost',
    getClientIp: async () => '127.0.0.1',
  };
});

jest.mock('../../hooks/useJobQueries', () => ({
  useSearchJobsQuery: jest.fn(),
  useApplyJobMutation: jest.fn(),
}));

const mockedSearchJobs = useSearchJobsQuery as jest.Mock;
const mockedApplyMutation = useApplyJobMutation as jest.Mock;
const mockApplyAsync = jest.fn();
const mockRefetch = jest.fn();

const jobs = [
  {
    id: 1,
    jobCode: 'JOB-1',
    profileHeader: 'Sales Executive',
    companyName: 'Acme Corp',
    workPlace: 'Nashik',
    skill: 'Tally',
    salary: 20000,
    salaryTo: 30000,
    experiance: 1,
    experianceTo: 3,
    expiryDate: '2026-12-31',
  },
  {
    id: 2,
    jobCode: 'JOB-2',
    profileHeader: 'Senior Accountant',
    companyName: 'Beta Ltd',
    workPlace: 'Pune',
    skill: 'Accounting',
    salary: 50000,
    salaryTo: 80000,
    experiance: 2,
    experianceTo: 5,
    expiryDate: '2026-11-30',
  },
];

const queryResult = (data: any[], totalCount: number, extra: Record<string, any> = {}) => ({
  data: { jobs: data, totalCount },
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: mockRefetch,
  ...extra,
});

beforeEach(() => {
  mockApplyAsync.mockResolvedValue({});
  mockedApplyMutation.mockReturnValue({ mutateAsync: mockApplyAsync, isPending: false });
  mockedSearchJobs.mockReturnValue(queryResult(jobs, jobs.length));
});

describe('JobListingView', () => {
  it('renders a loading skeleton while fetching', () => {
    mockedSearchJobs.mockReturnValue(queryResult([], 0, { isLoading: true }));

    const { container } = renderWithProviders(
      <JobListingView onViewDetails={jest.fn()} />
    );

    expect(container.querySelector('.animate-pulse')).toBeTruthy();
    expect(screen.queryByText('Sales Executive')).not.toBeInTheDocument();
  });

  it('renders the job rows with count and salary', () => {
    renderWithProviders(<JobListingView onViewDetails={jest.fn()} />);

    expect(screen.getByText('Sales Executive')).toBeInTheDocument();
    expect(screen.getByText('Senior Accountant')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('₹50000 - ₹80000')).toBeInTheDocument();
    expect(screen.getByText('Showing 2 of 2 vacancies')).toBeInTheDocument();
  });

  it('renders the empty state when there are no jobs', () => {
    mockedSearchJobs.mockReturnValue(queryResult([], 0));

    renderWithProviders(<JobListingView onViewDetails={jest.fn()} />);

    expect(screen.getByText(/No Jobs Found/)).toBeInTheDocument();
  });

  it('filters the list as the user types in the search box', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JobListingView onViewDetails={jest.fn()} />);

    await user.type(screen.getByPlaceholderText(/Search jobs/), 'Accountant');

    await waitFor(() =>
      expect(screen.queryByText('Sales Executive')).not.toBeInTheDocument()
    );
    expect(screen.getByText('Senior Accountant')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 2 vacancies')).toBeInTheDocument();
  });

  it('switches to the table layout when the Table button is clicked', async () => {
    renderWithProviders(<JobListingView onViewDetails={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Table/ }));

    expect(screen.getByText('Job Code')).toBeInTheDocument();
    expect(screen.getByText('Designation')).toBeInTheDocument();
  });

  it('quick-applies for a job via the mutation', async () => {
    renderWithProviders(<JobListingView onViewDetails={jest.fn()} />);

    const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
    expect(applyButtons).toHaveLength(2);

    await userEvent.click(applyButtons[0]);

    await waitFor(() => expect(mockApplyAsync).toHaveBeenCalledWith(['2']));
  });

  it('shows employer controls for employer/staff roles', () => {
    renderWithProviders(
      <JobListingView
        onViewDetails={jest.fn()}
        onEditJob={jest.fn()}
        onAddNewJob={jest.fn()}
      />,
      { preloadedState: { auth: authenticatedAuthState({ role: 'COMPANY' }) } }
    );

    expect(screen.getByText(/Managed Job Requirements/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Post Job/ })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Apply' })).not.toBeInTheDocument();
  });

  it('calls the refetch handler when Refresh is clicked', async () => {
    renderWithProviders(<JobListingView onViewDetails={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Refresh/ }));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('shows an API error alert when the query errors', () => {
    mockedSearchJobs.mockReturnValue(queryResult([], 0, { error: { status: 500 } }));

    renderWithProviders(<JobListingView onViewDetails={jest.fn()} />);

    expect(screen.getByText('API Error')).toBeInTheDocument();
  });
});
