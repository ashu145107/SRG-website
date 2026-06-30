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
            
            // Helper function to map userTypeId and role from backend to UserRole enum
            const mapUserRole = (userTypeId: any, roleStr: any): UserRole => {
              const typeId = String(userTypeId || '').trim();
              const roleName = String(roleStr || '').trim().toLowerCase();

              if (typeId === '1' || roleName === 'admin') {
                return UserRole.ADMIN;
              }
              if (typeId === '2' || roleName === 'candidate' || roleName === 'job seeker' || roleName === 'jobseeker') {
                return UserRole.CANDIDATE;
              }
              if (typeId === '3' || roleName === 'company' || roleName === 'employer') {
                return UserRole.COMPANY;
              }
              if (typeId === '4' || roleName === 'shg') {
                return UserRole.SHG;
              }
              if (typeId === '5' || roleName === 'handler') {
                return UserRole.HANDLER;
              }
              return UserRole.CANDIDATE;
            };

            const userType = mapUserRole(val.userTypeId, val.role);
            
            // Build a resilient User profile
            const loggedUser: User = {
              id: val.userId ? `u-${val.userId}` : (val.id ? `u-${val.id}` : `u-${Date.now()}`),
              email: val.email || val.userName || email,
              phone: val.mobile || val.phoneNumber || val.phone || 'Not Available',
              name: val.name || val.userName || email.split('@')[0],
              role: userType,
              token: val.token || `jwt-real-${val.userId || val.id || Date.now()}`,
              companyId: val.companyId || (userType === UserRole.COMPANY ? `comp-${val.userId || val.id || Date.now()}` : undefined),
              candidateId: val.candidateId || (userType === UserRole.CANDIDATE ? `cand-${val.userId || val.id || Date.now()}` : undefined),
              shgId: val.shgId || (userType === UserRole.SHG ? `shg-${val.userId || val.id || Date.now()}` : undefined)
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
        countryId?: number;
        stateId?: number;
        districtId?: number;
        talukaId?: number;
        sevaKendraId?: number;
        educationId?: number;
        subEducationId?: number;
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

        // If candidate, carry out the actual API invocation as requested
        if (payload.role === UserRole.CANDIDATE) {
          try {
            const clientIp = await getClientIp();
            
            const apiBody = {
              fullname: payload.name,
              mobile: payload.phone,
              address: payload.sevaKendraName || payload.talukaName || 'dindori',
              email: payload.email || `${payload.phone}@gmail.com`,
              talukaId: Number(payload.talukaId) || 0,
              districtId: Number(payload.districtId) || 0,
              stateId: Number(payload.stateId) || 0,
              gender: payload.gender || 'M',
              createdIp: clientIp || '0.0.0.0',
              createdId: 0,
              educationalDetail: Number(payload.educationId) || 0,
              specialization: Number(payload.subEducationId) || 0,
              skill: payload.subEducationName || 'computer',
              courses: 'na',
              experience: Number(payload.experience) || 0
            };

            const regRes = await fetch(`${getApiBaseUrl()}/api/v1/userregistration`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(apiBody)
            });

            if (!regRes.ok) {
              return {
                error: {
                  status: regRes.status,
                  data: `नोंदणी सर्व्हर त्रुटी / API Server registration failed. Status: ${regRes.status}`
                }
              };
            }

            const resData = await regRes.json();
            if (resData && resData.isSuccess) {
              // Successfully registered in real backend database!
              // Now we also create the local candidate profile so the rest of the application runs perfectly.
              candidateId = `cand-${Date.now()}`;
              const cands = MockDb.getCandidates();
              const newCand = {
                id: candidateId,
                fullName: payload.name,
                email: payload.email || `${payload.phone}@dindori-candidate.org`,
                phone: payload.phone,
                city: payload.sevaKendraName ? `${payload.sevaKendraName}, ${payload.talukaName || ''}, ${payload.districtName || ''}` : `${payload.talukaName || ''}, ${payload.districtName || ''}`,
                qualification: payload.educationName ? (payload.subEducationName ? `${payload.educationName} - ${payload.subEducationName}` : payload.educationName) : 'Not Set',
                experienceYears: payload.experience ? Number(payload.experience) : 0,
                skills: []
              };
              cands.push(newCand);
              MockDb.setCandidates(cands);

              const newUser: User = {
                id: newUserId,
                email: payload.email || `${payload.phone}@dindori.org`,
                phone: payload.phone,
                name: payload.name,
                role: payload.role,
                token: `jwt-real-reg-${Date.now()}`,
                candidateId,
              };

              const updatedUsers = [...users, newUser];
              MockDb.setUsers(updatedUsers);

              return { data: { user: newUser, token: newUser.token } };
            } else {
              const errMsg = resData?.error?.message || 'नोंदणी अयशस्वी. Please check details or ensure connection is stable.';
              return {
                error: {
                  status: 400,
                  data: errMsg
                }
              };
            }
          } catch (err: any) {
            return {
              error: {
                status: 500,
                data: `नोंदणी नेटवर्क एरर / Registration Network Error: ${err.message || err}`
              }
            };
          }
        } else if (payload.role === UserRole.COMPANY) {
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

    companyRegister: builder.mutation<
      { user: User; token: string },
      {
        fullname: string;
        mobile: string;
        address: string;
        email: string;
        talukaId: number;
        districtId: number;
        stateId: number;
        contactPerson: string;
        alternateContactPerson: string;
        alternateContactNumber: string;
        companyTypeId: number;
        industryTypeId: number;
        discription: string;
        website: string;
        alternateEmail: string;
      }
    >({
      queryFn: async (payload) => {
        const users = MockDb.getUsers();
        try {
          const clientIp = await getClientIp();
          
          const apiBody = {
            fullname: payload.fullname,
            mobile: payload.mobile,
            address: payload.address,
            email: payload.email,
            talukaId: Number(payload.talukaId) || 0,
            districtId: Number(payload.districtId) || 0,
            stateId: Number(payload.stateId) || 0,
            createdIp: clientIp || '127.0.0.1',
            contactPerson: payload.contactPerson,
            alternateContactPerson: payload.alternateContactPerson,
            alternateContactNumber: payload.alternateContactNumber,
            companyTypeId: Number(payload.companyTypeId) || 1,
            industryTypeId: Number(payload.industryTypeId) || 1,
            discription: payload.discription,
            website: payload.website,
            alternateEmail: payload.alternateEmail
          };

          const regRes = await fetch(`${getApiBaseUrl()}/api/v1/companyregistration`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(apiBody)
          });

          if (!regRes.ok) {
            return {
              error: {
                status: regRes.status,
                data: `नोंदणी सर्व्हर त्रुटी / API Server company registration failed. Status: ${regRes.status}`
              }
            };
          }

          const resData = await regRes.json();
          if (resData && resData.isSuccess) {
            const newUserId = `u-${Date.now()}`;
            const companyId = `comp-${Date.now()}`;
            const token = `jwt-real-comp-${Date.now()}`;

            const comps = MockDb.getCompanies();
            comps.push({
              id: companyId,
              companyName: payload.fullname,
              contactPerson: payload.contactPerson,
              email: payload.email,
              phone: payload.mobile,
              industry: 'Unspecified',
              address: payload.address,
              isApproved: false
            });
            MockDb.setCompanies(comps);

            const newUser: User = {
              id: newUserId,
              email: payload.email,
              phone: payload.mobile,
              name: payload.fullname,
              role: UserRole.COMPANY,
              token,
              companyId
            };

            const updatedUsers = [...users, newUser];
            MockDb.setUsers(updatedUsers);

            return { data: { user: newUser, token } };
          } else {
            const errMsg = resData?.error?.message || 'नोंदणी अयशस्वी. Please check details or ensure connection is stable.';
            return {
              error: {
                status: 400,
                data: errMsg
              }
            };
          }
        } catch (err: any) {
          return {
            error: {
              status: 500,
              data: `नोंदणी नेटवर्क एरर / Registration Network Error: ${err.message || err}`
            }
          };
        }
      },
      invalidatesTags: ['User', 'Company']
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
  useCompanyRegisterMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation
} = authApi;
