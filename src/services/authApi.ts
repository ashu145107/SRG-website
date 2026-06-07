/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi, getApiBaseUrl, getClientIp } from './baseApi';
import { MockDb } from './mockDb';
import { User, UserRole, HandlerPermissions } from '../types';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { user: User; token: string },
      { email: string; password?: string }
    >({
      queryFn: async ({ email, password }) => {
        const inputVal = email.trim().toLowerCase();
        const users = MockDb.getUsers();
        
        // Match against list of demo accounts first for local convenience
        const isDemo = ['admin@dindori.org123', 'admin@dindori.org', 'employer@tata.com', 'candidate@gmail.com', 'shg@shg.org', 'handler@dindori.org'].includes(inputVal);
        const foundDemo = users.find(u => u.email.toLowerCase() === inputVal || u.name.toLowerCase() === inputVal);

        if (isDemo && foundDemo) {
          return {
            data: {
              user: foundDemo,
              token: foundDemo.token || `jwt-mock-${foundDemo.id}`
            }
          };
        }

        // Otherwise, connect to real Swagger API!
        try {
          const clientIp = await getClientIp();

          const res = await fetch(`${getApiBaseUrl()}/api/v1/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              userName: email.trim(),
              password: password || '',
              clientIp
            })
          });

          if (!res.ok) {
            return {
              error: {
                status: res.status,
                data: `API Server connection failed. Status code: ${res.status}`
              }
            };
          }

          const responseData = await res.json();
          if (responseData && responseData.isSuccess) {
            const val = responseData.value || {};
            
            // Build a resilient User profile
            const loggedUser: User = {
              id: val.id ? `u-${val.id}` : `u-${Date.now()}`,
              email: val.email || val.userName || email,
              phone: val.phoneNumber || val.phone || 'Not Available',
              name: val.name || val.userName || email.split('@')[0],
              role: val.role || UserRole.CANDIDATE, // Default to Candidate if not specified
              token: val.token || `jwt-real-${val.id || Date.now()}`,
              companyId: val.companyId,
              candidateId: val.candidateId,
              shgId: val.shgId
            };

            return {
              data: {
                user: loggedUser,
                token: loggedUser.token || ''
              }
            };
          } else {
            const errorMessage = responseData?.error?.message || 'The user credentials or login sequence is invalid.';
            return {
              error: {
                status: 401,
                data: errorMessage
              }
            };
          }
        } catch (err: any) {
          return {
            error: {
              status: 500,
              data: `नेटवर्क कनेक्शन एरर / Server Connection Error: ${err.message || err}`
            }
          };
        }
      },
      invalidatesTags: ['User']
    }),

    register: builder.mutation<
      { user: User; token: string },
      {
        name: string;
        email: string;
        phone: string;
        role: UserRole;
        countryName?: string;
        stateName?: string;
        districtName?: string;
        talukaName?: string;
        sevaKendraName?: string;
        educationName?: string;
        subEducationName?: string;
        gender?: string;
        experience?: string;
      }
    >({
      queryFn: async (payload) => {
        const users = MockDb.getUsers();
        
        // Check uniqueness only if email is provided
        if (payload.email && payload.email.trim()) {
          const emailCheck = payload.email.trim().toLowerCase();
          if (users.some(u => u.email && u.email.toLowerCase() === emailCheck)) {
            return { error: { status: 400, data: 'ईमेल आधीच नोंदणीकृत आहे. / Email already registered.' } };
          }
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
            email: payload.email || `${payload.phone}@dindori-employer.org`,
            phone: payload.phone,
            industry: payload.subEducationName || 'Unspecified',
            address: `${payload.sevaKendraName || ''}, ${payload.talukaName || ''}, ${payload.districtName || ''}, ${payload.stateName || ''}`,
            isApproved: false // Requires admin approval status! Beautiful
          });
          MockDb.setCompanies(comps);
        } else if (payload.role === UserRole.CANDIDATE) {
          candidateId = `cand-${Date.now()}`;
          const cands = MockDb.getCandidates();
          cands.push({
            id: candidateId,
            fullName: payload.name,
            email: payload.email || `${payload.phone}@dindori-candidate.org`,
            phone: payload.phone,
            city: payload.sevaKendraName ? `${payload.sevaKendraName}, ${payload.talukaName || ''}, ${payload.districtName || ''}` : `${payload.talukaName || ''}, ${payload.districtName || ''}`,
            qualification: payload.educationName ? (payload.subEducationName ? `${payload.educationName} - ${payload.subEducationName}` : payload.educationName) : 'Not Set',
            experienceYears: payload.experience ? Number(payload.experience) : 0,
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
            district: payload.districtName || 'Not Set',
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
          email: payload.email || `${payload.phone}@dindori.org`,
          phone: payload.phone,
          name: payload.name,
          role: payload.role,
          token,
          companyId,
          candidateId,
          shgId,
          handlerPermissions
        };

        const updatedUsers = [...users, newUser];
        MockDb.setUsers(updatedUsers);

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
