/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { Job } from '../types';
import { store } from '../store';

import axiosInstance from './axiosInstance';

export const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<Job[], { approvedOnly?: boolean; companyId?: string; search?: string } | void>({
      queryFn: async (params) => {
        try {
          let user: any = null;
          try {
            user = store.getState().auth?.user;
            if (!user) {
              const saved = localStorage.getItem('srg_auth_state');
              if (saved) user = JSON.parse(saved)?.user;
            }
          } catch (e) {}

          const role = user?.role;
          const isEmployer =
            role === 3 || role === '3' ||
            String(role).toUpperCase() === 'COMPANY' ||
            String(role).toUpperCase() === 'EMPLOYER';

          let list: any[] = [];

          if (isEmployer) {
            try {
              const response = await axiosInstance.get('/api/v1/jobrequirements/100/1');
              const data = response.data;
              if (Array.isArray(data)) list = data;
              else if (data?.value && Array.isArray(data.value)) list = data.value;
              else if (data?.data && Array.isArray(data.data)) list = data.data;
              else if (data?.items && Array.isArray(data.items)) list = data.items;
              else if (data?.results && Array.isArray(data.results)) list = data.results;
            } catch (err) {
              console.warn('[jobApi] Employer /api/v1/jobrequirements failed:', err);
            }
          } else {
            const response = await axiosInstance.get('/api/v1/jobsearch');
            const data = response.data;
            if (Array.isArray(data)) list = data;
            else if (data?.value && Array.isArray(data.value)) list = data.value;
            else if (data?.data && Array.isArray(data.data)) list = data.data;
            else if (data?.items && Array.isArray(data.items)) list = data.items;
            else if (data?.results && Array.isArray(data.results)) list = data.results;
            else if (data?.jobRequirements && Array.isArray(data.jobRequirements)) list = data.jobRequirements;
          }

          if (list && list.length > 0) {
            let mappedJobs: Job[] = list.map((item: any, idx: number) => ({
              id: String(item.id || item.jobRequirementId || `job-${idx}`),
              title: item.jobDesignation || item.profileHeader || item.title || 'Untitled Job',
              companyName: item.companyName || item.postingNotes || 'Employer',
              companyId: String(item.companyId || item.userId || ''),
              location: item.jobLocation || item.workPlace || 'Nashik',
              salary: item.salary ? `₹${item.salary} - ₹${item.salaryTo || item.salary}` : 'Negotiable',
              description: item.jobDiscription || item.profileHeader || 'No description provided.',
              requirements: item.skill ? item.skill.split(',').map((s: string) => s.trim()) : [],
              type: item.workModeId === 1 ? 'Full-time' : item.workModeId === 2 ? 'Part-time' : 'Contract',
              category: 'General',
              isApproved: true,
              createdAt: item.expiryDate || new Date().toISOString().split('T')[0],
              jobCode: item.jobCode || '',
              userJobStatus: item.userJobStatus || item.applicationStatus || ''
            }));

            if (params) {
              if (params.approvedOnly) {
                mappedJobs = mappedJobs.filter(j => j.isApproved);
              }
              if (params.companyId) {
                mappedJobs = mappedJobs.filter(j => j.companyId === params.companyId);
              }
              if (params.search) {
                const query = params.search.toLowerCase();
                mappedJobs = mappedJobs.filter(j =>
                  j.title.toLowerCase().includes(query) ||
                  j.companyName.toLowerCase().includes(query) ||
                  j.location.toLowerCase().includes(query) ||
                  j.category.toLowerCase().includes(query)
                );
              }
            }
            return { data: mappedJobs };
          }
        } catch (err) {
          console.warn('[jobApi] Could not fetch /api/v1/jobsearch, falling back to mock data:', err);
        }

        let jobs = MockDb.getJobs();
        if (params) {
          if (params.approvedOnly) {
            jobs = jobs.filter(j => j.isApproved);
          }
          if (params.companyId) {
            jobs = jobs.filter(j => j.companyId === params.companyId);
          }
          if (params.search) {
            const query = params.search.toLowerCase();
            jobs = jobs.filter(j =>
              j.title.toLowerCase().includes(query) ||
              j.companyName.toLowerCase().includes(query) ||
              j.location.toLowerCase().includes(query) ||
              j.category.toLowerCase().includes(query)
            );
          }
        }
        return { data: jobs };
      },
      providesTags: ['Job']
    }),

    createJob: builder.mutation<Job, Omit<Job, 'id' | 'createdAt' | 'isApproved'>>({
      queryFn: async (newJobPayload) => {
        const jobs = MockDb.getJobs();
        const newJob: Job = {
          ...newJobPayload,
          id: `job-${Date.now()}`,
          isApproved: false, // In Dindori Pranit Seva portal, new job posts must be approved by Handlers/Admins! Extremely authentic
          createdAt: new Date().toISOString().split('T')[0]
        };
        jobs.push(newJob);
        MockDb.setJobs(jobs);
        return { data: newJob };
      },
      invalidatesTags: ['Job']
    }),

    updateJob: builder.mutation<Job, Partial<Job> & { id: string }>({
      queryFn: async (updates) => {
        const jobs = MockDb.getJobs();
        const idx = jobs.findIndex(j => j.id === updates.id);
        if (idx === -1) return { error: { status: 404, data: 'Job not found' } };
        
        jobs[idx] = { ...jobs[idx], ...updates };
        MockDb.setJobs(jobs);
        return { data: jobs[idx] };
      },
      invalidatesTags: ['Job']
    }),

    deleteJob: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id) => {
        const jobs = MockDb.getJobs();
        const filtered = jobs.filter(j => j.id !== id);
        MockDb.setJobs(filtered);
        return { data: { success: true } };
      },
      invalidatesTags: ['Job']
    })
  })
});

export const {
  useGetJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation
} = jobApi;
