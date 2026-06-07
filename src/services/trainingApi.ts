/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { Training, SHGProfile } from '../types';

export const trainingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTrainings: builder.query<Training[], void>({
      queryFn: async () => {
        return { data: MockDb.getTrainings() };
      },
      providesTags: ['Training']
    }),
    createTraining: builder.mutation<Training, Omit<Training, 'id'>>({
      queryFn: async (payload) => {
        const list = MockDb.getTrainings();
        const fresh: Training = {
          ...payload,
          id: `t-${Date.now()}`
        };
        list.push(fresh);
        localStorage.setItem('srg_trainings', JSON.stringify(list));
        return { data: fresh };
      },
      invalidatesTags: ['Training']
    }),
    getSHGProfiles: builder.query<SHGProfile[], void>({
      queryFn: async () => {
        return { data: MockDb.getSHGs() };
      },
      providesTags: ['SHG']
    }),
    getSHGById: builder.query<SHGProfile, string>({
      queryFn: async (id) => {
        const shgs = MockDb.getSHGs();
        const found = shgs.find(s => s.id === id);
        if (!found) return { error: { status: 404, data: 'SHG profile not found' } };
        return { data: found };
      },
      providesTags: (result, error, id) => [{ type: 'SHG', id }]
    }),
    updateSHGProfile: builder.mutation<SHGProfile, Partial<SHGProfile> & { id: string }>({
      queryFn: async (updated) => {
        const shgs = MockDb.getSHGs();
        const index = shgs.findIndex(s => s.id === updated.id);
        if (index === -1) {
          const fresh: SHGProfile = {
            id: updated.id,
            shgName: updated.shgName || 'New SHG',
            leaderName: updated.leaderName || 'Leader',
            phone: updated.phone || '',
            district: updated.district || 'Nashik',
            memberCount: updated.memberCount || 5,
            activities: updated.activities || [],
            productShowcase: updated.productShowcase || []
          };
          shgs.push(fresh);
          MockDb.setSHGs(shgs);
          return { data: fresh };
        }
        shgs[index] = { ...shgs[index], ...updated } as SHGProfile;
        MockDb.setSHGs(shgs);
        return { data: shgs[index] };
      },
      invalidatesTags: (result, error, arg) => ['SHG', { type: 'SHG', id: arg.id }]
    })
  })
});

export const {
  useGetTrainingsQuery,
  useCreateTrainingMutation,
  useGetSHGProfilesQuery,
  useGetSHGByIdQuery,
  useUpdateSHGProfileMutation
} = trainingApi;
