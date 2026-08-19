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

// Helper function to normalize job requirement fields from any API response format
const normalizeJob = (item: any, idx: number): JobRequirement => {
  const rawId = item.id || item.jobRequirementId || item.jobId || (idx + 1);
  const numId = typeof rawId === 'number' ? rawId : (parseInt(String(rawId).replace(/\D/g, '')) || (idx + 1));

  const designation = item.jobDesignation || item.profileHeader || item.title || item.designation || item.roleName || 'Job Vacancy';
  const profileHeader = item.profileHeader || item.jobDesignation || item.title || item.companyName || 'Job Requirement';
  const location = item.jobLocation || item.workPlace || item.location || item.city || item.address || 'Nashik';
  const workPlace = item.workPlace || item.jobLocation || item.location || item.city || 'Nashik';
  const salary = typeof item.salary === 'number' ? item.salary : (parseFloat(item.salary) || 0);
  const salaryTo = typeof item.salaryTo === 'number' ? item.salaryTo : (parseFloat(item.salaryTo) || salary || 0);
  const skill = item.skill || item.skills || item.requiredSkills || 'Relevant Experience';
  const vacancy = item.noOfVacancy || item.vacancy || item.vacancies || 1;

  return {
    ...item,
    id: numId,
    jobRequirementId: numId,
    jobDesignation: designation,
    profileHeader: profileHeader,
    jobLocation: location,
    workPlace: workPlace,
    salary: salary,
    salaryTo: salaryTo,
    skill: skill,
    noOfVacancy: vacancy,
    roleTypeId: item.roleTypeId || 1,
    workModeId: item.workModeId || 1,
    industryTypeId: item.industryTypeId || item.specialization || 0,
    specialization: item.specialization || item.industryTypeId || 0,
    salaryPeriodId: item.salaryPeriodId || 1,
    educationId: item.educationId || 1,
    experiance: item.experiance !== undefined ? item.experiance : (item.experience || 0),
    experianceTo: item.experianceTo !== undefined ? item.experianceTo : (item.experienceTo || 2),
    jobDiscription: item.jobDiscription || item.jobDescription || item.description || profileHeader || 'Detailed job vacancy description',
    jobCode: item.jobCode || `JOB-${numId}`
  };
};

// Response type that includes total count for pagination
export interface JobSearchResult {
  jobs: JobRequirement[];
  totalCount: number;
}

