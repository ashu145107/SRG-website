/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { TextEncoder: NodeTextEncoder, TextDecoder: NodeTextDecoder } = require('util');
(global as any).TextEncoder = NodeTextEncoder;
(global as any).TextDecoder = NodeTextDecoder;

const userEvent = require('@testing-library/user-event').default;
const { fireEvent, renderWithProviders, screen, waitFor } = require('../../test/test-utils');

import { AddJobForm } from './AddJobForm';
import { useAddJobRequirementMutation } from '../../hooks/useJobQueries';
import {
  useGetCompanyTypesQuery,
  useGetIndustryTypesQuery,
  useGetInterviewModesQuery,
  useGetJobTypesQuery,
  useGetShiftTypesQuery,
  useGetWorkModesQuery,
  useGetSalaryPeriodsQuery,
  useGetJobBenefitsQuery,
  useGetWeeklyOffsQuery,
  useGetEducationsQuery,
  useGetSubEducationsQuery,
} from '../../services/jobMasterApi';

jest.mock('../../services/baseApi', () => {
  const { createApi, fetchBaseQuery } = require('@reduxjs/toolkit/query/react');
  const baseApi = createApi({
    reducerPath: 'srgApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost', fetchFn: () => Promise.resolve({ status: 200, data: {} }) as any }),
    tagTypes: [
      'User',
      'Job',
      'Company',
      'Candidate',
      'SHG',
      'Application',
      'Initiative',
      'Training',
      'SupportTicket',
    ],
    endpoints: () => ({}),
  });
  return {
    baseApi,
    getApiBaseUrl: () => 'http://localhost',
    getClientIp: async () => '127.0.0.1',
  };
});

jest.mock('../../hooks/useJobQueries', () => ({
  useAddJobRequirementMutation: jest.fn(),
}));

jest.mock('../../services/jobMasterApi', () => ({
  useGetCompanyTypesQuery: jest.fn(),
  useGetIndustryTypesQuery: jest.fn(),
  useGetInterviewModesQuery: jest.fn(),
  useGetJobTypesQuery: jest.fn(),
  useGetShiftTypesQuery: jest.fn(),
  useGetWorkModesQuery: jest.fn(),
  useGetSalaryPeriodsQuery: jest.fn(),
  useGetJobBenefitsQuery: jest.fn(),
  useGetWeeklyOffsQuery: jest.fn(),
  useGetEducationsQuery: jest.fn(),
  useGetSubEducationsQuery: jest.fn(),
}));

const mockedAddJobMutation = useAddJobRequirementMutation as jest.Mock;
const mockMutateAsync = jest.fn();

const asData = (label: string) => ({ id: 1, label });

beforeEach(() => {
  mockMutateAsync.mockResolvedValue({ id: 99, jobCode: 'JOB-99' });
  mockedAddJobMutation.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  });

  (useGetCompanyTypesQuery as jest.Mock).mockReturnValue({ data: [asData('Private Ltd')] });
  (useGetIndustryTypesQuery as jest.Mock).mockReturnValue({ data: [asData('IT Industry')] });
  (useGetJobTypesQuery as jest.Mock).mockReturnValue({ data: [asData('Full Time')] });
  (useGetInterviewModesQuery as jest.Mock).mockReturnValue({ data: [asData('Face to Face')] });
  (useGetShiftTypesQuery as jest.Mock).mockReturnValue({ data: [asData('Day Shift')] });
  (useGetWorkModesQuery as jest.Mock).mockReturnValue({ data: [asData('On-site')] });
  (useGetSalaryPeriodsQuery as jest.Mock).mockReturnValue({ data: [asData('per Month')] });
  (useGetJobBenefitsQuery as jest.Mock).mockReturnValue({ data: [asData('Free Lunch')] });
  (useGetWeeklyOffsQuery as jest.Mock).mockReturnValue({ data: [asData('Sunday')] });
  (useGetEducationsQuery as jest.Mock).mockReturnValue({ data: [asData('Bachelor Degree')] });
  (useGetSubEducationsQuery as jest.Mock).mockReturnValue({ data: [asData('Computer Science')] });
});

const field = (container: HTMLElement, name: string) =>
  container.querySelector(`[name="${name}"]`) as HTMLElement;

const setField = (container: HTMLElement, name: string, value: string) =>
  fireEvent.change(field(container, name), { target: { value } });

const fillValidForm = (container: HTMLElement) => {
  setField(container, 'profileHeader', 'Hiring Web Developers');
  setField(container, 'jobDesignation', 'Senior Developer');
  setField(container, 'salary', '20000');
  setField(container, 'salaryTo', '40000');
  setField(container, 'jobLocation', 'Pune');
  setField(container, 'skill', 'React, Node');
  setField(container, 'jobDiscription', 'We are hiring a senior developer for web projects.');
};

describe('AddJobForm', () => {
  it('renders the heading and master-data options', () => {
    renderWithProviders(<AddJobForm />);

    expect(screen.getByText(/Add Job Requirement/)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Full Time' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'On-site' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Bachelor Degree' })).toBeInTheDocument();
  });

  it('shows a validation error when submitting an empty form', async () => {
    const { container } = renderWithProviders(<AddJobForm />);

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect((await screen.findAllByText(/Please enter Designation/)).length).toBeGreaterThan(0);
    expect(container.querySelector('[name="profileHeader"]')).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('[name="jobDesignation"]')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Please fix the highlighted fields before saving.')).toBeInTheDocument();
    expect(screen.getByText('Designation:', { exact: false })).toBeInTheDocument();
    expect(document.activeElement).toHaveAttribute('aria-live', 'polite');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits a valid form and shows the success toast', async () => {
    const { container } = renderWithProviders(<AddJobForm />);
    fillValidForm(container);

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        jobDesignation: 'Senior Developer',
        salary: 20000,
        salaryTo: 40000,
        jobLocation: 'Pune',
      })
    );
    expect(await screen.findByText(/Job Requirement Added Successfully/)).toBeInTheDocument();
  });

  it('renders a backend error alert when the mutation reports an error', () => {
    mockedAddJobMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      error: { data: { message: 'Server exploded' } },
    });

    renderWithProviders(<AddJobForm />);

    expect(screen.getByText('Backend Error')).toBeInTheDocument();
    expect(screen.getByText('Server exploded')).toBeInTheDocument();
  });

  it('disables the save button and shows a spinner while pending', () => {
    mockedAddJobMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      error: null,
    });

    renderWithProviders(<AddJobForm />);

    expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled();
  });

  it('invokes onCancel when the cancel button is clicked', async () => {
    const onCancel = jest.fn();
    renderWithProviders(<AddJobForm onCancel={onCancel} />);

    await userEvent.click(screen.getAllByRole('button', { name: /Cancel/ })[0]);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
