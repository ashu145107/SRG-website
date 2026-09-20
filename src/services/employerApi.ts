/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi, getApiBaseUrl } from './baseApi';
import { JobApplication, Job } from '../types';

/**
 * Fetch candidate profile from the SRG backend directly (bypasses proxy CORS issues).
 * GET /api/v1/viewcandidateprofile/{candidateId}
 */
export const fetchCandidateProfile = async (candidateId: string) => {
  const token = (() => {
    try {
      const raw = localStorage.getItem('srg_auth_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.token || '';
      }
    } catch { /* ignore */ }
    return '';
  })();

  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  const url = `https://srgapp.dindoripranit.org/api/v1/viewcandidateprofile/${candidateId}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
      'Authorization': `Bearer ${cleanToken}`,
      'token': cleanToken,
    },
  });

  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const json = await res.json();
  console.log('[fetchCandidateProfile] raw response:', json);
  return json;
};

/**
 * Edit the logged-in employer's company profile.
 * POST /api/v1/editcompanyprofile (authenticated — Bearer + token headers).
 */
export interface EditCompanyProfilePayload {
  address: string;
  stateId: number;
  state: string;
  districtId: number;
  district: string;
  talukaId: number;
  taluka: string;
  mobile: string;
  email: string;
  contactPerson: string;
  alternateContactPerson: string;
  alternateContactNumber: string;
  companyTypeId: number;
  companyTypeName: string;
  industryTypeId: number;
  industryTypeName: string;
  discription: string;
  website: string;
  alternateEmail: string;
}

export const updateCompanyProfile = async (payload: EditCompanyProfilePayload): Promise<{ success: boolean; message: string }> => {
  const token = (() => {
    try {
      const raw = localStorage.getItem('srg_auth_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.token || '';
      }
    } catch { /* ignore */ }
    return '';
  })();
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/editcompanyprofile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'token': cleanToken
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    console.log('[updateCompanyProfile] response:', res.status, data);

    if (!res.ok) {
      return { success: false, message: data?.message || data?.error?.message || `Server returned ${res.status}` };
    }
    if (data?.isSuccess === false || data?.isFailure === true) {
      return {
        success: false,
        message: data?.value || data?.message || data?.error?.message || 'Company profile update failed.',
      };
    }
    return {
      success: true,
      message: typeof data?.value === 'string' ? data.value : (data?.message || 'Company profile updated successfully.'),
    };
  } catch (err: any) {
    console.error('[updateCompanyProfile] failed:', err);
    return { success: false, message: err.message || 'Failed to update company profile.' };
  }
};

/**
 * Normalize raw API response into JobApplication[].
 * Handles multiple response shapes the backend may return.
 */
const normalizeApplications = (data: any): JobApplication[] => {
  if (!data) return [];

  const value = data.value !== undefined ? data.value : data;

  let list: any[] = [];
  if (Array.isArray(value)) {
    list = value;
  } else if (value && typeof value === 'object') {
    const arr = [value.data, value.items, value.list, value.results, value.jobApplications]
      .find(v => Array.isArray(v));
    if (arr) list = arr;
  }

  return list.map((item: any) => ({
    id: String(item.id || item.jobApplicationId || `app-${Date.now()}-${Math.random()}`),
    jobId: String(item.jobId || item.jobRequirementId || item.jobCode || ''),
    jobTitle: item.profileHeader || item.jobTitle || item.jobDesignation || item.title || 'Untitled Job',
    companyName: item.companyName || item.company || '',
    companyId: String(item.companyId || ''),
    candidateId: String(item.candidateId || item.userId || ''),
    candidateName: item.candidateName || item.fullName || 'Candidate',
    candidatePhone: item.candidatePhone || item.phone || '',
    status: (item.status || 'Applied') as JobApplication['status'],
    appliedAt: item.appliedAt || item.createdDate || new Date().toISOString().split('T')[0],
    interviewDate: item.interviewDate || undefined
  }));
};

/**
 * Normalize raw API response into Job[] for employer's own requirements.
 * Spreads the raw API item so all fields are preserved (profileHeader, skill, workPlace, etc.)
 */
const normalizeRequirements = (data: any): Job[] => {
  if (!data) return [];

  const value = data.value !== undefined ? data.value : data;

  let list: any[] = [];
  if (Array.isArray(value)) {
    list = value;
  } else if (value && typeof value === 'object') {
    const arr = [value.data, value.items, value.list, value.results, value.jobRequirements]
      .find(v => Array.isArray(v));
    if (arr) list = arr;
  }

  return list.map((item: any, idx: number) => ({
    ...item,
    id: item.id ?? item.jobRequirementId ?? (idx + 1),
  }));
};

export const employerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/v1/company/myjobapplications
     * Returns all job applications for the logged-in employer.
     * Auth: Bearer token (auto-attached by baseApi prepareHeaders).
     */
    getMyJobApplications: builder.query<JobApplication[], void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        try {
          const result = await baseQuery('/api/v1/company/myjobapplications');
          if (result.data) {
            return { data: normalizeApplications(result.data) };
          }
          if (result.error) {
            console.error('[employerApi] getMyJobApplications error:', result.error);
          }
          return { data: [] };
        } catch (err) {
          console.error('[employerApi] getMyJobApplications failed:', err);
          return { data: [] };
        }
      },
      providesTags: ['Application']
    }),

    /**
     * GET /api/v1/company/myrequirements
     * Returns all job requirements posted by the logged-in employer.
     * Auth: Bearer token (auto-attached by baseApi prepareHeaders).
     */
    getMyRequirements: builder.query<Job[], void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        try {
          const result = await baseQuery('/api/v1/company/myrequirements');
          if (result.data) {
            return { data: normalizeRequirements(result.data) };
          }
          if (result.error) {
            console.error('[employerApi] getMyRequirements error:', result.error);
            return { error: result.error };
          }
          return { data: [] };
        } catch (err) {
          console.error('[employerApi] getMyRequirements failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
      },
      providesTags: ['Job']
    })
  })
});

export const { useGetMyJobApplicationsQuery, useGetMyRequirementsQuery } = employerApi;
