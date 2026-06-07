/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { Job } from '../types';

export const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query<Job[], { approvedOnly?: boolean; companyId?: string; search?: string } | void>({
      queryFn: async (params) => {
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
