/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from './axiosInstance';
import {
  JobRequirement,
  JobSearchParams,
  JobSearchResponse,
  JobDetailsResponse,
  JobApplicationRequest,
  JobApplicationResponse,
} from './jobTypes';

export const jobService = {
  /**
   * API 1: Employer Add Job Requirement
   * POST /api/v1/addjobrequirement
   */
  addJobRequirement: async (payload: JobRequirement): Promise<JobRequirement> => {
    const response = await axiosInstance.post<JobRequirement>('/api/v1/addjobrequirement', payload);
    return response.data;
  },

  /**
   * API 2: Edit Job Requirement
   * POST /api/v1/editjobrequirement
   */
  editJobRequirement: async (payload: JobRequirement): Promise<JobRequirement> => {
    const response = await axiosInstance.post<JobRequirement>('/api/v1/editjobrequirement', payload);
    return response.data;
  },

  /**
   * API 3: Job Search
   * GET /api/v1/jobsearch
   */
  searchJobs: async (params?: JobSearchParams): Promise<JobRequirement[]> => {
    // Map params cleanly to query parameters
    const response = await axiosInstance.get<any>('/api/v1/jobsearch', { params });
    
    // Handle both direct array and wrapped response shapes
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data) {
      if (Array.isArray(response.data.data)) return response.data.data;
      if (Array.isArray(response.data.items)) return response.data.items;
      if (Array.isArray(response.data.results)) return response.data.results;
    }
    return [];
  },

  /**
   * API 4: Job Application
   * POST /api/v1/jobapplication
   */
  applyJob: async (jobIds: JobApplicationRequest): Promise<JobApplicationResponse> => {
    const response = await axiosInstance.post<JobApplicationResponse>('/api/v1/jobapplication', jobIds);
    return response.data;
  },

  /**
   * API 5: Job Requirement Details
   * GET /api/v1/jobrequirement/{id}
   */
  getJobDetails: async (id: number): Promise<JobDetailsResponse> => {
    const response = await axiosInstance.get<JobDetailsResponse>(`/api/v1/jobrequirement/${id}`);
    return response.data;
  },
};

export default jobService;
