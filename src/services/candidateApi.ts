/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import axiosInstance from './axiosInstance';
import { CandidateProfile, JobApplication } from '../types';

const candidateStore: CandidateProfile[] = [];
const applicationStore: JobApplication[] = [];

const DEFAULT_STATUS_NAMES: Record<number, string> = {
  1: 'Applied',
  2: 'Shortlisted',
  3: 'Interview',
  4: 'Round 2',
  5: 'Round 3',
  6: 'HR Discussion',
  7: 'Selected',
  8: 'Rejected',
  9: 'Withdrawn',
  10: 'On Hold',
};

/**
 * Extract a list of application records from the many response shapes the
 * SRG backend can return (plain array, {value:[...]}, {data:[...]}, etc.).
 */
const extractApplicationList = (data: any): any[] => {
  if (!data) return [];
  const value = data.value !== undefined && data.value !== null ? data.value : data;
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const arr = [
      value.data,
      value.items,
      value.results,
      value.jobApplications,
      value.applications,
      value.myJobApplications,
      value.userJobApplications,
      value.records,
    ].find((v) => Array.isArray(v));
    if (arr) return arr;
    const arrayProp = Object.values(value).find((v) => Array.isArray(v));
    if (arrayProp) return arrayProp as any[];
  }
  return [];
};

const readStatusPart = (value: any, ref: { statusId: number; status: string }): void => {
  if (value === undefined || value === null || value === '') return;
  if (typeof value === 'object') {
    readStatusPart(value.statusId ?? value.applicationStatusId ?? value.id, ref);
    readStatusPart(
      value.statusName ?? value.applicationStatusName ?? value.name ?? value.status ?? value.statusCode,
      ref,
    );
    return;
  }
  const s = String(value).trim();
  if (!s) return;
  if (/^\d+$/.test(s)) {
    if (!ref.statusId) ref.statusId = Number(s);
    return;
  }
  if (!ref.status) ref.status = s;
};

/**
 * Resolve an application's current status from every field name the backend
 * may use. The status is kept in an application status *history* table, so the
 * list endpoints can expose it as statusName/applicationStatus/statusId rather
 * than the plain `status` field.
 */
const resolveApplicationStatus = (item: any): { status: string; statusId?: number } => {
  const ref = { statusId: 0, status: '' };

  for (const c of [item.statusId, item.applicationStatusId, item.jobApplicationStatusId, item.currentStatusId]) {
    readStatusPart(c, ref);
  }

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
    readStatusPart(c, ref);
    if (ref.status) break;
  }

  if (!ref.status && ref.statusId && DEFAULT_STATUS_NAMES[ref.statusId]) {
    ref.status = DEFAULT_STATUS_NAMES[ref.statusId];
  }
  return { status: ref.status || 'Applied', statusId: ref.statusId || undefined };
};

