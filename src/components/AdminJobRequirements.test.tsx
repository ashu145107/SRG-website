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
}));

jest.mock('./jobs/EditJobForm', () => ({
  EditJobForm: () => <div>Edit Job Form</div>,
}));

import { useGetAdminJobRequirementsQuery } from '../services/adminApi';
const mockUseGetAdminJobRequirementsQuery = useGetAdminJobRequirementsQuery as jest.Mock;

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
  });

  it('opens view modal on eye click', async () => {
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

    fireEvent.click(getByTitle('View Requirements'));

    await waitFor(() => {
      expect(getByText(/Job Requirement Details/i)).toBeInTheDocument();
    });
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
  });
});
