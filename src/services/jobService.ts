/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axiosInstance from './axiosInstance';
import { store } from '../store';
import { MockDb } from './mockDb';
import { Job } from '../types';
import {
  JobRequirement,
  JobSearchParams,
  JobSearchResponse,
  JobDetailsResponse,
  JobApplicationRequest,
  JobApplicationResponse,
} from './jobTypes';

// Mapper utilities to map between client Job structure and Swagger JobRequirement API structure
export function mapJobToJobRequirement(job: Job): JobRequirement {
  const numericId = parseInt(job.id.replace(/\D/g, '')) || Math.floor(Math.random() * 10000) + 1000;
  return {
    id: numericId,
    userId: 1,
    profileHeader: job.companyName || 'Swami Samarth Recruiter',
    skill: job.requirements ? job.requirements.join(', ') : 'None',
    specialization: 1,
    experiance: 1,
    noOfVacancy: 1,
    workPlace: job.location || 'Nashik',
    salary: parseInt(String(job.salary).replace(/\D/g, '')) || 200000,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    educationId: 1,
    createdBy: 1,
    experianceTo: 3,
    salaryTo: parseInt(String(job.salary).replace(/\D/g, '')) * 1.5 || 300000,
    roleTypeId: 1,
    interviewModeId: 1,
    interviewLocation: job.location || 'Nashik',
    postingNotes: 'General placement support',
    jobDiscription: job.description || 'Job role and responsibilities',
    jobDesignation: job.title || 'Job Role',
    certificationsRequired: 'None',
    genderPreference: 'All',
    ageRange: '18-40',
    shiftTypeId: 1,
    workModeId: job.type === 'Remote' ? 2 : 1,
    jobLocation: job.location || 'Nashik',
    salaryPeriodId: 1,
    benefits: 'EPF, Insurance',
    weeklyOffId: 1,
    jobCode: `JOB-${job.id}`
  };
}

export function mapJobRequirementToJob(req: JobRequirement, companyName?: string): Job {
  const jobTypesMap: Record<number, 'Full-time' | 'Part-time' | 'Contract' | 'Remote'> = {
    1: 'Full-time',
    2: 'Part-time',
    3: 'Contract',
    4: 'Remote'
  };
  
  return {
    id: `job-${req.id || Date.now()}`,
    title: req.jobDesignation || req.profileHeader || 'Job Requirement',
    companyId: `comp-${req.createdBy || req.userId || 1}`,
    companyName: companyName || req.profileHeader || 'Swami Samarth Recruiter',
    location: req.jobLocation || req.workPlace || 'Nashik',
    salary: req.salaryTo ? `₹${req.salary} - ₹${req.salaryTo}` : `₹${req.salary || 180000}`,
    description: req.jobDiscription || 'No description provided.',
    requirements: req.skill ? req.skill.split(',').map(s => s.trim()) : [],
    type: jobTypesMap[req.workModeId] || 'Full-time',
    category: 'Employment',
    createdAt: new Date().toISOString().split('T')[0],
    isApproved: true
  };
}

