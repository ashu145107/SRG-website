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
  useGetJobRequirementByCodeQuery: jest.fn(),
}));

const mockedDetailQuery = useGetRequirementDetailQuery as jest.Mock;
const mockedRequirementByCodeQuery = require('../../services/adminApi').useGetJobRequirementByCodeQuery as jest.Mock;
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
  expiryDate: '2026-12-31T23:59:59.000Z',
};

const detailData = {
  job,
  items: [
    {
      id: 1,
      candidateName: 'Ramesh Patil',
      candidatePhone: '9876543210',
      status: 'Applied',
      appliedAt: '2026-01-10T12:30:00.000Z',
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
  mockedRequirementByCodeQuery.mockReturnValue(queryResult(undefined));
});

describe('JobRequirementDetailView', () => {
  it('uses the exact requirement ID for the applications query', () => {
    renderWithProviders(<JobRequirementDetailView requirementId={1482} />);

    expect(mockedDetailQuery).toHaveBeenCalledWith(
      1482,
      expect.objectContaining({ skip: false })
    );
  });

  it('loads the full requirement by job code and displays readable fields only', async () => {
    mockedRequirementByCodeQuery.mockReturnValue(queryResult({
      requirementId: 2575,
      profileHeader: 'Back office sales executive',
      skill: 'Sales skill, Lead generation',
      experiance: 1,
      experianceTo: 5,
      workPlace: 'Pune',
      jobCode: 'RG05703',
      education: 'B.A',
      specialization: 'Other',
      noOfVacancy: 1,
      salary: 15000,
      salaryTo: 18000,
      companyName: 'SAMARTH GLOTECH AUTOMATION PVT.LTD',
      email: 'ssamarth.service@gmail.com',
      expiryDate: '2026-01-31T00:00:00',
      roleType: null,
      interviewMode: null,
      shiftType: null,
      workMode: null,
      salaryPeriod: null,
      weeklyOff: null,
      isActive: true,
    }));

    renderWithProviders(<JobRequirementDetailView requirementId={2575} jobCode="RG05703" />);

    expect(mockedRequirementByCodeQuery).toHaveBeenCalledWith(
      'RG05703',
      expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
    );
    expect(screen.getByText('Back office sales executive')).toBeInTheDocument();

    expect(screen.queryByText('B.A')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /View more/i }));

    expect(screen.getByText('B.A')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getAllByText('2026-01-31')).toHaveLength(2);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    expect(screen.queryByText('2575')).not.toBeInTheDocument();
    expect(screen.queryByText(/requirementId|shiftTypeId|workModeId|salaryPeriodId/i)).not.toBeInTheDocument();
  });

  it('does not fall back to stale application-response job details when a job code is provided', () => {
    renderWithProviders(<JobRequirementDetailView requirementId={77} jobCode="JOB-77" />);

    expect(screen.queryByText('Warehouse Supervisor')).not.toBeInTheDocument();
    expect(screen.queryByText('Supervise warehouse operations.')).not.toBeInTheDocument();
  });

  it('always renders the page heading', () => {
    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.getByText('Job Requirement Details')).toBeInTheDocument();
    expect(screen.queryByText(/Requirement ID:/)).not.toBeInTheDocument();
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
      queryResult(undefined, { error: { status: 500, data: { message: 'Requirement unavailable.' } } })
    );

    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.getByText(/Failed to load requirement details/)).toBeInTheDocument();
    expect(screen.getByText(/"message": "Requirement unavailable\."/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Try Again/ }));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('renders the requirement summary and applications table', () => {
    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.queryByText(/Job code:\s*JOB-77/)).not.toBeInTheDocument();
    expect(screen.getByText('Warehouse Supervisor')).toBeInTheDocument();
    expect(screen.getByText('Inventory, Forklift')).toBeInTheDocument();
    expect(screen.getByText('2 - 5 years')).toBeInTheDocument();
    expect(screen.getByText('Nashik')).toBeInTheDocument();
    expect(screen.getByText('Supervise warehouse operations.')).toBeInTheDocument();
    expect(screen.queryByText('Acme Logistics')).not.toBeInTheDocument();
    expect(screen.queryByText('2026-12-31')).not.toBeInTheDocument();

    expect(screen.getByText(/Applications for this Requirement/)).toBeInTheDocument();
    expect(screen.getByText('Ramesh Patil')).toBeInTheDocument();
    expect(screen.getByText('2026-01-10')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
    expect(screen.getByText('Shortlisted')).toBeInTheDocument();
  });

  it('searches applications and supports selecting multiple statuses', async () => {
    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    await userEvent.type(screen.getByRole('searchbox', { name: /Search candidates/i }), 'Suresh');
    expect(screen.getByText('Suresh Joshi')).toBeInTheDocument();
    expect(screen.queryByText('Ramesh Patil')).not.toBeInTheDocument();

    await userEvent.clear(screen.getByRole('searchbox', { name: /Search candidates/i }));
    const searchbox = screen.getByRole('searchbox', { name: /Search candidates/i });
    const filterButton = screen.getByRole('button', { name: /Filter application status/i });
    expect(searchbox.parentElement).toContainElement(filterButton);
    await userEvent.click(filterButton);

    const applyButton = screen.getByRole('button', { name: 'Apply' });
    expect(applyButton).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Withdrawn' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'On Hold' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Applied' }));
    expect(applyButton).toBeEnabled();
    expect(screen.getByText('Suresh Joshi')).toBeInTheDocument();

    await userEvent.click(applyButton);
    expect(screen.queryByRole('checkbox', { name: 'Applied' })).not.toBeInTheDocument();
    const appliedPill = screen.getByRole('button', { name: 'Remove Applied filter' }).parentElement;
    expect(appliedPill).toHaveTextContent('Applied');
    expect(screen.getByText('Ramesh Patil')).toBeInTheDocument();
    expect(screen.queryByText('Suresh Joshi')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Filter application status/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Shortlisted' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByText('Ramesh Patil')).toBeInTheDocument();
    expect(screen.getByText('Suresh Joshi')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove Applied filter' }));
    expect(screen.queryByText('Ramesh Patil')).not.toBeInTheDocument();
    expect(screen.getByText('Suresh Joshi')).toBeInTheDocument();
  });

  it('discards un-applied status changes when filter is cancelled', async () => {
    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    await userEvent.click(screen.getByRole('button', { name: /Filter application status/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Applied' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Ramesh Patil')).toBeInTheDocument();
    expect(screen.getByText('Suresh Joshi')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Applied' })).not.toBeInTheDocument();
  });

  it('shows additional requirement fields in a responsive dialog on demand', async () => {
    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    await userEvent.click(screen.getByRole('button', { name: /View more/i }));

    const dialog = screen.getByRole('dialog', { name: /Requirement details/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getAllByText('Acme Logistics').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2026-12-31').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹20,000 - ₹30,000').length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('button', { name: /Close requirement details/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows an empty state when there are no applications', () => {
    mockedDetailQuery.mockReturnValue(
      queryResult({
        job,
        items: [],
        totalCount: 0,
      })
    );

    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(
      screen.getByText(/No applications found for this requirement yet/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/"value": \[\]/)).not.toBeInTheDocument();
  });

  it('shows an updating indicator while refetching', () => {
    mockedDetailQuery.mockReturnValue(
      queryResult(detailData, { isFetching: true })
    );

    renderWithProviders(<JobRequirementDetailView requirementId={77} />);

    expect(screen.getByText(/Updating/)).toBeInTheDocument();
  });

  it('renders applicant cards instead of the table on mobile', async () => {
    const originalMatchMedia = (window as any).matchMedia;
    (window as any).matchMedia = jest.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    try {
      renderWithProviders(<JobRequirementDetailView requirementId={1482} />);

      expect(await screen.findByText('#1')).toBeInTheDocument();
      expect(screen.getAllByText('Ramesh Patil').length).toBe(1);
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    } finally {
      (window as any).matchMedia = originalMatchMedia;
    }
  });
});
