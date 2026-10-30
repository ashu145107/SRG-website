/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test/polyfills';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import AdminCandidateProfileView from './AdminCandidateProfileView';

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
  useGetAdminCandidateDetailQuery: jest.fn(),
}));

import { useGetAdminCandidateDetailQuery } from '../services/adminApi';
const mockUseGetAdminCandidateDetailQuery = useGetAdminCandidateDetailQuery as jest.Mock;

describe('AdminCandidateProfileView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseGetAdminCandidateDetailQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    });

    renderWithProviders(<AdminCandidateProfileView candidateId="123" />);
    expect(screen.getByText(/Shree Swami Samarth/i)).toBeInTheDocument();
  });

  it('renders error state and calls onBack', async () => {
    const onBack = jest.fn();
    mockUseGetAdminCandidateDetailQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { data: 'Failed to fetch' },
    });

    const { getByText } = renderWithProviders(
      <AdminCandidateProfileView candidateId="123" onBack={onBack} />
    );
    expect(getByText(/Failed to fetch/i)).toBeInTheDocument();
    await userEvent.click(getByText('Go Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders candidate profile with data', async () => {
    mockUseGetAdminCandidateDetailQuery.mockReturnValue({
      data: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        city: 'Pune',
        district: 'Pune',
        address: '123 Main St',
        qualification: 'B.Tech',
        specialization: 'CS',
        courses: 'React',
        experienceYears: 5,
        skills: ['React', 'TypeScript'],
        resumeUrl: 'http://example.com/resume.pdf',
        employmentHistory: [],
      },
      isLoading: false,
      error: undefined,
    });

    renderWithProviders(<AdminCandidateProfileView candidateId="123" />);

    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('9876543210').length).toBeGreaterThan(0);
  });

  it('handles tab switching and interactions', async () => {
    mockUseGetAdminCandidateDetailQuery.mockReturnValue({
      data: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1234567890',
        skills: ['JavaScript'],
        employmentHistory: [
          {
            employmentHistoryId: 1,
            companyName: 'Tech Corp',
            designation: 'Developer',
            isCurrentJob: true,
          },
        ],
      },
      isLoading: false,
      error: undefined,
    });

    const { getByText, getAllByText } = renderWithProviders(
      <AdminCandidateProfileView candidateId="456" />
    );

    await waitFor(() => {
      expect(getAllByText('Jane Doe').length).toBeGreaterThan(0);
    });

    await userEvent.click(getByText('Education Details'));
    await waitFor(() => {
      expect(getByText(/Qualification/i)).toBeInTheDocument();
    });

    await userEvent.click(getByText('Employment History'));
    await waitFor(() => {
      expect(getByText('Tech Corp')).toBeInTheDocument();
    });
  });
});
