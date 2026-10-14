/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { User } from '../types';

const userStore: User[] = [];

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      queryFn: async () => {
        return { data: [...userStore] };
      },
      providesTags: ['User']
    }),
    updateUser: builder.mutation<User, Partial<User> & { id: string }>({
      queryFn: async (updatedUser) => {
        const users = userStore;
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index === -1) {
          return { error: { status: 404, data: 'User not found' } };
        }
        users[index] = { ...users[index], ...updatedUser };
        return { data: users[index] };
      },
      invalidatesTags: ['User']
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      queryFn: async (userId) => {
        const index = userStore.findIndex(u => u.id === userId);
        if (index !== -1) userStore.splice(index, 1);
        return { data: { success: true } };
      },
      invalidatesTags: ['User']
    })
  })
});

export const { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } = userApi;
