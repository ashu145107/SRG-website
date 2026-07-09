/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import jobService from '../services/jobService';
import { JobRequirement, JobSearchParams, JobApplicationRequest } from '../services/jobTypes';

// Query Keys for caching and invalidation
export const jobKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobKeys.all, 'list'] as const,
  list: (params: JobSearchParams) => [...jobKeys.lists(), params] as const,
  details: () => [...jobKeys.all, 'detail'] as const,
  detail: (id: number) => [...jobKeys.details(), id] as const,
};

/**
 * Hook to search and list jobs
 * GET /api/v1/jobsearch
 */
export const useSearchJobsQuery = (params?: JobSearchParams) => {
  return useQuery({
    queryKey: jobKeys.list(params || {}),
    queryFn: () => jobService.searchJobs(params),
    retry: 2, // Automatic retry for network/temporary failures
    staleTime: 1000 * 60 * 5, // Cache entries are fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to get specific job requirement details
 * GET /api/v1/jobrequirement/{id}
 */
export const useJobDetailsQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => jobService.getJobDetails(id),
    enabled: enabled && !!id && !isNaN(id),
    retry: 1,
    staleTime: 1000 * 60 * 10, // Cache details for 10 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to add a new job requirement
 * POST /api/v1/addjobrequirement
 */
export const useAddJobRequirementMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: JobRequirement) => jobService.addJobRequirement(payload),
    onSuccess: () => {
      // Invalidate both search lists and general job tags to trigger fresh fetches
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
};

/**
 * Hook to edit an existing job requirement
 * POST /api/v1/editjobrequirement
 */
export const useEditJobRequirementMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: JobRequirement) => jobService.editJobRequirement(payload),
    onSuccess: (data) => {
      // Invalidate general jobs list
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
      // Invalidate specific job details cache if we have an ID
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: jobKeys.detail(Number(data.id)) });
      }
    },
  });
};

/**
 * Hook to apply for a job
 * POST /api/v1/jobapplication
 */
export const useApplyJobMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (jobIds: JobApplicationRequest) => jobService.applyJob(jobIds),
    onSuccess: () => {
      // Refresh search query states to reflect changes in applied status
      queryClient.invalidateQueries({ queryKey: jobKeys.all });
    },
  });
};
