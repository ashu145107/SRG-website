/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';

export interface ReportItem {
  id: string;
  name: string;
  count: number;
  status: string;
  date: string;
}

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<{ applicationsByStatus: ReportItem[]; shgStats: ReportItem[] }, void>({
      queryFn: async () => {
        const apps = MockDb.getApplications();
        const shgs = MockDb.getSHGs();

        // Group applications by status
        const statusMap: Record<string, number> = {};
        apps.forEach(a => {
          statusMap[a.status] = (statusMap[a.status] || 0) + 1;
        });

        const applicationsByStatus = Object.keys(statusMap).map((k, i) => ({
          id: `rep-app-${i}`,
          name: k,
          count: statusMap[k],
          status: 'Active',
          date: new Date().toISOString().split('T')[0]
        }));

        const shgStats = shgs.map(s => ({
          id: s.id,
          name: s.shgName,
          count: s.memberCount,
          status: s.activities.join(', ') || 'General Self-Employment',
          date: 'Active'
        }));

        return { data: { applicationsByStatus, shgStats } };
      },
      providesTags: ['Application', 'SHG']
    })
  })
});

export const { useGetReportsQuery } = reportApi;
