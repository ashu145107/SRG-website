/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { MyProfile } from '../types';

/**
 * Normalize raw API response into MyProfile.
 */
const normalizeProfile = (data: any): MyProfile => {
  if (!data) return {} as MyProfile;

  const raw = data.value || data.data || data;

  return {
    id: raw.id || raw.userId || '',
    userId: raw.userId || raw.id || '',
    fullName: raw.fullName || raw.candidateName || raw.name || '',
    email: raw.email || '',
    phone: raw.phone || raw.mobile || '',
    profilePicUrl: raw.profilePicUrl || raw.profileImage || raw.photoUrl || raw.avatarUrl || '',
    resumeUrl: raw.resumeUrl || raw.resumeFileName || '',
    resumeName: raw.resumeName || raw.resumeFileName || '',
    city: raw.city || '',
    district: raw.district || '',
    address: raw.address || '',
    qualification: raw.qualification || raw.education || '',
    experienceYears: raw.experienceYears || raw.experience || 0,
    skills: Array.isArray(raw.skills) ? raw.skills : typeof raw.skills === 'string' ? raw.skills.split(',').map((s: string) => s.trim()) : [],
    companyName: raw.companyName || '',
    contactPerson: raw.contactPerson || '',
    industry: raw.industry || '',
    isApproved: raw.isApproved,
  };
};

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/v1/myprofile
     * Returns the logged-in user's profile (candidate, employer, SHG, etc.)
     * Auth: Bearer token (auto-attached by baseApi prepareHeaders).
     */
    getMyProfile: builder.query<MyProfile, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        try {
          const result = await baseQuery('/api/v1/myprofile');
          if (result.data) {
            return { data: normalizeProfile(result.data) };
          }
          if (result.error) {
            console.error('[profileApi] getMyProfile error:', result.error);
            return { error: result.error };
          }
          return { data: {} as MyProfile };
        } catch (err) {
          console.error('[profileApi] getMyProfile failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
      },
      providesTags: ['Candidate', 'Company'],
    }),
  }),
});

export const { useGetMyProfileQuery } = profileApi;
