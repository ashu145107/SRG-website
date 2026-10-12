/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi, getApiBaseUrl } from './baseApi';
import { JobApplication, JobApplicationStatus, Job } from '../types';

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

  return list.map((item: any, idx: number) => {
    const rawId = item.id ?? item.jobApplicationId ?? item.applicationId ?? null;
    
    // Comprehensive extraction of numeric application ID
    const numericAppId = (() => {
      const candidates = [
        item.applicationId,
        item.jobApplicationId,
        item.applicationHistoryId,
        item.applicationStatusHistoryId,
        item.appliedJobId,
        item.applicationRegId,
        item.jobAppId,
        item.appId,
        item.candidateJobApplicationId,
        item.jobSeekerApplicationId,
        item.id,
        item.requirementApplicationId
      ];
      for (const c of candidates) {
        if (c !== undefined && c !== null) {
          const n = Number(c);
          if (Number.isFinite(n) && n > 0 && n < Number.MAX_SAFE_INTEGER) {
            return Math.trunc(n);
          }
          if (typeof c === 'string') {
            const digits = c.replace(/\D/g, '');
            if (digits && digits.length <= 15) {
              const parsed = Number(digits);
              if (Number.isFinite(parsed) && parsed > 0) return parsed;
            }
          }
        }
      }
      return 0;
    })();

    if (!numericAppId && idx === 0) {
      console.warn('[employerApi] normalizeApplications: sample application with 0 numericAppId. Item keys:', Object.keys(item), item);
    }

    let statusId = 0;
    let statusText = '';
    const absorbStatus = (v: any) => {
      if (v === undefined || v === null || v === '') return;
      if (typeof v === 'object') {
        absorbStatus(v.statusId ?? v.applicationStatusId ?? v.id);
        absorbStatus(v.statusName ?? v.applicationStatusName ?? v.name ?? v.status ?? v.statusCode);
        return;
      }
      const s = String(v).trim();
      if (!s) return;
      if (/^\d+$/.test(s)) { if (!statusId) statusId = Number(s); return; }
      if (!statusText) statusText = s;
    };
    [item.statusId, item.applicationStatusId, item.jobApplicationStatusId, item.currentStatusId].forEach(absorbStatus);
    for (const c of [
      item.statusName,
      item.applicationStatusName,
      item.jobApplicationStatusName,
      item.currentStatusName,
      item.applicationStatusText,
      item.currentStatus,
      item.applicationStatus,
      item.jobApplicationStatus,
      item.status,
      item.statusCode,
    ]) {
      absorbStatus(c);
      if (statusText) break;
    }
    return {
      rawItem: item,
      id: String(rawId || `app-${Date.now()}-${Math.random()}`),
      applicationId: numericAppId,
      statusId: statusId,
      statusCode: item.statusCode || '',
      applicationStatusHistoryId: Number(item.applicationStatusHistoryId ?? item.statusHistoryId ?? item.applicationStatusId ?? 0) || 0,
      jobId: String(item.jobId || item.jobRequirementId || item.jobCode || ''),
      jobCode: item.jobCode || '',
      jobTitle: item.profileHeader || item.jobTitle || item.jobDesignation || item.title || 'Untitled Job',
      companyName: item.companyName || item.company || '',
      companyId: String(item.companyId || ''),
      candidateId: String(item.candidateId || item.userId || item.jobSeekerId || ''),
      candidateName: item.candidateName || item.fullName || 'Candidate',
      candidatePhone: item.candidatePhone || item.phone || '',
      status: statusText || 'Applied',
      remarks: item.remarks || '',
      appliedAt: item.appliedAt || item.createdDate || new Date().toISOString().split('T')[0],
      interviewDate: item.interviewDate || undefined
    };
  });
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
            const value = (result.data as any).value !== undefined ? (result.data as any).value : result.data;
            const sample = Array.isArray(value) ? value[0] : value;
            console.log('[employerApi] getMyJobApplications sample item:', JSON.stringify(sample)?.slice(0, 1600));
            if (sample && sample.requirementId) {
              const reqRes = await baseQuery(`/api/v1/jobapplicationsforrequirment/${sample.requirementId}`);
              if (reqRes.data) {
                const rv = (reqRes.data as any).value !== undefined ? (reqRes.data as any).value : reqRes.data;
                const list2 = Array.isArray(rv) ? rv : (rv && (rv.data || rv.items || rv.list || rv.results || rv.applications));
                console.log('[employerApi] jobapplicationsforrequirment sample item:', JSON.stringify(Array.isArray(list2) ? list2[0] : rv)?.slice(0, 1600));
              } else if (reqRes.error) {
                console.log('[employerApi] jobapplicationsforrequirment probe error:', JSON.stringify(reqRes.error)?.slice(0, 400));
              }
            }
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
     * GET /api/v1/jobapplicationstatuslist
     * Returns the master list of job application statuses (id + name) used to
     * resolve the numeric statusId when an employer changes a pipeline status.
     */
    getApplicationStatusList: builder.query<JobApplicationStatus[], void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        try {
          const result = await baseQuery('/api/v1/jobapplicationstatuslist');
          if (result.data) {
            const value = (result.data as any).value !== undefined ? (result.data as any).value : result.data;
            let list: any[] = [];
            if (Array.isArray(value)) {
              list = value;
            } else if (value && typeof value === 'object') {
              const arr = [value.data, value.items, value.list, value.results, value.statuses]
                .find((v: any) => Array.isArray(v));
              if (arr) list = arr;
            }
            const statuses: JobApplicationStatus[] = list.map((s: any, idx: number) => {
              const statusId = Number(s.statusId ?? s.id ?? s.jobApplicationStatusId ?? 0) || (idx + 1);
              const name = String(s.statusName || s.status || s.name || s.statusCode || '').trim();
              return {
                id: statusId,
                statusId,
                statusCode: s.statusCode || '',
                statusName: s.statusName || name,
                name: name || `Status ${statusId}`,
                description: s.description || '',
                sortOrder: Number(s.sortOrder ?? idx + 1),
                isFinalStatus: Boolean(s.isFinalStatus)
              };
            }).filter(s => s.name);
            console.log('[employerApi] getApplicationStatusList:', statuses);
            return { data: statuses };
          }
          return { data: [] };
        } catch (err) {
          console.error('[employerApi] getApplicationStatusList failed:', err);
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

export const { useGetMyJobApplicationsQuery, useGetMyRequirementsQuery, useGetApplicationStatusListQuery } = employerApi;

/**
 * Payload accepted by POST /api/v1/editjobapplicationstatus.
 */
export interface UpdateApplicationStatusPayload {
  applicationStatusHistoryId?: number;
  applicationId: number;
  statusId: number;
  remarks?: string;
  changedBy: number;
}

/**
 * Edit a job application's status from the employer pipeline.
 * POST /api/v1/editjobapplicationstatus (authenticated — Bearer + token headers).
 */
export const updateJobApplicationStatus = async (payload: UpdateApplicationStatusPayload): Promise<{ success: boolean; message: string }> => {
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
    const res = await fetch(`${getApiBaseUrl()}/api/v1/editjobapplicationstatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'token': cleanToken
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    let data: any = null;
    try { data = rawText ? JSON.parse(rawText) : null; } catch { data = null; }
    console.log('[updateJobApplicationStatus] payload:', payload);
    console.log('[updateJobApplicationStatus] response:', res.status, data || rawText.slice(0, 400));

    if (!res.ok) {
      const snippet = rawText && rawText.trim() ? rawText.trim().slice(0, 200) : '';
      return { success: false, message: data?.message || data?.error?.message || (snippet ? `Server returned ${res.status}. ${snippet}` : `Server returned ${res.status}`) };
    }
    if (data?.isSuccess === false || data?.isFailure === true) {
      return { success: false, message: data?.error?.message || data?.message || 'Failed to update application status.' };
    }
    return { success: true, message: typeof data?.value === 'string' ? data.value : (data?.message || 'Application status updated successfully.') };
  } catch (err: any) {
    console.error('[updateJobApplicationStatus] failed:', err);
    return { success: false, message: err.message || 'Failed to update application status.' };
  }
};
