/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test/polyfills';
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test/test-utils';
import AdminCompanyProfileView from './AdminCompanyProfileView';

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
  useGetAdminCompanyDetailQuery: jest.fn(),
}));

import { useGetAdminCompanyDetailQuery } from '../services/adminApi';
const mockUseGetAdminCompanyDetailQuery = useGetAdminCompanyDetailQuery as jest.Mock;

describe('AdminCompanyProfileView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseGetAdminCompanyDetailQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<AdminCompanyProfileView companyId="123" />);
    expect(screen.getByText(/Shree Swami Samarth/i)).toBeInTheDocument();
  });

  it('renders not found/error state when no data', () => {
    mockUseGetAdminCompanyDetailQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<AdminCompanyProfileView companyId="123" />);
    expect(screen.getByText(/Company profile not found/i)).toBeInTheDocument();
  });

  it('renders company profile with data', async () => {
    mockUseGetAdminCompanyDetailQuery.mockReturnValue({
      data: {
        companyName: 'Test Corp',
        email: 'contact@testcorp.com',
        phone: '9876543210',
        contactPerson: 'John Smith',
        address: 'Pune, Maharashtra',
        isApproved: true,
      },
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<AdminCompanyProfileView companyId="123" />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Corp').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('contact@testcorp.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('John Smith').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Approved|Pending Approval|Status/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/company profile for ID|ID:\s*123/i)).not.toBeInTheDocument();
  });

  it('handles try again action', async () => {
    const refetchMock = jest.fn();
    mockUseGetAdminCompanyDetailQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      refetch: refetchMock,
    });

    const { getByText } = renderWithProviders(<AdminCompanyProfileView companyId="123" />);
    fireEvent.click(getByText('Try Again'));
    expect(refetchMock).toHaveBeenCalled();
  });
});
