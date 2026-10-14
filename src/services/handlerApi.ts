/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { User, HandlerPermissions } from '../types';

const handlerStore: User[] = [];

export const handlerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHandlers: builder.query<User[], void>({
      queryFn: async () => {
        const handlers = handlerStore.filter(u => u.role === 'HANDLER');
        return { data: handlers };
      },
      providesTags: ['User']
    }),
    updateHandlerPermissions: builder.mutation<User, { id: string; permissions: HandlerPermissions }>({
      queryFn: async ({ id, permissions }) => {
        const index = handlerStore.findIndex(u => u.id === id);
        if (index === -1) return { error: { status: 404, data: 'Handler not found' } };
        
        handlerStore[index].handlerPermissions = permissions;
        return { data: handlerStore[index] };
      },
      invalidatesTags: ['User']
    })
  })
});

export const { useGetHandlersQuery, useUpdateHandlerPermissionsMutation } = handlerApi;
