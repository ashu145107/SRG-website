/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import i18n from '../i18n/config';

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

type LabelledItem = { id: number; label: string };

const sortAlphabetically = (items: LabelledItem[]): LabelledItem[] =>
  [...items].sort((a, b) =>
    a.label.localeCompare(b.label, i18n.language === 'mr' ? 'mr' : 'en', {
      sensitivity: 'base',
      numeric: true,
    })
  );

export const jobMasterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyTypes: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/companytype',
      transformResponse: (res: MasterApiResponse<CompanyTypeItem>) =>
        sortAlphabetically(
          (res?.value || [])
            .filter((item) => item.isActive)
            .map((item) => ({ id: item.id, label: item.typeName }))
        ),
    }),
    getIndustryTypes: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/industrytype',
      transformResponse: (res: MasterApiResponse<IndustryTypeItem>) =>
        sortAlphabetically(
          (res?.value || [])
            .filter((item) => item.isActive)
            .map((item) => ({ id: item.id, label: item.industryTypeName }))
        ),
    }),
    getInterviewModes: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/interviewmode',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.value }))),
    }),
    getJobTypes: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/jobtype',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.value }))),
    }),
    getShiftTypes: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/shifttype',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.value }))),
    }),
    getWorkModes: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/workmode',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.value }))),
    }),
    getSalaryPeriods: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/salaryperiod',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.value }))),
    }),
    getJobBenefits: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/jobbenifits',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.value }))),
    }),
    getWeeklyOffs: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/weeklyoff',
      transformResponse: (res: MasterApiResponse<IdValueItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.value }))),
    }),
    getEducations: builder.query<LabelledItem[], void>({
      query: () => '/api/v1/educations',
      transformResponse: (res: MasterApiResponse<EducationItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.name }))),
    }),
    getSubEducations: builder.query<LabelledItem[], number>({
      query: (parentId) => `/api/v1/subeducations/${parentId}`,
      transformResponse: (res: MasterApiResponse<EducationItem>) =>
        sortAlphabetically((res?.value || []).map((item) => ({ id: item.id, label: item.name }))),
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
