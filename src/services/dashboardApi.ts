/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';

export interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalCompanies: number;
  approvedCompanies: number;
  totalCandidates: number;
  totalSHGs: number;
  recentActivities: { id: string; user: string; action: string; time: string; module: string }[];
}

const pickNum = (obj: any, keys: string[]): number => {
  if (!obj || typeof obj !== 'object') return 0;
  for (const key of keys) {
    const v = obj[key];
    if (v !== undefined && v !== null && v !== '') {
      if (typeof v === 'number') return v;
      const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
};

const normalizeDashboardValue = (value: any): any => {
  const valObj = typeof value === 'object' && value !== null ? value : {};
  const norm: any = { ...valObj };

  const cd = valObj.candidateDashboard;
  if (cd && typeof cd === 'object') {
    norm.candidateDashboard = {
      ...cd,
      ProfileComp: pickNum(cd, ['ProfileComp', 'profileComp', 'profileCompletion', 'ProfileCompletion']),
      AppliedJobCount: pickNum(cd, [
        'AppliedJobCount', 'appliedJobCount', 'appliedCount', 'appliedJobsCount',
        'totalApplications', 'TotalApplications', 'jobApplications', 'totalApplied'
      ]),
      ProfileDownloadCount: pickNum(cd, ['ProfileDownloadCount', 'profileDownloadCount', 'resumeDownloadCount']),
      ProfileViewCount: pickNum(cd, ['ProfileViewCount', 'profileViewCount'])
    };
  }

  const ed = valObj.employerDashboard;
  if (ed && typeof ed === 'object') {
    norm.employerDashboard = {
      ...ed,
      appliedJobCount: pickNum(ed, ['appliedJobCount', 'AppliedJobCount', 'appliedCount', 'totalApplications']),
      requirementCount: pickNum(ed, ['requirementCount', 'RequirementCount', 'activeJobs']),
      profileViewCount: pickNum(ed, ['profileViewCount', 'ProfileViewCount', 'profileViews'])
    };
  }

  const ad = valObj.adminDashboard;
  if (ad && typeof ad === 'object') {
    norm.adminDashboard = {
      ...ad,
      userRegistrationCount: pickNum(ad, ['userRegistrationCount', 'UserRegistrationCount', 'totalUsers', 'userCount']),
      companyRegistrationCount: pickNum(ad, ['companyRegistrationCount', 'CompanyRegistrationCount', 'totalCompanies', 'companyCount']),
      requirementCount: pickNum(ad, ['requirementCount', 'RequirementCount', 'jobRequirementCount', 'JobRequirementCount', 'totalRequirements', 'activeJobs', 'jobCount']),
      appliedJobCount: pickNum(ad, ['appliedJobCount', 'AppliedJobCount', 'totalApplications', 'jobApplications'])
    };
  }

  return norm;
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<any, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        // Fetch the total requirement count from the same paginated endpoint the
        // admin Job Requirement list table uses, so the widget stays in sync.
        const fetchRequirementTotal = async (): Promise<number> => {
          try {
            const reqRes = await baseQuery('/api/v1/jobrequirements/1/1');
            const d: any = reqRes.data;
            if (!d) return 0;
            const value: any = d.value !== undefined ? d.value : d;
            if (Array.isArray(value)) return value.length;
            if (value && typeof value === 'object') {
              const tc = value.totalRecords ?? value.totalCount ?? value.total ?? value.count;
              if (typeof tc === 'number' && !isNaN(tc) && tc > 0) return tc;
              const arr = [value.data, value.items, value.list, value.records, value.results, value.rows].find(Array.isArray);
              return Array.isArray(arr) ? arr.length : 0;
            }
            return 0;
          } catch (err) {
            console.warn('Failed to fetch job requirements total for admin dashboard:', err);
            return 0;
          }
        };

        try {
          const result = await baseQuery('/api/v1/dashboard');
          if (result.data) {
            const responseData: any = result.data;
            let norm: any;
            if (responseData && responseData.isSuccess && responseData.value !== undefined) {
              norm = { ...normalizeDashboardValue(responseData.value), isMock: false };
            } else {
              const dataObj = typeof result.data === 'object' && result.data !== null ? result.data : {};
              norm = { ...normalizeDashboardValue(dataObj), isMock: false };
            }
            if (norm.adminDashboard) {
              const live = await fetchRequirementTotal();
              if (live > 0) norm.adminDashboard.requirementCount = live;
            }
            return { data: norm };
          }
          if (result.error) {
            console.warn('Real dashboard API returned error:', result.error);
          }
        } catch (err) {
          console.warn('Real dashboard API failed:', err);
        }

        // --- FALLBACK MOCK DATA matching real API schema ---
        const state = api.getState() as any;
        const loggedUser = state.auth?.user;
        const roleStr = String(loggedUser?.role || '').toLowerCase();

        const users = MockDb.getUsers();
        const jobs = MockDb.getJobs();
        const companies = MockDb.getCompanies();
        const candidates = MockDb.getCandidates();
        const shgs = MockDb.getSHGs();
        const applications = MockDb.getApplications();

        let userType = 2; // Default to Candidate
        let adminDashboard = null;
        let candidateDashboard = null;
        let employerDashboard = null;

        if (roleStr === 'admin') {
          userType = 1;
          adminDashboard = {
            userRegistrationCount: 19094,
            companyRegistrationCount: 557,
            requirementCount: 480,
            appliedJobCount: 6036,
            activityLogs: [
              {
                activityDate: "Aug 30 2026 To Sep 5 2026",
                newRegistration: 1,
                jobApplications: 0,
                newRequirements: 0,
                userlogin: 2
              },
              {
                activityDate: "Sep 6 2026 To Sep 12 2026",
                newRegistration: 0,
                jobApplications: 0,
                newRequirements: 0,
                userlogin: 3
              },
              {
                activityDate: "Sep 13 2026 To Sep 19 2026",
                newRegistration: 1,
                jobApplications: 0,
                newRequirements: 0,
                userlogin: 0
              }
            ]
          };
        } else if (roleStr === 'company' || roleStr === 'employer') {
          userType = 3;
          employerDashboard = {
            appliedJobCount: 43,
            requirementCount: 10,
            profileViewCount: 4
          };
        } else {
          // Candidate/Seeker/Other
          userType = 2;
          candidateDashboard = {
            ProfileComp: 55,
            AppliedJobCount: 10,
            ProfileDownloadCount: 4,
            ProfileViewCount: 4
          };
        }

        return {
          data: {
            userType,
            adminDashboard,
            candidateDashboard,
            employerDashboard,
            isMock: true
          }
        };
      },
      providesTags: ['User', 'Job', 'Company', 'Candidate', 'SHG', 'Application']
    })
  })
});

export const { useGetDashboardStatsQuery } = dashboardApi;
