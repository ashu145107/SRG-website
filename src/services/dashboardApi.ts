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

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<any, void>({
      queryFn: async (arg, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery('/api/v1/dashboard');
          if (result.data) {
            const responseData: any = result.data;
            if (responseData && responseData.isSuccess && responseData.value !== undefined) {
              const valObj = typeof responseData.value === 'object' && responseData.value !== null ? responseData.value : {};
              return { data: { ...valObj, isMock: false } };
            }
            const dataObj = typeof result.data === 'object' && result.data !== null ? result.data : {};
            return { data: { ...dataObj, isMock: false } };
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
            appliedJobCount: 6036,
            activityLogs: [
              {
                activityDate: "Jun 21 2026 To Jun 27 2026",
                newRequirements: "3",
                userlogin: "15",
                newRegistration: "4",
                jobApplications: "12"
              },
              {
                activityDate: "Jun 14 2026 To Jun 20 2026",
                newRequirements: "1",
                userlogin: "8",
                newRegistration: "3",
                jobApplications: "5"
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
