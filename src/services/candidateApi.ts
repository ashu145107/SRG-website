/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { CandidateProfile, JobApplication } from '../types';

export const candidateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCandidates: builder.query<CandidateProfile[], void>({
      queryFn: async () => {
        return { data: MockDb.getCandidates() };
      },
      providesTags: ['Candidate']
    }),
    getCandidateById: builder.query<CandidateProfile, string>({
      queryFn: async (id) => {
        const list = MockDb.getCandidates();
        const found = list.find(c => c.id === id);
        if (!found) return { error: { status: 404, data: 'Candidate profile not found' } };
        return { data: found };
      },
      providesTags: (result, error, id) => [{ type: 'Candidate', id }]
    }),
    updateCandidate: builder.mutation<CandidateProfile, Partial<CandidateProfile> & { id: string }>({
      queryFn: async (updated) => {
        const list = MockDb.getCandidates();
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
          MockDb.setCandidates(list);
          return { data: fresh };
        }
        list[index] = { ...list[index], ...updated } as CandidateProfile;
        MockDb.setCandidates(list);
        return { data: list[index] };
      },
      invalidatesTags: (result, error, arg) => ['Candidate', { type: 'Candidate', id: arg.id }]
    }),
    getApplications: builder.query<JobApplication[], { candidateId?: string; companyId?: string } | void>({
      queryFn: async (filters) => {
        let apps = MockDb.getApplications();
        const f = filters as { candidateId?: string; companyId?: string } | undefined;
        if (f?.candidateId) {
          apps = apps.filter(a => a.candidateId === f.candidateId);
        }
        if (f?.companyId) {
          apps = apps.filter(a => a.companyId === f.companyId);
        }
        return { data: apps };
      },
      providesTags: ['Application']
    }),
    applyToJob: builder.mutation<JobApplication, Omit<JobApplication, 'id' | 'status' | 'appliedAt'>>({
      queryFn: async (payload) => {
        const apps = MockDb.getApplications();
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
        MockDb.setApplications(apps);
        return { data: newApp };
      },
      invalidatesTags: ['Application']
    }),
    updateApplicationStatus: builder.mutation<
      JobApplication,
      { id: string; status: JobApplication['status']; interviewDate?: string }
    >({
      queryFn: async (payload) => {
        const apps = MockDb.getApplications();
        const index = apps.findIndex(a => a.id === payload.id);
        if (index === -1) return { error: { status: 404, data: 'Application not found' } };
        
        apps[index] = { ...apps[index], status: payload.status };
        if (payload.interviewDate) {
          apps[index].interviewDate = payload.interviewDate;
        }
        MockDb.setApplications(apps);
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
