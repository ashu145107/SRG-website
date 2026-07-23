/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import axiosInstance from './axiosInstance';
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
      queryFn: async (filters, api) => {
        try {
          const pageSize = 100;
          const pageNumber = 1;
          const response = await axiosInstance.get<any>(`/api/v1/jobapplications/${pageSize}/${pageNumber}`);
          let list: any[] = [];
          const responseData = response.data;
          if (responseData) {
            if (responseData.value !== undefined && responseData.value !== null) {
              const val = responseData.value;
              if (Array.isArray(val)) {
                list = val;
              } else if (typeof val === 'object') {
                if (Array.isArray(val.data)) list = val.data;
                else if (Array.isArray(val.items)) list = val.items;
                else if (Array.isArray(val.results)) list = val.results;
                else if (Array.isArray(val.jobApplications)) list = val.jobApplications;
                else {
                  const arrayProp = Object.values(val).find(v => Array.isArray(v));
                  if (arrayProp) list = arrayProp as any[];
                }
              }
            } else if (Array.isArray(responseData)) {
              list = responseData;
            } else if (Array.isArray(responseData.data)) {
              list = responseData.data;
            } else if (Array.isArray(responseData.items)) {
              list = responseData.items;
            } else if (Array.isArray(responseData.results)) {
              list = responseData.results;
            }
          }
          
          if (list && list.length > 0) {
            const f = filters as { candidateId?: string; companyId?: string } | undefined;
            const mapped = list.map((item: any) => ({
              id: String(item.id || item.jobApplicationId || `app-${Date.now()}-${Math.random()}`),
              jobId: String(item.jobId || item.jobRequirementId || item.jobCode || ''),
              jobTitle: item.jobTitle || item.jobDesignation || item.title || 'Untitled Job',
              companyName: item.companyName || item.company || 'Unknown Company',
              companyId: String(item.companyId || ''),
              candidateId: String(item.candidateId || item.userId || ''),
              candidateName: item.candidateName || item.fullName || 'Candidate',
              candidatePhone: item.candidatePhone || item.phone || '',
              status: (item.status || 'Applied') as JobApplication['status'],
              appliedAt: item.appliedAt || item.createdDate || new Date().toISOString().split('T')[0],
              interviewDate: item.interviewDate || undefined
            }));

            let filtered = mapped;
            if (f?.candidateId) {
              filtered = filtered.filter(a => a.candidateId === f.candidateId);
            }
            if (f?.companyId) {
              filtered = filtered.filter(a => a.companyId === f.companyId);
            }
            return { data: filtered };
          }
        } catch (err) {
          console.warn('Failed to fetch job applications from API, falling back to mock DB:', err);
        }
        
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
