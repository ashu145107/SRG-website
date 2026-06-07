/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { User } from '../types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      queryFn: async () => {
        return { data: MockDb.getUsers() };
      },
      providesTags: ['User']
    }),
    updateUser: builder.mutation<User, Partial<User> & { id: string }>({
      queryFn: async (updatedUser) => {
        const users = MockDb.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index === -1) {
          return { error: { status: 404, data: 'User not found' } };
        }
        users[index] = { ...users[index], ...updatedUser };
        MockDb.setUsers(users);
        return { data: users[index] };
      },
      invalidatesTags: ['User']
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      queryFn: async (userId) => {
        const users = MockDb.getUsers();
        const updated = users.filter(u => u.id !== userId);
        MockDb.setUsers(updated);
        return { data: { success: true } };
      },
      invalidatesTags: ['User']
    })
  })
});

export const { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } = userApi;
