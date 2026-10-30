/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { TextEncoder: NodeTextEncoder, TextDecoder: NodeTextDecoder } = require('util');
(global as any).TextEncoder = NodeTextEncoder;
(global as any).TextDecoder = NodeTextDecoder;

const userEvent = require('@testing-library/user-event').default;
const { renderWithProviders, screen } = require('../../test/test-utils');

import { JobRequirementDetailView } from './JobRequirementDetailView';
import { useGetRequirementDetailQuery } from '../../services/adminApi';

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

jest.mock('../../services/adminApi', () => ({
  useGetRequirementDetailQuery: jest.fn(),
}));

const mockedDetailQuery = useGetRequirementDetailQuery as jest.Mock;
const mockRefetch = jest.fn();

const job = {
  jobCode: 'JOB-77',
  profileHeader: 'Warehouse Supervisor',
  companyName: 'Acme Logistics',
  workPlace: 'Nashik',
  skill: 'Inventory, Forklift',
  noOfVacancy: 4,
  experiance: 2,
  experianceTo: 5,
  salary: 20000,
  salaryTo: 30000,
  jobDiscription: 'Supervise warehouse operations.',
  expiryDate: '2026-12-31',
};

const detailData = {
  job,
  items: [
    {
      id: 1,
      candidateName: 'Ramesh Patil',
      candidatePhone: '9876543210',
      status: 'Applied',
      appliedAt: '2026-01-10',
    },
    {
      id: 2,
      candidateName: 'Suresh Joshi',
      candidatePhone: '9123456780',
      status: 'Shortlisted',
      appliedAt: '2026-01-11',
    },
  ],
  totalCount: 2,
};

const queryResult = (data: any, extra: Record<string, any> = {}) => ({
  data,
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: mockRefetch,
  ...extra,
});

beforeEach(() => {
  mockedDetailQuery.mockReturnValue(queryResult(detailData));
});

describe('JobRequirementDetailView', () => {
  it('always renders the page heading', () => {
    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.getByText('Job Requirement Details')).toBeInTheDocument();
    expect(screen.getByText(/Requirement ID:/)).toBeInTheDocument();
  });

  it('renders a loader while loading', () => {
    mockedDetailQuery.mockReturnValue(
      queryResult(undefined, { isLoading: true })
    );

    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.getByText(/Shree Swami Samarth/)).toBeInTheDocument();
    expect(screen.queryByText('Requirement Summary')).not.toBeInTheDocument();
  });

  it('renders an error state and retries on demand', async () => {
    mockedDetailQuery.mockReturnValue(
      queryResult(undefined, { error: { status: 500 } })
    );

    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.getByText(/Failed to load requirement details/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Try Again/ }));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders the requirement summary and applications table', () => {
    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.getByText('JOB-77')).toBeInTheDocument();
    expect(screen.getByText('Warehouse Supervisor')).toBeInTheDocument();
    expect(screen.getByText('Acme Logistics')).toBeInTheDocument();
    expect(screen.getByText('₹20,000 - ₹30,000 Monthly')).toBeInTheDocument();
    expect(screen.getByText('Inventory, Forklift')).toBeInTheDocument();

    expect(screen.getByText(/Applications for this Requirement/)).toBeInTheDocument();
    expect(screen.getByText('Ramesh Patil')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
    expect(screen.getByText('Shortlisted')).toBeInTheDocument();
  });

  it('shows an empty state when there are no applications', () => {
    mockedDetailQuery.mockReturnValue(
      queryResult({ job, items: [], totalCount: 0 })
    );

    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(
      screen.getByText(/No applications found for this requirement yet/)
    ).toBeInTheDocument();
  });

  it('shows an updating indicator while refetching', () => {
    mockedDetailQuery.mockReturnValue(
      queryResult(detailData, { isFetching: true })
    );

    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.getByText(/Updating/)).toBeInTheDocument();
  });
});