export const candidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCandidates: builder.query<CandidateProfile[], void>({
      queryFn: async () => {
        return { data: [...candidateStore] };
      },
      providesTags: ['Candidate']
    }),
    getCandidateById: builder.query<CandidateProfile, string>({
      queryFn: async (id) => {
        const list = candidateStore;
        const found = list.find(c => c.id === id);
        if (!found) return { error: { status: 404, data: 'Candidate profile not found' } };
        return { data: found };
      },
      providesTags: (result, error, id) => [{ type: 'Candidate', id }]
    }),
    updateCandidate: builder.mutation<CandidateProfile, Partial<CandidateProfile> & { id: string }>({
      queryFn: async (updated) => {
        const list = candidateStore;
        const index = list.findIndex(c => c.id === updated.id);
        if (index === -1) {
          const fresh: CandidateProfile = {
            id: updated.id,
            fullName: updated.fullName || 'New Candidate',
            email: updated.email || '',
            phone: updated.phone || '',
            city: updated.city || 'Nashik',
            qualification: updated.qualification || 'Bachelors',
            experienceYears: updated.experienceYears || 0,
            skills: updated.skills || []
          };
          list.push(fresh);
          return { data: fresh };
        }
        list[index] = { ...list[index], ...updated } as CandidateProfile;
        return { data: list[index] };
      },
      invalidatesTags: (result, error, arg) => ['Candidate', { type: 'Candidate', id: arg.id }]
    }),
    getApplications: builder.query<JobApplication[], { candidateId?: string; companyId?: string } | void>({
      queryFn: async (filters) => {
        const f = filters as { candidateId?: string; companyId?: string } | undefined;
        try {
          const pageSize = 100;
          const pageNumber = 1;

          // Prefer the candidate's own applications endpoint (returns the current
          // status history), then fall back to the generic paginated list.
          let list: any[] = [];
          let userScoped = false;
          try {
            const userRes = await axiosInstance.get<any>('/api/v1/user/myjobapplications');
            list = extractApplicationList(userRes.data);
            userScoped = list.length > 0;
          } catch (userErr) {
            console.warn('[candidateApi] /user/myjobapplications failed, trying generic list:', userErr);
          }
          if (!list.length) {
            const response = await axiosInstance.get<any>(`/api/v1/jobapplications/${pageSize}/${pageNumber}`);
            list = extractApplicationList(response.data);
            userScoped = false;
          }

          if (list && list.length > 0) {
            const mapped = list.map((item: any) => {
              const resolved = resolveApplicationStatus(item);
              return {
                id: String(item.id || item.jobApplicationId || item.applicationId || `app-${Date.now()}-${Math.random()}`),
                applicationId: Number(item.applicationId ?? item.jobApplicationId ?? item.id) || undefined,
                jobId: String(item.jobId || item.jobRequirementId || item.jobCode || ''),
                jobCode: item.jobCode || '',
                jobTitle: item.jobTitle || item.jobDesignation || item.profileHeader || item.title || 'Untitled Job',
                companyName: item.companyName || item.company || 'Unknown Company',
                companyId: String(item.companyId || ''),
                candidateId: String(item.candidateId || item.userId || ''),
                candidateName: item.candidateName || item.fullName || 'Candidate',
                candidatePhone: item.candidatePhone || item.phone || '',
                status: resolved.status as JobApplication['status'],
                statusId: resolved.statusId,
                appliedAt: item.appliedAt || item.createdDate || new Date().toISOString().split('T')[0],
                interviewDate: item.interviewDate || undefined
              };
            });

            // The portal stores candidate ids as `cand-<userId>` while the API
            // returns numeric userIds, so match on the numeric part to avoid
            // accidentally returning every candidate's applications.
            const digitsOnly = (v: any) => String(v ?? '').replace(/\D/g, '');
            let filtered = mapped;
            const targetCandidate = digitsOnly(f?.candidateId);
            if (targetCandidate) {
              const matches = filtered.filter(a => digitsOnly(a.candidateId) === targetCandidate);
              if (matches.length) filtered = matches;
              else if (!userScoped) filtered = [];
            }
            if (f?.companyId) {
              const matches = filtered.filter(a => String(a.companyId) === String(f.companyId));
              if (matches.length) filtered = matches;
            }
            return { data: filtered };
          }
        } catch (err) {
          console.warn('Failed to fetch job applications from API, falling back to mock DB:', err);
        }

        let apps = [...applicationStore];
        if (f?.candidateId) {
          const target = String(f.candidateId).replace(/\D/g, '');
          const matches = target ? apps.filter(a => String(a.candidateId).replace(/\D/g, '') === target) : [];
          apps = matches.length ? matches : apps;
        }
        if (f?.companyId) {
          const matches = apps.filter(a => a.companyId === f.companyId);
          apps = matches.length ? matches : apps;
        }
        return { data: apps };
      },
      providesTags: ['Application']
    }),
    applyToJob: builder.mutation<JobApplication, Omit<JobApplication, 'id' | 'status' | 'appliedAt'>>({
      queryFn: async (payload) => {
        const apps = applicationStore;
        // Check duplication
        if (apps.some(a => a.jobId === payload.jobId && a.candidateId === payload.candidateId)) {
          return { error: { status: 400, data: 'You have already applied for this job opportunity!' } };
        }
        const newApp: JobApplication = {
          ...payload,
          id: `app-${Date.now()}`,
          status: 'Applied',
          appliedAt: new Date().toISOString().split('T')[0]
        };
        apps.push(newApp);
        return { data: newApp };
      },
      invalidatesTags: ['Application']
    }),
    updateApplicationStatus: builder.mutation<
      JobApplication,
      { id: string; status: JobApplication['status']; interviewDate?: string }
    >({
      queryFn: async (payload) => {
        const apps = applicationStore;
        const index = apps.findIndex(a => a.id === payload.id);
        if (index === -1) return { error: { status: 404, data: 'Application not found' } };
        
        apps[index] = { ...apps[index], status: payload.status };
        if (payload.interviewDate) {
          apps[index].interviewDate = payload.interviewDate;
        }
        return { data: apps[index] };
      },
      invalidatesTags: ['Application']
    })
  })
});

export const {
  useGetCandidatesQuery,
  useGetCandidateByIdQuery,
  useUpdateCandidateMutation,
  useGetApplicationsQuery,
  useApplyToJobMutation,
  useUpdateApplicationStatusMutation
} = candidateApi;
