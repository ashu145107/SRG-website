/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test/polyfills';
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import { AdminJobRequirements } from './AdminJobRequirements';

jest.mock('../services/baseApi', () => ({
  baseApi: {
    reducerPath: 'srgApi',
    reducer: (state: unknown = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
    util: { resetApiState: () => ({ type: 'srgApi/resetApiState' }) },
  },
  getApiBaseUrl: () => '',
  getClientIp: async () => '127.0.0.1',
}));

jest.mock('../services/adminApi', () => ({
  useGetAdminJobRequirementsQuery: jest.fn(),
  useGetJobRequirementByCodeQuery: jest.fn(),
}));

jest.mock('./jobs/EditJobForm', () => ({
  EditJobForm: jest.fn(() => <div>Edit Job Form</div>),
}));

import {
  useGetAdminJobRequirementsQuery,
  useGetJobRequirementByCodeQuery,
} from '../services/adminApi';
import { EditJobForm } from './jobs/EditJobForm';
const mockUseGetAdminJobRequirementsQuery = useGetAdminJobRequirementsQuery as jest.Mock;
const mockUseGetJobRequirementByCodeQuery = useGetJobRequirementByCodeQuery as jest.Mock;
const mockEditJobForm = EditJobForm as jest.Mock;

const baseResult = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  error: undefined,
  refetch: jest.fn(),
  ...overrides,
});

describe('AdminJobRequirements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetJobRequirementByCodeQuery.mockReturnValue(baseResult());
  });

  it('renders loading state', () => {
    mockUseGetAdminJobRequirementsQuery.mockReturnValue(baseResult({ isLoading: true }));

    renderWithProviders(<AdminJobRequirements />);
    expect(screen.getByText(/Shree Swami Samarth/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseGetAdminJobRequirementsQuery.mockReturnValue(
      baseResult({ error: { message: 'Failed' } })
    );

    renderWithProviders(<AdminJobRequirements />);
    expect(screen.getByText(/Failed to load job requirements from API/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockUseGetAdminJobRequirementsQuery.mockReturnValue(
      baseResult({ data: { items: [], totalCount: 0 } })
    );

    renderWithProviders(<AdminJobRequirements />);
    expect(screen.getByText(/No job requirements found/i)).toBeInTheDocument();
  });

  it('renders job requirements list', async () => {
    mockUseGetAdminJobRequirementsQuery.mockReturnValue(
      baseResult({
        data: {
          items: [
            {
              id: 1,
              jobCode: 'JOB001',
              profileHeader: 'Software Engineer',
              companyName: 'Tech Corp',
              workPlace: 'Pune',
              skill: 'React, Node',
            },
          ],
          totalCount: 1,
        },
      })
    );

    renderWithProviders(<AdminJobRequirements />);

    await waitFor(() => {
      expect(screen.getByText('JOB001')).toBeInTheDocument();
    });
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    const requirementLink = screen.getByRole('link', { name: 'JOB001' });
    expect(requirementLink).not.toHaveAttribute('target');
    expect(requirementLink).toHaveAttribute('href', '/dashboard');
    expect(requirementLink.getAttribute('href')).not.toContain('JOB001');
  });

  it('opens view modal on eye click', async () => {
    mockUseGetJobRequirementByCodeQuery.mockReturnValue(
      baseResult({
        data: {
          jobCode: 'JOB001',
          profileHeader: 'Developer',
          skill: 'React',
          experiance: 1,
          experianceTo: 4,
          workPlace: 'Pune',
          education: 'B.A',
          specialization: 'Other',
          noOfVacancy: 2,
          salary: 20000,
          salaryTo: 30000,
          companyName: 'Tech Corp',
          email: 'jobs@example.com',
          expiryDate: '2026-09-16T00:00:00.000Z',
          roleType: null,
          interviewMode: null,
          interviewLocation: null,
          postingNotes: null,
          jobDiscription: 'Build web applications',
          jobDesignation: null,
          certificationsRequired: null,
          genderPreference: null,
          ageRange: null,
          shiftType: null,
          workMode: null,
          jobLocation: null,
          salaryPeriod: null,
          benefits: null,
          weeklyOff: null,
          isActive: true,
        },
      })
    );
    mockUseGetAdminJobRequirementsQuery.mockReturnValue(
      baseResult({
        data: {
          items: [{ id: 1, jobCode: 'JOB001', profileHeader: 'Developer', expiryDate: '2026-09-16T00:00:00.000Z' }],
          totalCount: 1,
        },
      })
    );

    const { getByTitle, getByText } = renderWithProviders(<AdminJobRequirements />);

    await waitFor(() => {
      expect(getByText('JOB001')).toBeInTheDocument();
    });

    fireEvent.click(getByTitle('View Requirements'));

    await waitFor(() => {
      expect(getByText(/Job Requirement Details/i)).toBeInTheDocument();
    });
    expect(mockUseGetJobRequirementByCodeQuery).toHaveBeenCalledWith(
      'JOB001',
      expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
    );
    expect(getByText('React')).toBeInTheDocument();
    expect(getByText('B.A')).toBeInTheDocument();
    expect(getByText('Build web applications')).toBeInTheDocument();
    expect(getByText('Active')).toBeInTheDocument();
    expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2026-09-16').length).toBeGreaterThan(0);
    expect(screen.queryByText('requirementId')).not.toBeInTheDocument();
  });

  it('opens edit modal on edit click', async () => {
    mockUseGetAdminJobRequirementsQuery.mockReturnValue(
      baseResult({
        data: {
          items: [{ id: 1, jobCode: 'JOB001', profileHeader: 'Developer' }],
          totalCount: 1,
        },
      })
    );

    const { getByTitle, getByText } = renderWithProviders(<AdminJobRequirements />);

    await waitFor(() => {
      expect(getByText('JOB001')).toBeInTheDocument();
    });

    fireEvent.click(getByTitle('Edit Requirements'));

    await waitFor(() => {
      expect(getByText('Edit Job Form')).toBeInTheDocument();
    });
    const lastEditFormProps = mockEditJobForm.mock.calls[mockEditJobForm.mock.calls.length - 1][0];
    expect(lastEditFormProps).toEqual(expect.objectContaining({ jobId: 1, jobCode: 'JOB001' }));
  });
});
