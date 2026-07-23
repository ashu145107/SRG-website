/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';

interface IdValueItem {
  id: number;
  value: string;
}

interface CompanyTypeItem {
  id: number;
  typeName: string;
  isActive: boolean;
}

interface IndustryTypeItem {
  id: number;
  industryTypeName: string;
  isActive: boolean;
}

interface EducationItem {
  id: number;
  name: string;
  parentId: number;
}

interface MasterApiResponse<T> {
  value: T[];
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}

export const jobMasterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyTypes: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/companytype',
      transformResponse: (res: MasterApiResponse<CompanyTypeItem>) =>
        (res?.value || [])
          .filter((item) => item.isActive)
          .map((item) => ({ id: item.id, label: item.typeName })),
    }),
    getIndustryTypes: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/industrytype',
      transformResponse: (res: MasterApiResponse<IndustryTypeItem>) =>
        (res?.value || [])
          .filter((item) => item.isActive)
          .map((item) => ({ id: item.id, label: item.industryTypeName })),
    }),
    getInterviewModes: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/interviewmode',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.value })),
    }),
    getJobTypes: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/jobtype',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.value })),
    }),
    getShiftTypes: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/shifttype',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.value })),
    }),
    getWorkModes: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/workmode',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.value })),
    }),
    getSalaryPeriods: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/salaryperiod',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.value })),
    }),
    getJobBenefits: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/jobbenifits',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.value })),
    }),
    getWeeklyOffs: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/weeklyoff',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.value })),
    }),
    getEducations: builder.query<{ id: number; label: string }[], void>({
      query: () => '/api/v1/educations',
      transformResponse: (res: MasterApiResponse<EducationItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.name })),
    }),
    getSubEducations: builder.query<{ id: number; label: string }[], number>({
      query: (parentId) => `/api/v1/subeducations/${parentId}`,
      transformResponse: (res: MasterApiResponse<EducationItem>) =>
        (res?.value || []).map((item) => ({ id: item.id, label: item.name })),
    }),
  }),
});

export const {
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
} = jobMasterApi;
