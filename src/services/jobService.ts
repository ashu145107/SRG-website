/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FINAL EMPLOYER JOB SERVICE (Role = 2)
 * - Always uses /api/v1/jobsearch
 * - Attaches token from Redux (via axiosInstance)
 * - Tries many param formats + companyId
 * - Returns [] on any error (no mock data)
 * - Employer view will show "No active jobs"
 */

import axiosInstance from './axiosInstance';
import { store } from '../store';
import {
  JobRequirement,
  JobSearchParams,
} from './jobTypes';

export const jobService = {
  /**
   * GET /api/v1/jobsearch for EMPLOYERS (role 2)
   */
  searchJobs: async (params?: JobSearchParams): Promise<JobRequirement[]> => {
    const state = store.getState();
    const token = state.auth?.token;
    const user = state.auth?.user;

    const page = params?.page || 1;
    const limit = params?.limit || 100;
    const searchPhrase = params?.searchPhrase?.trim() || '';

    // Detect employer (support number 2)
    const role = user?.role;
    const isEmployer =
      role === 2 ||
      role === '2' ||
      String(role).toUpperCase() === 'COMPANY' ||
      String(role).toUpperCase() === 'EMPLOYER';

    const companyId = user?.companyId;

    console.log('[jobService] Employer searchJobs | role=', role, '| companyId=', companyId, '| token?', !!token);

    // Multiple attempts with different param styles
    const attempts: Array<{ url: string; params: any }> = [
      // 1. No params
      { url: '/api/v1/jobsearch', params: {} },

      // 2. Pagination only
      { url: '/api/v1/jobsearch', params: { page, limit } },
      { url: '/api/v1/jobsearch', params: { page, pageSize: limit } },
      { url: '/api/v1/jobsearch', params: { Page: page, PageSize: limit } },

      // 3. With companyId (very important for employers)
      ...(companyId ? [
        { url: '/api/v1/jobsearch', params: { companyId, page, limit } },
        { url: '/api/v1/jobsearch', params: { companyId, page, pageSize: limit } },
      ] : []),

      // 4. With search
      ...(searchPhrase ? [
        { url: '/api/v1/jobsearch', params: { searchPhrase, page, limit } },
        { url: '/api/v1/jobsearch', params: { search: searchPhrase, page, limit } },
      ] : []),
    ];

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      const cleanParams = Object.fromEntries(
        Object.entries(attempt.params).filter(([_, v]) => v != null && v !== '')
      );

      try {
        console.log(`[jobService] Attempt ${i + 1}: ${attempt.url}`, cleanParams);

        const response = await axiosInstance.get(attempt.url, {
          params: cleanParams,
        });

        const data = response.data;
        let list: JobRequirement[] = [];

        if (Array.isArray(data)) list = data;
        else if (data?.value && Array.isArray(data.value)) list = data.value;
        else if (data?.data && Array.isArray(data.data)) list = data.data;
        else if (data?.items && Array.isArray(data.items)) list = data.items;
        else if (data?.results && Array.isArray(data.results)) list = data.results;
        else if (data?.jobRequirements && Array.isArray(data.jobRequirements)) list = data.jobRequirements;

        console.log(`[jobService] ✅ Success → ${list.length} jobs`);
        return list;

      } catch (err: any) {
        const status = err?.response?.status;
        console.warn(`Attempt ${i + 1} failed with status ${status || 'network'}`);
      }
    }

    console.error('[jobService] All attempts failed. Returning [] (no mock data)');
    return [];
  },

  // Other methods (add, edit, details) can stay as before
  addJobRequirement: async (payload: any) => {
    const res = await axiosInstance.post('/api/v1/addjobrequirement', payload);
    return res.data;
  },

  getJobDetails: async (id: number) => {
    const res = await axiosInstance.get(`/api/v1/jobrequirement/${id}`);
    return res.data;
  },
};

export default jobService;