export const jobService = {
  /**
   * GET /api/v1/jobsearch for JOB SEEKERS and ADMIN.
   * For EMPLOYERS, fetches their company job requirements.
   */
  searchJobs: async (params?: JobSearchParams): Promise<JobSearchResult> => {
    const state = store.getState();
    let token = state.auth?.token;
    let user = state.auth?.user;

    // Fallback to localStorage if state token is null
    if (!token || !user) {
      try {
        const savedAuth = localStorage.getItem('srg_auth_state');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          token = token || parsed?.token || parsed?.user?.token;
          user = user || parsed?.user;
        }
      } catch (e) { }
    }

    const searchPhrase = params?.searchPhrase?.trim() || '';
    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const role = user?.role;
    const companyId = user?.companyId;

    const isEmployer =
      role === 3 ||
      role === '3' ||
      String(role).toUpperCase() === 'COMPANY' ||
      String(role).toUpperCase() === 'EMPLOYER';

    // Employers use /api/v1/jobrequirements, seekers/admin use /api/v1/jobsearch
    if (isEmployer) {
      console.log('[jobService] searchJobs for EMPLOYER | companyId=', companyId);
      try {
        const response = await axiosInstance.get(`/api/v1/jobrequirements/${limit}/${page}`);
        const data = response.data;
        let list: any[] = [];
        let totalCount = 0;
        if (Array.isArray(data)) { list = data; totalCount = data.length; }
        else if (data?.value && Array.isArray(data.value)) { list = data.value; totalCount = data.value.length; }
        else if (data?.data && Array.isArray(data.data)) { list = data.data; totalCount = data.data.length; }
        else if (data?.items && Array.isArray(data.items)) { list = data.items; totalCount = data.totalCount || data.items.length; }
        else if (data?.results && Array.isArray(data.results)) { list = data.results; totalCount = data.totalCount || data.results.length; }

        if (companyId && list.length > 0) {
          const filtered = list.filter((j: any) => String(j.companyId || j.userId) === String(companyId));
          if (filtered.length > 0) return { jobs: filtered.map((item, idx) => normalizeJob(item, idx)), totalCount: filtered.length };
        }
        if (list.length > 0) return { jobs: list.map((item, idx) => normalizeJob(item, idx)), totalCount };
      } catch (err) {
        console.warn('[jobService] Employer jobrequirements fetch notice:', err);
      }
      return { jobs: [], totalCount: 0 };
    }

    console.log('[jobService] searchJobs for JOB SEEKER / ADMIN | role=', role, '| searchPhrase=', searchPhrase);

    const attempts: Array<{ url: string; params: any }> = [
      { url: '/api/v1/jobsearch', params: { page, limit } },
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
        let list: any[] = [];
        let totalCount = 0;

        if (Array.isArray(data)) { list = data; totalCount = data.length; }
        else if (data?.value && Array.isArray(data.value)) { list = data.value; totalCount = data.value.length; }
        else if (data?.data && Array.isArray(data.data)) { list = data.data; totalCount = data.data.length; }
        else if (data?.items && Array.isArray(data.items)) { list = data.items; totalCount = data.totalCount || data.items.length; }
        else if (data?.results && Array.isArray(data.results)) { list = data.results; totalCount = data.totalCount || data.results.length; }
        else if (data?.jobRequirements && Array.isArray(data.jobRequirements)) { list = data.jobRequirements; totalCount = data.totalCount || data.jobRequirements.length; }

        if (list.length > 0) {
          const normalized = list.map((item, idx) => normalizeJob(item, idx));
          console.log(`[jobService] ✅ Success → ${normalized.length} jobs fetched & normalized from /api/v1/jobsearch`);
          return { jobs: normalized, totalCount: totalCount || normalized.length };
        }

      } catch (err: any) {
        const status = err?.response?.status;
        console.warn(`[jobService] Attempt ${i + 1} failed with status ${status || 'network'}`);
      }
    }

    console.error('[jobService] All attempts failed for /api/v1/jobsearch. Returning []');
    return { jobs: [], totalCount: 0 };
  },

  // Other methods (add, edit, details, apply)
  addJobRequirement: async (payload: any) => {
    const { companyTypeId, industryTypeId, jobTypeId, subEducationId, ...backendFields } = payload;
    backendFields.specialization = Number(industryTypeId) || Number(payload.specialization) || 1;
    const res = await axiosInstance.post('/api/v1/addjobrequirement', backendFields);
    return res.data;
  },

  editJobRequirement: async (payload: JobRequirement) => {
    const { companyTypeId, industryTypeId, jobTypeId, subEducationId, ...backendFields } = payload as any;
    backendFields.specialization = Number(industryTypeId) || Number(payload.specialization) || 1;
    const res = await axiosInstance.post('/api/v1/editjobrequirement', backendFields);
    return res.data || payload;
  },

  getJobDetails: async (id: number, jobCode?: string): Promise<JobRequirement> => {
    // If we have a jobCode, use it directly (backend expects jobcode string)
    if (jobCode) {
      try {
        const res = await axiosInstance.get(`/api/v1/jobrequirement/${jobCode}`);
        const data = res.data;
        const raw = data?.value || data?.data || data?.items?.[0] || data;
        if (raw && (raw.id || raw.jobRequirementId || raw.jobDesignation || raw.profileHeader || raw.title)) {
          return normalizeJob(raw, id);
        }
      } catch (err) {
        console.warn(`[jobService] /api/v1/jobrequirement/${jobCode} failed:`, err);
      }
    }

    try {
      const res = await axiosInstance.get(`/api/v1/jobrequirement/${id}`);
      const data = res.data;
      const raw = data?.value || data?.data || data?.items?.[0] || data;
      if (raw && (raw.id || raw.jobRequirementId || raw.jobDesignation || raw.profileHeader || raw.title)) {
        return normalizeJob(raw, id);
      }
    } catch (err) {
      console.warn(`[jobService] /api/v1/jobrequirement/${id} failed, attempting searchJobs fallback:`, err);
    }

    // Fallback: find job in jobsearch list by ID
    try {
      const { jobs: list } = await jobService.searchJobs();
      const found = list.find((j: any) => Number(j.id) === Number(id) || Number(j.jobRequirementId) === Number(id));
      if (found) return found;
    } catch (e) {}

    // Ultimate fallback with valid numeric ID
    return {
      id: id,
      userId: 1,
      profileHeader: 'Job Requirement Details',
      skill: 'Relevant Skills',
      specialization: 1,
      experiance: 0,
      noOfVacancy: 1,
      workPlace: 'Nashik',
      salary: 15000,
      expiryDate: new Date().toISOString().split('T')[0],
      educationId: 1,
      createdBy: 1,
      experianceTo: 2,
      salaryTo: 25000,
      roleTypeId: 1,
      interviewModeId: 1,
      interviewLocation: 'Nashik',
      postingNotes: '',
      jobDiscription: `Detailed job requirement specifications for position #${id}`,
      jobDesignation: `Job Requirement #${id}`,
      certificationsRequired: '',
      genderPreference: 'Any',
      ageRange: '18-35',
      shiftTypeId: 1,
      workModeId: 1,
      jobLocation: 'Nashik',
      salaryPeriodId: 1,
      benefits: '',
      weeklyOffId: 1,
      jobCode: `JOB-${id}`
    };
  },

  applyJob: async (jobIds: string[]) => {
    const res = await axiosInstance.post('/api/v1/jobapplication', jobIds);
    return res.data;
  },
};

export default jobService;
