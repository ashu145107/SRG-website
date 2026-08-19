/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { store } from '../store';
import { MyProfile } from '../types';

/**
 * Normalize raw API response into MyProfile.
 * API returns: { value: { personalInfo: {...}, educationInfo: {...}, employmentHistory: [...] } }
 */
const normalizeProfile = (data: any): MyProfile => {
  if (!data) return {} as MyProfile;

  const raw = data.value || data.data || data;

  // Handle nested structure: value.personalInfo + value.educationInfo
  const personal = raw.personalInfo || raw;
  const education = raw.educationInfo || raw;

  const fullName = personal.fullName || raw.fullName || raw.candidateName || raw.name || '';
  const email = personal.email || raw.email || '';
  const phone = personal.mobile || raw.phone || raw.mobile || '';
  const profilePicUrl = personal.profilePic || raw.profilePicUrl || raw.profileImage || raw.photoUrl || raw.avatarUrl || '';
  const address = personal.address || raw.address || '';
  const district = typeof personal.district === 'string' ? personal.district : raw.district || '';
  const city = personal.city || raw.city || '';
  const qualification = education.education || raw.qualification || raw.education || '';
  const experienceYears = education.experience ?? raw.experienceYears ?? raw.experience ?? 0;
  const skills = education.skill
    ? education.skill.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(raw.skills) ? raw.skills : typeof raw.skills === 'string' ? raw.skills.split(',').map((s: string) => s.trim()) : [];
  const resumeRaw = education.resume_File_Path || raw.resumeUrl || raw.resumeFileName || '';
  // Prepend base URL if the path is relative (e.g. /Uploads/Resume/...)
  const resumeUrl = resumeRaw && !resumeRaw.startsWith('http')
    ? `https://srgapp.dindoripranit.org${resumeRaw.startsWith('/') ? '' : '/'}${resumeRaw}`
    : resumeRaw;
  const resumeName = education.resumeName || raw.resumeName || raw.resumeFileName || (resumeUrl ? resumeUrl.split('/').pop() || 'Resume' : '');

  return {
    id: personal.userId || raw.id || '',
    userId: String(personal.userId || raw.userId || raw.id || ''),
    fullName,
    email,
    phone,
    profilePicUrl,
    resumeUrl,
    resumeName,
    city,
    district,
    address,
    qualification,
    experienceYears,
    skills,
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
     * Uses direct fetch to SRG URL to bypass proxy CORS issues (same as uploadProfilePic).
     */
    getMyProfile: builder.query<MyProfile, void>({
      queryFn: async () => {
        try {
          let token = store.getState().auth?.token;
          if (!token) {
            try {
              const saved = localStorage.getItem('srg_auth_state');
              if (saved) {
                const parsed = JSON.parse(saved);
                token = parsed?.token || parsed?.user?.token;
              }
            } catch (e) {}
          }
          const cleanToken = token?.startsWith('Bearer ') ? token.slice(7) : token;

          console.log('[profileApi] getMyProfile → fetching from SRG directly');
          const res = await fetch('https://srgapp.dindoripranit.org/api/v1/myprofile', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${cleanToken}`,
              'token': cleanToken || '',
            },
          });

          const data = await res.json();
          console.log('[profileApi] getMyProfile response:', res.status, data);

          if (!res.ok) {
            return { error: { status: res.status, data: data?.message || `HTTP ${res.status}` } };
          }

          return { data: normalizeProfile(data) };
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
 * Upload profile picture via POST https://srgapp.dindoripranit.org/api/v1/profilepic
 * Direct call (bypasses proxy) — sends file as PNG with proper image MIME type.
 */
export const uploadProfilePic = async (file: File): Promise<{ success: boolean; message: string; url?: string }> => {
  // Ensure the file is sent as a PNG image
  const pngFile = new File([file], file.name.replace(/\.[^.]+$/, '.png'), { type: 'image/png' });

  const formData = new FormData();
  formData.append('file', pngFile, pngFile.name);

  // Get token from Redux store or localStorage
  let token = store.getState().auth?.token;
  if (!token) {
    try {
      const saved = localStorage.getItem('srg_auth_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        token = parsed?.token || parsed?.user?.token;
      }
    } catch (e) {}
  }
  const cleanToken = token?.startsWith('Bearer ') ? token.slice(7) : token;

  console.log('[uploadProfilePic] File:', pngFile.name, 'size:', pngFile.size, 'type:', pngFile.type);
  console.log('[uploadProfilePic] Token present:', !!cleanToken);

  try {
    const res = await fetch('https://srgapp.dindoripranit.org/api/v1/profilepic', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'token': cleanToken || '',
      },
      body: formData,
    });

    const data = await res.json();
    console.log('[uploadProfilePic] Response:', res.status, data);

    if (!res.ok) {
      const msg = data?.message || data?.error?.message || JSON.stringify(data) || `Server returned ${res.status}`;
      return { success: false, message: msg };
    }

    const val = data?.value || data?.data || data;
    return { success: true, message: 'Profile picture updated successfully.', url: val?.profilePicUrl || val?.url || '' };
  } catch (err: any) {
    console.error('[uploadProfilePic] Error:', err);
    return { success: false, message: err.message || 'Failed to upload profile picture.' };
  }
};

/**
 * Upload resume via POST https://srgapp.dindoripranit.org/api/v1/resume
 * Direct call (bypasses proxy).
 */
export const uploadResume = async (file: File): Promise<{ success: boolean; message: string; url?: string; name?: string }> => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  // Get token from Redux store or localStorage
  let token = store.getState().auth?.token;
  if (!token) {
    try {
      const saved = localStorage.getItem('srg_auth_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        token = parsed?.token || parsed?.user?.token;
      }
    } catch (e) {}
  }
  const cleanToken = token?.startsWith('Bearer ') ? token.slice(7) : token;

  console.log('[uploadResume] File:', file.name, 'size:', file.size, 'type:', file.type);

  try {
    const res = await fetch('https://srgapp.dindoripranit.org/api/v1/resume', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'token': cleanToken || '',
      },
      body: formData,
    });

    const data = await res.json();
    console.log('[uploadResume] Response:', res.status, data);

    if (!res.ok) {
      const msg = data?.message || data?.error?.message || JSON.stringify(data) || `Server returned ${res.status}`;
      return { success: false, message: msg };
    }

    const val = data?.value || data?.data || data;
    return { success: true, message: 'Resume updated successfully.', url: val?.resumeUrl || val?.url || '', name: val?.resumeName || file.name };
  } catch (err: any) {
    console.error('[uploadResume] Error:', err);
    return { success: false, message: err.message || 'Failed to upload resume.' };
  }
};
