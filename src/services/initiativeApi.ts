/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { Initiative } from '../types';

export const initiativeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInitiatives: builder.query<Initiative[], void>({
      queryFn: async () => {
        return { data: MockDb.getInitiatives() };
      },
      providesTags: ['Initiative']
    }),
    createInitiative: builder.mutation<Initiative, Omit<Initiative, 'id'>>({
      queryFn: async (payload) => {
        const list = MockDb.getInitiatives();
        const fresh: Initiative = {
          ...payload,
          id: `init-${Date.now()}`
        };
        list.push(fresh);
        // Save back
        localStorage.setItem('srg_initiatives', JSON.stringify(list));
        return { data: fresh };
      },
      invalidatesTags: ['Initiative']
    })
  })
});

export const { useGetInitiativesQuery, useCreateInitiativeMutation } = initiativeApi;
