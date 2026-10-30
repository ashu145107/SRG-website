/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test/polyfills';
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import { AdminJobApplications } from './AdminJobApplications';

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
  useGetAdminJobApplicationsQuery: jest.fn(),
}));

import { useGetAdminJobApplicationsQuery } from '../services/adminApi';
const mockUseGetAdminJobApplicationsQuery = useGetAdminJobApplicationsQuery as jest.Mock;

const baseResult = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  error: undefined,
  ...overrides,
});

describe('AdminJobApplications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseGetAdminJobApplicationsQuery.mockReturnValue(baseResult({ isLoading: true }));

    renderWithProviders(<AdminJobApplications />);
    expect(screen.getByText(/Shree Swami Samarth/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseGetAdminJobApplicationsQuery.mockReturnValue(baseResult({ error: { message: 'Failed' } }));

    renderWithProviders(<AdminJobApplications />);
    expect(screen.getByText(/Failed to load applications from API/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockUseGetAdminJobApplicationsQuery.mockReturnValue(
      baseResult({ data: { items: [], totalCount: 0 } })
    );

    renderWithProviders(<AdminJobApplications />);
    expect(screen.getByText(/No applications found/i)).toBeInTheDocument();
  });

  it('renders applications list and opens detail modal', async () => {
    mockUseGetAdminJobApplicationsQuery.mockReturnValue(
      baseResult({
        data: {
          items: [
            {
              id: '1',
              candidateId: '123',
              candidateName: 'John Doe',
              candidatePhone: '9876543210',
              jobTitle: 'Software Engineer',
              status: 'Applied',
              appliedAt: '2026-01-15T00:00:00Z',
            },
          ],
          totalCount: 1,
        },
      })
    );

    renderWithProviders(<AdminJobApplications />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('View Application'));

    await waitFor(() => {
      expect(screen.getByText(/Job Application Details/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Current Status/i)).toBeInTheDocument();
  });

  it('handles search filtering', async () => {
    mockUseGetAdminJobApplicationsQuery.mockReturnValue(
      baseResult({
        data: {
          items: [
            { id: '1', candidateName: 'John Doe', jobTitle: 'Dev' },
            { id: '2', candidateName: 'Jane Smith', jobTitle: 'QA' },
          ],
          totalCount: 2,
        },
      })
    );

    const { getByPlaceholderText, getByText } = renderWithProviders(<AdminJobApplications />);

    await waitFor(() => {
      expect(getByText('John Doe')).toBeInTheDocument();
      expect(getByText('Jane Smith')).toBeInTheDocument();
    });

    const searchInput = getByPlaceholderText(/Search by candidate or job/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });
});
