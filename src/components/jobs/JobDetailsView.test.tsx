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
  defaultAuthState,
  renderWithProviders,
  screen,
  waitFor,
} = require('../../test/test-utils');

import { JobDetailsView } from './JobDetailsView';
import { useApplyJobMutation, useJobDetailsQuery } from '../../hooks/useJobQueries';

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
  useJobDetailsQuery: jest.fn(),
  useApplyJobMutation: jest.fn(),
}));

const mockedUseJobDetails = useJobDetailsQuery as jest.Mock;
const mockedApplyMutation = useApplyJobMutation as jest.Mock;
const mockApplyAsync = jest.fn();

const jobData = {
  id: 10,
  jobCode: 'JOB-10',
  roleTypeId: 1,
  jobDesignation: 'Senior Accountant',
  profileHeader: 'Hiring Senior Accountant',
  jobLocation: 'Nashik',
  workPlace: 'Head Office',
  salary: 50000,
  salaryTo: 80000,
  experiance: 3,
  experianceTo: 6,
  noOfVacancy: 2,
  jobDiscription: 'Manage accounts and GST filings for the company.',
  skill: 'Tally, GST, Excel',
  certificationsRequired: 'Tally Certified',
  benefits: 'Health Insurance',
  educationId: 3,
  industryTypeId: 1,
  salaryPeriodId: 1,
  genderPreference: 'Any',
  ageRange: '25-40',
  weeklyOffId: 1,
  shiftTypeId: 1,
  interviewModeId: 1,
  interviewLocation: 'Corporate Office',
  expiryDate: '2026-12-31T00:00:00.000Z',
  postingNotes: 'Urgent requirement',
};

beforeEach(() => {
  mockApplyAsync.mockResolvedValue({ message: 'Application submitted' });
  mockedApplyMutation.mockReturnValue({ mutateAsync: mockApplyAsync, isPending: false });
  mockedUseJobDetails.mockReturnValue({
    data: jobData,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  });
});

describe('JobDetailsView', () => {
  it('renders a loading skeleton while fetching', () => {
    mockedUseJobDetails.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = renderWithProviders(<JobDetailsView jobId={10} />);

    expect(screen.queryByText('Senior Accountant')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders the error state and retries on demand', async () => {
    const refetch = jest.fn();
    mockedUseJobDetails.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500 },
      refetch,
    });

    renderWithProviders(<JobDetailsView jobId={10} />);

    expect(screen.getByText(/Failed to Load Job Details/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Retry/ }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders the job details including salary, code and role', () => {
    renderWithProviders(<JobDetailsView jobId={10} />, {
      preloadedState: { auth: authenticatedAuthState() },
    });

    expect(screen.getByText('Senior Accountant')).toBeInTheDocument();
    expect(screen.getByText(/CODE: JOB-10/)).toBeInTheDocument();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(screen.getByText('SALARY RANGE')).toBeInTheDocument();
    expect(screen.getAllByText('₹50,000 - ₹80,000').length).toBeGreaterThan(0);
    expect(screen.getByText('Nashik')).toBeInTheDocument();
    expect(screen.getByText('Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('2026-12-31')).toBeInTheDocument();
    expect(screen.queryByText(/12\/31\/2026/)).not.toBeInTheDocument();
  });

  it('submits an application after confirming, when authenticated', async () => {
    renderWithProviders(<JobDetailsView jobId={10} />, {
      preloadedState: { auth: authenticatedAuthState() },
    });

    const applyButtons = screen.getAllByRole('button', { name: /Apply/ });
    expect(applyButtons.length).toBeGreaterThan(0);
    expect(applyButtons[0]).toHaveClass('cursor-pointer');
    await userEvent.click(applyButtons[0]);

    expect(
      await screen.findByText(/Confirm Job Application/)
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Yes, Apply/ }));

    await waitFor(() => expect(mockApplyAsync).toHaveBeenCalledWith(['10']));
    expect(await screen.findByText('Application submitted')).toBeInTheDocument();
  });

  it('prompts the user to log in when applying while unauthenticated', async () => {
    renderWithProviders(<JobDetailsView jobId={10} />, {
      preloadedState: { auth: defaultAuthState },
    });

    const applyButtons = screen.getAllByRole('button', { name: /Apply/ });
    await userEvent.click(applyButtons[0]);

    expect(
      await screen.findByText(/Please log in first to apply/)
    ).toBeInTheDocument();
    expect(mockApplyAsync).not.toHaveBeenCalled();
  });

  it('hides the apply controls for employer/staff roles', () => {
    renderWithProviders(<JobDetailsView jobId={10} />, {
      preloadedState: { auth: authenticatedAuthState({ role: 'COMPANY' }) },
    });

    expect(screen.queryByRole('button', { name: /Apply/ })).not.toBeInTheDocument();
  });
});
