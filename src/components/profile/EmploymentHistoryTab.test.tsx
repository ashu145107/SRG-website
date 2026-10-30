/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../../test/polyfills';
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmploymentHistoryTab } from './EmploymentHistoryTab';
import {
  renderWithProviders,
  authenticatedAuthState,
} from '../../test/test-utils';
import {
  addEmploymentHistory,
  updateEmploymentHistory,
  deleteEmploymentHistory,
} from '../../services/profileApi';
import {
  useGetIndustryTypesQuery,
  useGetJobTypesQuery,
} from '../../services/jobMasterApi';

jest.mock('../../services/baseApi', () => ({
  baseApi: {
    reducerPath: 'srgApi',
    reducer: (state: unknown = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
    util: { resetApiState: () => ({ type: 'srgApi/resetApiState' }) },
  },
  getApiBaseUrl: () => '',
}));

jest.mock('../../services/profileApi', () => ({
  addEmploymentHistory: jest.fn(),
  updateEmploymentHistory: jest.fn(),
  deleteEmploymentHistory: jest.fn(),
}));

jest.mock('../../services/jobMasterApi', () => ({
  useGetIndustryTypesQuery: jest.fn(),
  useGetJobTypesQuery: jest.fn(),
}));

const addMock = addEmploymentHistory as jest.Mock;
const updateMock = updateEmploymentHistory as jest.Mock;
const deleteMock = deleteEmploymentHistory as jest.Mock;
const industryTypesQuery = useGetIndustryTypesQuery as jest.Mock;
const jobTypesQuery = useGetJobTypesQuery as jest.Mock;

const entry = {
  employmentHistoryId: 7,
  userId: 1,
  companyName: 'Infosys',
  companyIndustryId: 1,
  industryTypeName: 'IT',
  designation: 'Developer',
  department: 'Engineering',
  jobTypeId: 2,
  jobTypeName: 'Full Time',
  jobLocation: 'Pune',
  startDate: '2020-01-01T00:00:00.000Z',
  endDate: null,
  isCurrentJob: true,
};

const renderTab = (profile: any = {}) => {
  const onRefresh = jest.fn();
  const utils = renderWithProviders(
    <EmploymentHistoryTab profile={profile} onRefresh={onRefresh} />,
    { preloadedState: { auth: authenticatedAuthState({ role: 'CANDIDATE' }) } }
  );
  return { onRefresh, ...utils };
};

describe('EmploymentHistoryTab', () => {
  beforeEach(() => {
    industryTypesQuery.mockReturnValue({ data: [{ id: 1, label: 'IT' }] });
    jobTypesQuery.mockReturnValue({ data: [{ id: 2, label: 'Full Time' }] });
    addMock.mockResolvedValue({ success: true, message: 'Employment added successfully.' });
    updateMock.mockResolvedValue({ success: true, message: 'Employment updated successfully.' });
    deleteMock.mockResolvedValue({ success: true, message: 'Employment deleted successfully.' });
  });

  it('renders the header and empty state when there is no history', () => {
    renderTab();

    expect(screen.getByText('Previous Employment')).toBeInTheDocument();
    expect(screen.getByText('No entries yet')).toBeInTheDocument();
    expect(screen.getByText('No employment history added yet')).toBeInTheDocument();
  });

  it('renders saved employment history entries', () => {
    renderTab({ userId: '1', employmentHistory: [entry] });

    expect(screen.getByText('Infosys')).toBeInTheDocument();
    expect(screen.getByText(/Developer/)).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('1 record added')).toBeInTheDocument();
  });

  it('opens the add form and validates required fields', async () => {
    renderTab();

    await userEvent.click(
      screen.getAllByRole('button', { name: /Add Previous Employment/ })[0]
    );

    expect(
      screen.getByRole('heading', { name: 'Add Previous Employment' })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Please enter the company name.')).toBeInTheDocument();
    expect(addMock).not.toHaveBeenCalled();
  });

  it('adds a new employment history entry on submit', async () => {
    const { onRefresh, container } = renderTab();

    await userEvent.click(
      screen.getAllByRole('button', { name: /Add Previous Employment/ })[0]
    );

    fireEvent.change(screen.getByPlaceholderText(/Infosys, TCS/), {
      target: { name: 'companyName', value: 'Acme Corp' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Sales Executive/), {
      target: { name: 'designation', value: 'Manager' },
    });
    fireEvent.change(container.querySelector('input[name="startDate"]')!, {
      target: { name: 'startDate', value: '2021-05-01' },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(addMock).toHaveBeenCalledTimes(1));
    expect(addMock.mock.calls[0][0]).toMatchObject({
      companyName: 'Acme Corp',
      designation: 'Manager',
    });
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Employment Added' })).toBeInTheDocument()
    );
    expect(onRefresh).toHaveBeenCalled();
  });

  it('opens the edit form prefilled for an existing entry', async () => {
    renderTab({ userId: '1', employmentHistory: [entry] });

    await userEvent.click(
      screen.getByRole('button', { name: 'Edit employment history' })
    );

    expect(
      screen.getByRole('heading', { name: 'Edit Employment History' })
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Infosys')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  });

  it('deletes an entry after confirming the dialog', async () => {
    const { onRefresh } = renderTab({ userId: '1', employmentHistory: [entry] });

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete employment history' })
    );

    expect(screen.getByText('Delete Employment History')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteMock).toHaveBeenCalledTimes(1));
    expect(deleteMock).toHaveBeenCalledWith({
      employmentHistoryId: 7,
      userId: 1,
    });
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Employment Deleted' })).toBeInTheDocument()
    );
    expect(onRefresh).toHaveBeenCalled();
  });
});
