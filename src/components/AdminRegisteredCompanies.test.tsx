/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test/polyfills';
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import { AdminRegisteredCompanies } from './AdminRegisteredCompanies';

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
  useGetAdminCompaniesQuery: jest.fn(),
  useAddCompanyMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('../services/jobMasterApi', () => ({
  useGetCompanyTypesQuery: jest.fn(() => ({ data: [{ id: 1, label: 'Pvt Ltd' }] })),
  useGetIndustryTypesQuery: jest.fn(() => ({ data: [{ id: 1, label: 'IT' }] })),
}));

import { useGetAdminCompaniesQuery } from '../services/adminApi';
const mockUseGetAdminCompaniesQuery = useGetAdminCompaniesQuery as jest.Mock;

const baseResult = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isFetching: false,
  error: undefined,
  refetch: jest.fn(),
  ...overrides,
});

describe('AdminRegisteredCompanies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseGetAdminCompaniesQuery.mockReturnValue(baseResult({ isLoading: true }));

    renderWithProviders(<AdminRegisteredCompanies />);
    expect(screen.getByText(/Shree Swami Samarth/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseGetAdminCompaniesQuery.mockReturnValue(baseResult({ error: { message: 'Failed' } }));

    renderWithProviders(<AdminRegisteredCompanies />);
    expect(screen.getByText(/Failed to load companies from API/i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    mockUseGetAdminCompaniesQuery.mockReturnValue(
      baseResult({ data: { items: [], totalCount: 0 } })
    );

    renderWithProviders(<AdminRegisteredCompanies />);
    expect(screen.getByText(/No companies found/i)).toBeInTheDocument();
  });

  it('renders companies list and opens detail modal', async () => {
    mockUseGetAdminCompaniesQuery.mockReturnValue(
      baseResult({
        data: {
          items: [
            {
              id: 1,
              companyName: 'Tech Solutions',
              phone: '9876543210',
              email: 'info@techsolutions.com',
              contactPerson: 'Alice',
              address: 'Mumbai',
            },
          ],
          totalCount: 1,
        },
      })
    );

    const { getByText, getByTitle } = renderWithProviders(<AdminRegisteredCompanies />);

    await waitFor(() => {
      expect(getByText('Tech Solutions')).toBeInTheDocument();
    });

    fireEvent.click(getByTitle('View Profile'));

    await waitFor(() => {
      expect(getByText(/Company Profile Details/i)).toBeInTheDocument();
    });
  });

  it('opens add company modal', async () => {
    mockUseGetAdminCompaniesQuery.mockReturnValue(
      baseResult({ data: { items: [], totalCount: 0 } })
    );

    const { getByText } = renderWithProviders(<AdminRegisteredCompanies />);
    fireEvent.click(getByText('Add new Company'));

    await waitFor(() => {
      expect(getByText(/Register New Company/i)).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText(/Acme Pvt. Ltd./i)).toBeInTheDocument();
  });

  it('filters companies by search input', async () => {
    mockUseGetAdminCompaniesQuery.mockReturnValue(
      baseResult({
        data: {
          items: [
            { id: 1, companyName: 'Alpha Corp', email: 'alpha@x.com' },
            { id: 2, companyName: 'Beta Corp', email: 'beta@x.com' },
          ],
          totalCount: 2,
        },
      })
    );

    const { getByPlaceholderText, getByText } = renderWithProviders(<AdminRegisteredCompanies />);

    await waitFor(() => {
      expect(getByText('Alpha Corp')).toBeInTheDocument();
      expect(getByText('Beta Corp')).toBeInTheDocument();
    });

    const searchInput = getByPlaceholderText(/Search/i) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });

    await waitFor(() => {
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
      expect(screen.queryByText('Beta Corp')).not.toBeInTheDocument();
    });
  });
});
