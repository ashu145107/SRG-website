/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const { TextEncoder: NodeTextEncoder, TextDecoder: NodeTextDecoder } = require('util');
(global as any).TextEncoder = NodeTextEncoder;
(global as any).TextDecoder = NodeTextDecoder;

const userEvent = require('@testing-library/user-event').default;
const { fireEvent, renderWithProviders, screen, waitFor } = require('../../test/test-utils');

import { EditJobForm } from './EditJobForm';
import {
  useEditJobRequirementMutation,
  useJobDetailsQuery,
} from '../../hooks/useJobQueries';
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
import { useGetJobRequirementByCodeQuery } from '../../services/adminApi';

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

it('loads by job code, prepopulates readable API fields, and submits edits', async () => {
  mockedRequirementByCodeQuery.mockReturnValue({
    data: {
      id: 5,
      userId: 7,
      createdBy: 7,
      jobCode: 'JOB-5',
      profileHeader: 'Hiring Drivers Updated',
      jobDesignation: 'Driver',
      skill: 'Driving',
      experiance: 2,
      experianceTo: 5,
      noOfVacancy: 3,
      workPlace: 'Nashik Depot',
      salary: 18000,
      salaryTo: 28000,
      expiryDate: '2026-12-31T00:00:00',
      educationId: 1,
      education: 'Bachelor Degree',
      specializationId: 1,
      specialization: 'IT Industry',
      roleTypeId: 1,
      interviewModeId: 1,
      interviewMode: 'Face to Face',
      shiftTypeId: 1,
      shiftType: 'Day Shift',
      workModeId: 1,
      workMode: 'On-site',
      salaryPeriodId: 1,
      salaryPeriod: 'per Month',
      weeklyOffId: 1,
      weeklyOff: 'Sunday',
      interviewLocation: 'Zoom',
      jobLocation: 'Nashik',
      jobDiscription: 'Need experienced drivers for transport duty.',
      postingNotes: '',
      certificationsRequired: '',
      genderPreference: 'Any',
      ageRange: '18-45',
      benefits: '',
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  });

  const { container } = renderWithProviders(<EditJobForm jobId={5} jobCode="JOB-5" />);

  expect(mockedRequirementByCodeQuery).toHaveBeenCalledWith(
    'JOB-5',
    expect.objectContaining({ skip: false, refetchOnMountOrArgChange: true })
  );
  expect((container.querySelector('[name="profileHeader"]') as HTMLInputElement).value).toBe(
    'Hiring Drivers Updated'
  );
  expect((container.querySelector('[name="salary"]') as HTMLInputElement).value).toBe('18000');
  expect((container.querySelector('[name="expiryDate"]') as HTMLInputElement).value).toBe('2026-12-31');
  expect((container.querySelector('[name="educationId"]') as HTMLSelectElement).selectedOptions[0].textContent).toBe(
    'Bachelor Degree'
  );

  fireEvent.change(container.querySelector('[name="profileHeader"]') as HTMLElement, {
    target: { value: 'Updated Driver Profile' },
  });
  fireEvent.submit(container.querySelector('form') as HTMLFormElement);

  await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
  expect(mockMutateAsync).toHaveBeenCalledWith(
    expect.objectContaining({ id: 5, jobCode: 'JOB-5', profileHeader: 'Updated Driver Profile', salary: 18000 })
  );
});

jest.mock('../../hooks/useJobQueries', () => ({
  useEditJobRequirementMutation: jest.fn(),
  useJobDetailsQuery: jest.fn(),
}));

jest.mock('../../services/adminApi', () => ({
  useGetJobRequirementByCodeQuery: jest.fn(),
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

const mockedUseJobDetails = useJobDetailsQuery as jest.Mock;
const mockedRequirementByCodeQuery = useGetJobRequirementByCodeQuery as jest.Mock;
const mockedEditMutation = useEditJobRequirementMutation as jest.Mock;
const mockMutateAsync = jest.fn();

const asData = (label: string) => ({ id: 1, label });

const jobData = {
  id: 5,
  userId: 7,
  profileHeader: 'Hiring Drivers',
  skill: 'Driving',
  specialization: 1,
  experiance: 2,
  experianceTo: 5,
  noOfVacancy: 3,
  workPlace: 'Nashik Depot',
  salary: 15000,
  salaryTo: 25000,
  expiryDate: '2026-12-31T00:00:00.000Z',
  educationId: 1,
  createdBy: 7,
  roleTypeId: 1,
  interviewModeId: 1,
  interviewLocation: 'Zoom',
  postingNotes: '',
  jobDiscription: 'Need experienced drivers for transport duty.',
  jobDesignation: 'Driver',
  certificationsRequired: '',
  genderPreference: 'Any',
  ageRange: '18-45',
  shiftTypeId: 1,
  workModeId: 1,
  jobLocation: 'Nashik',
  salaryPeriodId: 1,
  benefits: '',
  weeklyOffId: 1,
  jobCode: 'JOB-5',
  companyTypeId: 1,
  industryTypeId: 1,
  jobTypeId: 1,
};

beforeEach(() => {
  mockMutateAsync.mockResolvedValue({ id: 5 });
  mockedEditMutation.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  });
  mockedUseJobDetails.mockReturnValue({
    data: jobData,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  });
  mockedRequirementByCodeQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
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
  (useGetSubEducationsQuery as jest.Mock).mockReturnValue({ data: [{ id: 9, label: 'Automobile' }] });
});

describe('EditJobForm', () => {
  it('renders a loading skeleton while job details are loading', () => {
    mockedUseJobDetails.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = renderWithProviders(<EditJobForm jobId={5} />);

    expect(screen.queryByText('Edit Job Requirement')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders an error state with a working Retry button', async () => {
    const refetch = jest.fn();
    mockedUseJobDetails.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500 },
      refetch,
    });

    renderWithProviders(<EditJobForm jobId={5} />);

    expect(screen.getByText('Failed to load job details')).toBeInTheDocument();
    expect(screen.getByText(/Job requirement details could not be loaded/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('populates the form from the loaded job details', () => {
    const { container } = renderWithProviders(<EditJobForm jobId={5} />);

    expect(screen.getByText('Edit Job Requirement')).toBeInTheDocument();
    expect(screen.getByText('Job Code: JOB-5')).toBeInTheDocument();
    expect((container.querySelector('[name="profileHeader"]') as HTMLInputElement).value).toBe(
      'Hiring Drivers'
    );
    expect((container.querySelector('[name="jobDesignation"]') as HTMLInputElement).value).toBe(
      'Driver'
    );
  });

  it('shows a validation error when a required field is cleared', async () => {
    const { container } = renderWithProviders(<EditJobForm jobId={5} />);

    fireEvent.change(container.querySelector('[name="profileHeader"]') as HTMLElement, {
      target: { value: '' },
    });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect((await screen.findAllByText('Please enter the profile header.')).length).toBeGreaterThan(0);
    expect(container.querySelector('[name="profileHeader"]')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Please fix the highlighted fields before saving.')).toBeInTheDocument();
    expect(screen.getByText('Profile header:', { exact: false })).toBeInTheDocument();
    expect(document.activeElement).toHaveAttribute('aria-live', 'polite');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('submits the edited job and shows the success toast', async () => {
    const { container } = renderWithProviders(<EditJobForm jobId={5} />);

    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    await waitFor(() => expect(mockMutateAsync).toHaveBeenCalledTimes(1));
    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ id: 5, jobDesignation: 'Driver', jobCode: 'JOB-5' })
    );
    expect(
      await screen.findByText('Job Requirement updated successfully.')
    ).toBeInTheDocument();
  });

  it('invokes onCancel when the cancel button is clicked', async () => {
    const onCancel = jest.fn();
    renderWithProviders(<EditJobForm jobId={5} onCancel={onCancel} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'Cancel' })[0]);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
