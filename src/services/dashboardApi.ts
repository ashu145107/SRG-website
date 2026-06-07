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
    getDashboardStats: builder.query<DashboardStats, void>({
      queryFn: async () => {
        const users = MockDb.getUsers();
        const jobs = MockDb.getJobs();
        const companies = MockDb.getCompanies();
        const candidates = MockDb.getCandidates();
        const shgs = MockDb.getSHGs();
        const applications = MockDb.getApplications();

        const recentActivities = [
          {
            id: 'act-1',
            user: 'Rahul Ramesh Patil',
            action: 'Applied to Junior Software Engineer at TCS',
            time: '1 hour ago',
            module: 'Candidate'
          },
          {
            id: 'act-2',
            user: 'Milind Deshmukh (TCS)',
            action: 'Posted new vacancy Junior Software Engineer',
            time: '2 hours ago',
            module: 'Company'
          },
          {
            id: 'act-3',
            user: 'Sunita Vinay Joshi',
            action: 'Added product अष्टगंध अगरबत्ती in catalog',
            time: '1 day ago',
            module: 'SHG'
          },
          ...applications.slice(0, 3).map((app, idx) => ({
            id: `act-app-${idx}`,
            user: app.candidateName,
            action: `Applied for ${app.jobTitle} vacancy`,
            time: 'Recent',
            module: 'Candidate'
          }))
        ];

        return {
          data: {
            totalUsers: users.length,
            totalJobs: jobs.length,
            activeJobs: jobs.filter(j => j.isApproved).length,
            totalCompanies: companies.length,
            approvedCompanies: companies.filter(c => c.isApproved).length,
            totalCandidates: candidates.length,
            totalSHGs: shgs.length,
            recentActivities
          }
        };
      },
      providesTags: ['User', 'Job', 'Company', 'Candidate', 'SHG', 'Application']
    })
  })
});

export const { useGetDashboardStatsQuery } = dashboardApi;
