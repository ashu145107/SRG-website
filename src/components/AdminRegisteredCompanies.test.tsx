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

jest.mock('../services/masterApi', () => ({
  useGetStatesQuery: jest.fn(() => ({ data: [{ id: 1, name: 'Maharashtra' }] })),
  useGetDistrictsQuery: jest.fn(() => ({ data: [{ id: 10, name: 'Pune' }] })),
  useGetTalukasQuery: jest.fn(() => ({ data: [{ id: 100, name: 'Haveli' }] })),
  getLocalizedName: (item: { name: string }) => item.name,
}));

import { useAddCompanyMutation, useGetAdminCompaniesQuery } from '../services/adminApi';
import { useGetCompanyTypesQuery, useGetIndustryTypesQuery } from '../services/jobMasterApi';
const mockUseGetAdminCompaniesQuery = useGetAdminCompaniesQuery as jest.Mock;
const mockAddCompany = jest.fn();

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
    (useAddCompanyMutation as jest.Mock).mockReturnValue([mockAddCompany, { isLoading: false }]);
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
    const companyLink = screen.getByTitle('Open company profile in new tab');
    expect(companyLink).toHaveAttribute('href', '#/dashboard');
    expect(companyLink.getAttribute('href')).not.toContain('1');

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
    expect(useGetCompanyTypesQuery).toHaveBeenLastCalledWith(undefined, {
      skip: false,
      refetchOnMountOrArgChange: true,
    });
    expect(useGetIndustryTypesQuery).toHaveBeenLastCalledWith(undefined, {
      skip: false,
      refetchOnMountOrArgChange: true,
    });
    expect(screen.getByPlaceholderText(/Acme Pvt. Ltd./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/District/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Taluka/i)).toBeInTheDocument();
  });

  it('does not request company and industry types until add company is opened', () => {
    mockUseGetAdminCompaniesQuery.mockReturnValue(baseResult({ data: { items: [], totalCount: 0 } }));

    renderWithProviders(<AdminRegisteredCompanies />);

    expect(useGetCompanyTypesQuery).toHaveBeenLastCalledWith(undefined, {
      skip: true,
      refetchOnMountOrArgChange: true,
    });
    expect(useGetIndustryTypesQuery).toHaveBeenLastCalledWith(undefined, {
      skip: true,
      refetchOnMountOrArgChange: true,
    });
  });

  it('submits the selected location IDs with the company registration fields', async () => {
    mockUseGetAdminCompaniesQuery.mockReturnValue(baseResult({ data: { items: [], totalCount: 0 } }));
    mockAddCompany.mockResolvedValue({ data: { message: 'Company registered' } });

    renderWithProviders(<AdminRegisteredCompanies />);
    fireEvent.click(screen.getByText('Add new Company'));

    fireEvent.change(screen.getByLabelText(/State/i), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText(/District/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Taluka/i), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText(/Acme Pvt. Ltd./i), { target: { value: 'Acme' } });
    fireEvent.change(screen.getByPlaceholderText(/9876543210/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText(/info@acme.com/i), { target: { value: 'info@acme.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Rahul Sharma/i), { target: { value: 'Rahul Sharma' } });
    fireEvent.change(document.getElementById('addcomp-companytype')!, { target: { value: '1' } });
    fireEvent.change(document.getElementById('addcomp-industrytype')!, { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText(/Company registered address/i), { target: { value: 'Pune' } });
    fireEvent.change(document.getElementById('addcomp-altcontactperson')!, { target: { value: 'Asha Sharma' } });
    fireEvent.change(document.getElementById('addcomp-altnumber')!, { target: { value: '9876501234' } });
    fireEvent.change(document.getElementById('addcomp-altemail')!, { target: { value: 'accounts@acme.com' } });
    fireEvent.change(document.getElementById('addcomp-website')!, { target: { value: 'https://acme.com' } });
    fireEvent.change(document.getElementById('addcomp-discription')!, { target: { value: 'Manufacturing company' } });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(mockAddCompany).toHaveBeenCalledWith(expect.objectContaining({
        stateId: 1,
        districtId: 10,
        talukaId: 100,
        fullname: 'Acme',
        mobile: '9876543210',
        address: 'Pune',
        email: 'info@acme.com',
        contactPerson: 'Rahul Sharma',
        alternateContactPerson: 'Asha Sharma',
        alternateContactNumber: '9876501234',
        companyTypeId: 1,
        industryTypeId: 1,
        discription: 'Manufacturing company',
        website: 'https://acme.com',
        alternateEmail: 'accounts@acme.com',
      }));
    });
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