export const jobService = {
  /**
   * API 1: Employer Add Job Requirement
   * POST /api/v1/addjobrequirement
   */
  addJobRequirement: async (payload: JobRequirement): Promise<JobRequirement> => {
    try {
      const response = await axiosInstance.post<JobRequirement>('/api/v1/addjobrequirement', payload);
      return response.data;
    } catch (err) {
      console.warn('addJobRequirement API failed, saving to local MockDb:', err);
      const jobs = MockDb.getJobs();
      const newJob = mapJobRequirementToJob(payload);
      jobs.push(newJob);
      MockDb.setJobs(jobs);
      return payload;
    }
  },

  /**
   * API 2: Edit Job Requirement
   * POST /api/v1/editjobrequirement
   */
  editJobRequirement: async (payload: JobRequirement): Promise<JobRequirement> => {
    try {
      const response = await axiosInstance.post<JobRequirement>('/api/v1/editjobrequirement', payload);
      return response.data;
    } catch (err) {
      console.warn('editJobRequirement API failed, saving to local MockDb:', err);
      const jobs = MockDb.getJobs();
      const targetId = `job-${payload.id}`;
      const idx = jobs.findIndex(j => j.id === targetId || j.id === String(payload.id));
      if (idx !== -1) {
        jobs[idx] = { ...jobs[idx], ...mapJobRequirementToJob(payload, jobs[idx].companyName) };
        MockDb.setJobs(jobs);
      } else {
        jobs.push(mapJobRequirementToJob(payload));
        MockDb.setJobs(jobs);
      }
      return payload;
    }
  },

  /**
   * API 3: Paginated Job Requirements List or Search Jobs
   * Admin roles: GET /api/v1/jobrequirements/{pageSize}/{pageNumber}
   * Non-admin roles: GET /api/v1/jobsearch
   */
  searchJobs: async (params?: JobSearchParams): Promise<JobRequirement[]> => {
    const pageNumber = params?.page || 1;
    const pageSize = params?.limit || 100; // Use a reasonable default of 100 to load a good set of listings if not specified
    
    // Check if the current user has an Admin role (SUPER_ADMIN, ADMIN, HANDLER)
    let isAdmin = false;
    try {
      const state = store.getState();
      const role = state.auth?.user?.role;
      isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'HANDLER';
    } catch (e) {
      console.warn('Could not read auth state from store', e);
    }
    
    try {
      let response;
      if (isAdmin) {
        response = await axiosInstance.get<any>(`/api/v1/jobrequirements/${pageSize}/${pageNumber}`);
      } else {
        response = await axiosInstance.get<any>('/api/v1/jobsearch', { params });
      }
      
      let list: JobRequirement[] = [];
      const responseData = response?.data;
      
      if (responseData) {
        if (responseData.value !== undefined && responseData.value !== null) {
          const val = responseData.value;
          if (Array.isArray(val)) {
            list = val;
          } else if (typeof val === 'object') {
            if (Array.isArray(val.data)) list = val.data;
            else if (Array.isArray(val.items)) list = val.items;
            else if (Array.isArray(val.results)) list = val.results;
            else if (Array.isArray(val.jobRequirements)) list = val.jobRequirements;
            else {
              const arrayProp = Object.values(val).find(v => Array.isArray(v));
              if (arrayProp) list = arrayProp as JobRequirement[];
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
        if (params?.searchPhrase) {
          const q = params.searchPhrase.toLowerCase();
          list = list.filter(item => 
            (item.jobDesignation && item.jobDesignation.toLowerCase().includes(q)) ||
            (item.profileHeader && item.profileHeader.toLowerCase().includes(q)) ||
            (item.jobLocation && item.jobLocation.toLowerCase().includes(q)) ||
            (item.workPlace && item.workPlace.toLowerCase().includes(q)) ||
            (item.jobDiscription && item.jobDiscription.toLowerCase().includes(q))
          );
        }
        return list;
      }
    } catch (err) {
      console.warn(`searchJobs (isAdmin: ${isAdmin}) failed, falling back to MockDb:`, err);
    }
    
    // Fallback: Query MockDb and map results cleanly
    const jobs = MockDb.getJobs();
    let filtered = [...jobs];
    if (params?.searchPhrase) {
      const q = params.searchPhrase.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
      );
    }
    return filtered.map(j => mapJobToJobRequirement(j));
  },

  /**
   * API 4: Job Application
   * POST /api/v1/jobapplication
   */
  applyJob: async (jobIds: JobApplicationRequest): Promise<JobApplicationResponse> => {
    try {
      const response = await axiosInstance.post<JobApplicationResponse>('/api/v1/jobapplication', jobIds);
      return response.data;
    } catch (err) {
      console.warn('applyJob API failed, falling back to local MockDb:', err);
      // Save to MockDb applications list
      const apps = MockDb.getApplications();
      const jobs = MockDb.getJobs();
      
      jobIds.forEach(id => {
        const targetId = id.startsWith('job-') ? id : `job-${id}`;
        const job = jobs.find(j => j.id === targetId || j.id === String(id));
        if (job) {
          // Check if already exists
          const exists = apps.some(a => a.jobId === job.id && a.candidateId === 'cand-1');
          if (!exists) {
            apps.push({
              id: `app-${Date.now()}-${id}`,
              jobId: job.id,
              jobTitle: job.title,
              companyName: job.companyName,
              companyId: job.companyId,
              candidateId: 'cand-1',
              candidateName: 'Rahul Ramesh Patil',
              candidatePhone: '8887776660',
              status: 'Applied',
              appliedAt: new Date().toISOString().split('T')[0]
            });
          }
        }
      });
      MockDb.setApplications(apps);
      return { success: true, message: 'अर्ज यशस्वीरित्या सादर केला! / Applied successfully (Offline Mode)' };
    }
  },

  /**
   * API 5: Job Requirement Details
   * GET /api/v1/jobrequirement/{id}
   */
  getJobDetails: async (id: number): Promise<JobDetailsResponse> => {
    try {
      const response = await axiosInstance.get<JobDetailsResponse>(`/api/v1/jobrequirement/${id}`);
      if (response.data) return response.data;
    } catch (err) {
      console.warn(`getJobDetails API failed for id ${id}, falling back to local MockDb:`, err);
    }
    
    const jobs = MockDb.getJobs();
    const job = jobs.find(j => j.id === `job-${id}` || j.id === String(id) || parseInt(j.id.replace(/\D/g, '')) === id);
    if (job) {
      return mapJobToJobRequirement(job);
    }
    throw new Error('नोकरी सापडली नाही / Job Requirement not found');
  },
};

export default jobService;
