/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { User, HandlerPermissions } from '../types';

export const handlerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHandlers: builder.query<User[], void>({
      queryFn: async () => {
        const users = MockDb.getUsers();
        const handlers = users.filter(u => u.role === 'HANDLER');
        return { data: handlers };
      },
      providesTags: ['User']
    }),
    updateHandlerPermissions: builder.mutation<User, { id: string; permissions: HandlerPermissions }>({
      queryFn: async ({ id, permissions }) => {
        const users = MockDb.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return { error: { status: 404, data: 'Handler not found' } };
        
        users[index].handlerPermissions = permissions;
        MockDb.setUsers(users);
        return { data: users[index] };
      },
      invalidatesTags: ['User']
    })
  })
});

export const { useGetHandlersQuery, useUpdateHandlerPermissionsMutation } = handlerApi;
