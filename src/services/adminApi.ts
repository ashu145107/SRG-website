/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { CompanyProfile, CandidateProfile, JobApplication } from '../types';
import { JobRequirement } from './jobTypes';

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

const parsePaginatedResponse = <T>(
  data: any,
  fallbackList: T[],
  pageSize: number,
  pageNumber: number
): PaginatedResponse<T> => {
  let list: T[] = [];
  let totalCount = fallbackList.length;

  if (data) {
    // If it has a "value" property
    const value = data.value !== undefined ? data.value : data;
    if (Array.isArray(value)) {
      list = value;
      totalCount = value.length;
    } else if (value && typeof value === 'object') {
      const possibleArrays = [value.data, value.items, value.list, value.value];
      const foundArr = possibleArrays.find(arr => Array.isArray(arr));
      if (foundArr) {
        list = foundArr;
      } else {
        if (Array.isArray(value)) {
          list = value;
        }
      }
      totalCount = typeof value.totalCount === 'number' ? value.totalCount :
                   typeof value.total === 'number' ? value.total :
                   typeof value.count === 'number' ? value.count : list.length;
    }
  }

  // If real API did not return any records or we want mock fallback
  if ((!list || list.length === 0) && fallbackList.length > 0) {
    const startIdx = (pageNumber - 1) * pageSize;
    list = fallbackList.slice(startIdx, startIdx + pageSize);
    totalCount = fallbackList.length;
  }

  return { items: list || [], totalCount: totalCount || 0 };
};

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCompanies: builder.query<PaginatedResponse<CompanyProfile>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/companyregistration/${pageSize}/${pageNumber}`);
          if (result.data) {
            return { data: parsePaginatedResponse(result.data, MockDb.getCompanies(), pageSize, pageNumber) };
          }
          if (result.error) {
            console.warn('getAdminCompanies API returned error:', result.error);
          }
        } catch (err) {
          console.warn('getAdminCompanies API failed:', err);
        }
        return { data: parsePaginatedResponse(null, MockDb.getCompanies(), pageSize, pageNumber) };
      },
      providesTags: ['Company']
    }),

    getAdminUsers: builder.query<PaginatedResponse<CandidateProfile>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/userregistration/${pageSize}/${pageNumber}`);
          if (result.data) {
            return { data: parsePaginatedResponse(result.data, MockDb.getCandidates(), pageSize, pageNumber) };
          }
          if (result.error) {
            console.warn('getAdminUsers API returned error:', result.error);
          }
        } catch (err) {
          console.warn('getAdminUsers API failed:', err);
        }
        return { data: parsePaginatedResponse(null, MockDb.getCandidates(), pageSize, pageNumber) };
      },
      providesTags: ['Candidate']
    }),

    getAdminJobRequirements: builder.query<PaginatedResponse<JobRequirement>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/jobrequirements/${pageSize}/${pageNumber}`);
          if (result.data) {
            // Map the JobRequirement format
            return { data: parsePaginatedResponse(result.data, [], pageSize, pageNumber) };
          }
          if (result.error) {
            console.warn('getAdminJobRequirements API returned error:', result.error);
          }
        } catch (err) {
          console.warn('getAdminJobRequirements API failed:', err);
        }

        // Convert Job to JobRequirement format for mock fallback
        const mockJobs = MockDb.getJobs();
        const fallbackJobs: JobRequirement[] = mockJobs.map((j, i) => ({
          id: parseInt(j.id.replace('job-', '')) || i + 100,
          userId: 1,
          profileHeader: j.title,
          skill: j.requirements.join(', '),
          specialization: 1,
          experiance: 1,
          noOfVacancy: 2,
          workPlace: j.location,
          salary: 300000,
          expiryDate: j.createdAt,
          educationId: 1,
          createdBy: 1,
          experianceTo: 3,
          salaryTo: 500000,
          roleTypeId: 1,
          interviewModeId: 1,
          interviewLocation: j.location,
          postingNotes: j.description,
          jobDiscription: j.description,
          jobDesignation: j.title,
          certificationsRequired: 'Any',
          genderPreference: 'No Preference',
          ageRange: '18-35',
          shiftTypeId: 1,
          workModeId: 1,
          jobLocation: j.location,
          salaryPeriodId: 1,
          benefits: 'PF, ESIC',
          weeklyOffId: 1,
          jobCode: `RG${String(i + 5700).padStart(5, '0')}`
        }));

        return { data: parsePaginatedResponse(null, fallbackJobs, pageSize, pageNumber) };
      },
      providesTags: ['Job']
    }),

    getAdminJobApplications: builder.query<PaginatedResponse<JobApplication>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/jobapplications/${pageSize}/${pageNumber}`);
          if (result.data) {
            return { data: parsePaginatedResponse(result.data, MockDb.getApplications(), pageSize, pageNumber) };
          }
          if (result.error) {
            console.warn('getAdminJobApplications API returned error:', result.error);
          }
        } catch (err) {
          console.warn('getAdminJobApplications API failed:', err);
        }
        return { data: parsePaginatedResponse(null, MockDb.getApplications(), pageSize, pageNumber) };
      },
      providesTags: ['Application']
    })
  })
});

export const {
  useGetAdminCompaniesQuery,
  useGetAdminUsersQuery,
  useGetAdminJobRequirementsQuery,
  useGetAdminJobApplicationsQuery
} = adminApi;
