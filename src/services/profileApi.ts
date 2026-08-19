/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { axiosInstance } from './axiosInstance';
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

/**
 * Upload profile picture via POST /api/v1/profilepic (multipart/form-data).
 * Uses axiosInstance (which auto-attaches JWT from Redux/localStorage).
 */
export const uploadProfilePic = async (file: File): Promise<{ success: boolean; message: string; url?: string }> => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  console.log('[uploadProfilePic] Sending file:', file.name, 'size:', file.size, 'type:', file.type);

  try {
    const res = await axiosInstance.post('/api/v1/profilepic', formData);
    console.log('[uploadProfilePic] Response:', res.data);
    const data = res.data?.value || res.data?.data || res.data;
    return { success: true, message: 'Profile picture updated successfully.', url: data?.profilePicUrl || data?.url || '' };
  } catch (err: any) {
    console.error('[uploadProfilePic] Error:', err.response?.status, err.response?.data);
    const detail = err.response?.data?.message || err.response?.data?.error || err.response?.data || '';
    const msg = (typeof detail === 'string' ? detail : JSON.stringify(detail)) || err.message || 'Failed to upload profile picture.';
    return { success: false, message: msg };
  }
};

/**
 * Upload resume via POST /api/v1/resume (multipart/form-data).
 * Uses axiosInstance (which auto-attaches JWT from Redux/localStorage).
 */
export const uploadResume = async (file: File): Promise<{ success: boolean; message: string; url?: string; name?: string }> => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  console.log('[uploadResume] Sending file:', file.name, 'size:', file.size, 'type:', file.type);

  try {
    const res = await axiosInstance.post('/api/v1/resume', formData);
    console.log('[uploadResume] Response:', res.data);
    const data = res.data?.value || res.data?.data || res.data;
    return { success: true, message: 'Resume updated successfully.', url: data?.resumeUrl || data?.url || '', name: data?.resumeName || file.name };
  } catch (err: any) {
    console.error('[uploadResume] Error:', err.response?.status, err.response?.data);
    const detail = err.response?.data?.message || err.response?.data?.error || err.response?.data || '';
    const msg = (typeof detail === 'string' ? detail : JSON.stringify(detail)) || err.message || 'Failed to upload resume.';
    return { success: false, message: msg };
  }
};
