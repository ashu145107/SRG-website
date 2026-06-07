/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MockDb } from './mockDb';
import { User, UserRole, HandlerPermissions } from '../types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { user: User; token: string },
      { email: string; password?: string }
    >({
      queryFn: async ({ email }) => {
        // Find existing user
        const users = MockDb.getUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!found) {
          return { error: { status: 401, data: 'User not found. Please register first.' } };
        }

        return {
          data: {
            user: found,
            token: found.token || `jwt-mock-${found.id}`
          }
        };
      },
      invalidatesTags: ['User']
    }),

    register: builder.mutation<
      { user: User; token: string },
      { name: string; email: string; phone: string; role: UserRole }
    >({
      queryFn: async (payload) => {
        const users = MockDb.getUsers();
        
        // Check uniqueness
        if (users.some(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
          return { error: { status: 400, data: 'Email already registered.' } };
        }

        const newUserId = `u-${Date.now()}`;
        const token = `jwt-token-${newUserId}`;
        
        // Define references depending on role
        let companyId: string | undefined;
        let candidateId: string | undefined;
        let shgId: string | undefined;

        if (payload.role === UserRole.COMPANY) {
          companyId = `comp-${Date.now()}`;
          const comps = MockDb.getCompanies();
          comps.push({
            id: companyId,
            companyName: payload.name,
            contactPerson: 'Contact Person',
            email: payload.email,
            phone: payload.phone,
            industry: 'Unspecified',
            address: 'Maharashtra address',
            isApproved: false // Requires admin approval status! Beautiful
          });
          MockDb.setCompanies(comps);
        } else if (payload.role === UserRole.CANDIDATE) {
          candidateId = `cand-${Date.now()}`;
          const cands = MockDb.getCandidates();
          cands.push({
            id: candidateId,
            fullName: payload.name,
            email: payload.email,
            phone: payload.phone,
            city: 'Not Set',
            qualification: 'Not Set',
            experienceYears: 0,
            skills: []
          });
          MockDb.setCandidates(cands);
        } else if (payload.role === UserRole.SHG) {
          shgId = `shg-${Date.now()}`;
          const shgs = MockDb.getSHGs();
          shgs.push({
            id: shgId,
            shgName: payload.name,
            leaderName: 'Leader Name',
            phone: payload.phone,
            district: 'Not Set',
            memberCount: 5,
            activities: [],
            productShowcase: []
          });
          MockDb.setSHGs(shgs);
        }

        const handlerPermissions: HandlerPermissions | undefined = payload.role === UserRole.HANDLER ? {
          canViewUsers: true,
          canEditUsers: false,
          canApproveJobs: true,
          canManageCompanies: false,
          canManageSHG: true,
          canViewReports: true,
          canManageContent: false
        } : undefined;

        const newUser: User = {
          id: newUserId,
          email: payload.email,
          phone: payload.phone,
          name: payload.name,
          role: payload.role,
          token,
          companyId,
          candidateId,
          shgId,
          handlerPermissions
        };

        users.push(newUser);
        MockDb.setUsers(users);

        return { data: { user: newUser, token } };
      },
      invalidatesTags: ['User', 'Company', 'Candidate', 'SHG']
    }),

    verifyOtp: builder.mutation<{ success: boolean; message: string }, { otp: string; email: string }>({
      queryFn: async ({ otp }) => {
        if (otp.length === 4) {
          return { data: { success: true, message: 'OTP verified successfully.' } };
        }
        return { error: { status: 400, data: 'Invalid OTP code. Try entering a 4-digit code.' } };
      }
    }),

    resetPassword: builder.mutation<{ success: boolean; message: string }, { email: string }>({
      queryFn: async () => {
        return { data: { success: true, message: 'Password recovery notification sent successfully.' } };
      }
    })
  })
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation
} = authApi;
