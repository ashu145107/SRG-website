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

jest.mock('../services/axiosInstance', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import { useGetAdminCandidateDetailQuery } from '../services/adminApi';
import axiosInstance from '../services/axiosInstance';
const mockUseGetAdminCandidateDetailQuery = useGetAdminCandidateDetailQuery as jest.Mock;
const mockAxiosGet = axiosInstance.get as jest.Mock;

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
    expect(screen.queryByText(/candidate ID|ID:\s*123/i)).not.toBeInTheDocument();
  });

  it('previews resolved resume URLs and downloads the resume file', async () => {
    mockUseGetAdminCandidateDetailQuery.mockReturnValue({
      data: {
        fullName: 'John Doe',
        resumeUrl: '/Uploads/Resume/john.pdf',
        resumeName: 'john.pdf',
        employmentHistory: [],
      },
      isLoading: false,
      error: undefined,
    });

    const createObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
    const revokeObjectURLDescriptor = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
    const anchorClickDescriptor = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'click');
    const createObjectURL = jest.fn().mockReturnValue('blob:resume');
    const downloadedNames: string[] = [];

    mockAxiosGet.mockResolvedValue({ data: new Blob(['resume']) });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: jest.fn() });
    Object.defineProperty(HTMLAnchorElement.prototype, 'click', {
      configurable: true,
      value: jest.fn(function (this: HTMLAnchorElement) {
        downloadedNames.push(this.download);
      }),
    });

    try {
      renderWithProviders(<AdminCandidateProfileView candidateId="123" />);
      await userEvent.click(screen.getByText('Resume / CV'));

      expect(screen.queryByRole('link', { name: /preview/i })).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /preview/i }));
      await waitFor(() => expect(screen.getByRole('dialog', { name: 'Resume preview' })).toBeInTheDocument());
      expect(mockAxiosGet).toHaveBeenLastCalledWith(
        `${window.location.origin}/resume-file/Uploads/Resume/john.pdf`,
        { responseType: 'blob' }
      );
      expect(screen.getByTitle('Resume preview')).toHaveAttribute('src', 'blob:resume');

      await userEvent.click(screen.getByRole('button', { name: 'Download' }));
      await waitFor(() => {
        expect(mockAxiosGet).toHaveBeenLastCalledWith(
          `${window.location.origin}/resume-file/Uploads/Resume/john.pdf`,
          { responseType: 'blob' }
        );
      });
      expect(downloadedNames).toEqual(['John_Doe.pdf']);
      expect(createObjectURL).toHaveBeenCalledTimes(2);
    } finally {
      mockAxiosGet.mockReset();
      if (createObjectURLDescriptor) {
        Object.defineProperty(URL, 'createObjectURL', createObjectURLDescriptor);
      } else {
        Reflect.deleteProperty(URL, 'createObjectURL');
      }
      if (revokeObjectURLDescriptor) {
        Object.defineProperty(URL, 'revokeObjectURL', revokeObjectURLDescriptor);
      } else {
        Reflect.deleteProperty(URL, 'revokeObjectURL');
      }
      if (anchorClickDescriptor) {
        Object.defineProperty(HTMLAnchorElement.prototype, 'click', anchorClickDescriptor);
      } else {
        Reflect.deleteProperty(HTMLAnchorElement.prototype, 'click');
      }
    }
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
