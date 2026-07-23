/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { CompanyProfile, CandidateProfile, JobApplication } from '../types';
import { JobRequirement } from './jobTypes';

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

/**
 * Parse API response and extract paginated data
 * Supports multiple API response formats
 */
const parsePaginatedResponse = <T>(
  data: any
): PaginatedResponse<T> => {
  let list: T[] = [];
  let totalCount = 0;

  if (!data) {
    return { items: [], totalCount: 0 };
  }

  // Handle different response formats from API
  const value = data.value !== undefined ? data.value : data;
  
  if (Array.isArray(value)) {
    list = value;
    totalCount = value.length;
  } else if (value && typeof value === 'object') {
    const possibleArrays = [value.data, value.items, value.list];
    const foundArr = possibleArrays.find(arr => Array.isArray(arr));
    if (foundArr) {
      list = foundArr;
    }
    // Check for total count with priority order: totalRecords, totalCount, total, count
    totalCount = typeof value.totalRecords === 'number' ? value.totalRecords :
                 typeof value.totalCount === 'number' ? value.totalCount :
                 typeof value.total === 'number' ? value.total :
                 typeof value.count === 'number' ? value.count : list.length;
  }

  console.log('📊 Parsed Response:', { itemsCount: list.length, totalCount, rawData: data });
  return { items: list || [], totalCount: totalCount || 0 };
};

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCompanies: builder.query<PaginatedResponse<CompanyProfile>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/companyregistration/${pageSize}/${pageNumber}`);
          if (result.data) {
            return { data: parsePaginatedResponse(result.data) };
          }
          if (result.error) {
            console.error('getAdminCompanies API error:', result.error);
            return { error: result.error };
          }
        } catch (err) {
          console.error('getAdminCompanies API failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
      },
      providesTags: ['Company']
    }),

    getAdminUsers: builder.query<PaginatedResponse<CandidateProfile>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/userregistration/${pageSize}/${pageNumber}`);
          if (result.data) {
            return { data: parsePaginatedResponse(result.data) };
          }
          if (result.error) {
            console.error('getAdminUsers API error:', result.error);
            return { error: result.error };
          }
        } catch (err) {
          console.error('getAdminUsers API failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
      },
      providesTags: ['Candidate']
    }),

    getAdminJobRequirements: builder.query<PaginatedResponse<JobRequirement>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/jobrequirements/${pageSize}/${pageNumber}`);
          if (result.data) {
            return { data: parsePaginatedResponse(result.data) };
          }
          if (result.error) {
            console.error('getAdminJobRequirements API error:', result.error);
            return { error: result.error };
          }
        } catch (err) {
          console.error('getAdminJobRequirements API failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
      },
      providesTags: ['Job']
    }),

    getAdminJobApplications: builder.query<PaginatedResponse<JobApplication>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/jobapplications/${pageSize}/${pageNumber}`);
          if (result.data) {
            return { data: parsePaginatedResponse(result.data) };
          }
          if (result.error) {
            console.error('getAdminJobApplications API error:', result.error);
            return { error: result.error };
          }
        } catch (err) {
          console.error('getAdminJobApplications API failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
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
