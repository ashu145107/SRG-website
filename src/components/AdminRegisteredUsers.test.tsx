/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test/polyfills';
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import { AdminRegisteredUsers } from './AdminRegisteredUsers';

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
  useGetAdminUsersQuery: jest.fn(),
}));

import { useGetAdminUsersQuery } from '../services/adminApi';
const mockUseGetAdminUsersQuery = useGetAdminUsersQuery as jest.Mock;

const baseResult = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  error: undefined,
  ...overrides,
});

describe('AdminRegisteredUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseGetAdminUsersQuery.mockReturnValue(baseResult({ isLoading: true }));

    renderWithProviders(<AdminRegisteredUsers />);
    expect(screen.getByText(/Loading candidates/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseGetAdminUsersQuery.mockReturnValue(baseResult({ error: { message: 'Failed' } }));

    renderWithProviders(<AdminRegisteredUsers />);
    expect(screen.getByText(/Failed to load candidates from API/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockUseGetAdminUsersQuery.mockReturnValue(baseResult({ data: { items: [], totalCount: 0 } }));

    renderWithProviders(<AdminRegisteredUsers />);
    expect(screen.getByText(/No candidates found/i)).toBeInTheDocument();
  });

  it('renders users list and opens detail modal', async () => {
    mockUseGetAdminUsersQuery.mockReturnValue(
      baseResult({
        data: {
          items: [
            {
              id: 1,
              fullName: 'Bob Johnson',
              phone: '9876543210',
              email: 'bob@example.com',
              qualification: 'MBA',
              specialization: 'HR',
              experienceYears: 3,
              district: 'Nashik',
              skills: ['Recruitment'],
            },
          ],
          totalCount: 1,
        },
      })
    );

    const { getByText, getByTitle } = renderWithProviders(<AdminRegisteredUsers />);

    await waitFor(() => {
      expect(getByText('Bob Johnson')).toBeInTheDocument();
    });
    expect(getByText('MBA')).toBeInTheDocument();

    fireEvent.click(getByTitle('View Profile'));

    await waitFor(() => {
      expect(getByText(/Candidate Profile Details/i)).toBeInTheDocument();
    });
  });

  it('filters by search input', async () => {
    mockUseGetAdminUsersQuery.mockReturnValue(
      baseResult({
        data: {
          items: [
            { id: 1, fullName: 'Alice', email: 'alice@test.com' },
            { id: 2, fullName: 'Charlie', email: 'charlie@test.com' },
          ],
          totalCount: 2,
        },
      })
    );

    const { getByPlaceholderText, getByText } = renderWithProviders(<AdminRegisteredUsers />);

    await waitFor(() => {
      expect(getByText('Alice')).toBeInTheDocument();
      expect(getByText('Charlie')).toBeInTheDocument();
    });

    const searchInput = getByPlaceholderText(/Search candidate/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });
  });
});
