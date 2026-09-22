/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi } from './baseApi';
import { store } from '../store';
import { EmploymentHistory, MyProfile, UserRole } from '../types';

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
  const picRaw =
    personal.profilePic || personal.profilePicUrl || personal.photoUrl || personal.photo || personal.image ||
    personal.picPath || personal.pic_File_Path || personal.profilePic_File_Path || personal.photo_File_Path ||
    raw.profilePicUrl || raw.profileImage || raw.photoUrl || raw.avatarUrl || raw.profilePic || raw.photo || raw.image ||
    raw.picPath || raw.pic_File_Path || raw.profilePic_File_Path || raw.photo_File_Path ||
    raw.logo || raw.logoUrl || raw.companyLogo || raw.companyLogoUrl || raw.logoPath || raw.logo_File_Path || '';
  const profilePicUrl = picRaw && !picRaw.toString().startsWith('http')
    ? `https://srgapp.dindoripranit.org${picRaw.toString().startsWith('/') ? '' : '/'}${picRaw}`
    : picRaw;
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

  // Employment history array returned alongside personalInfo / educationInfo
  const rawEmployment = Array.isArray(raw.employmentHistory) ? raw.employmentHistory : [];
  const employmentHistory: EmploymentHistory[] = rawEmployment.map((h: any) => ({
    employmentHistoryId: h.employmentHistoryId ?? h.id ?? 0,
    userId: h.userId ?? 0,
    companyName: h.companyName || h.company || '',
    companyIndustryId: h.companyIndustryId ?? null,
    industryTypeName: h.industryTypeName || h.industryType || h.companyIndustryName || '',
    designation: h.designation || h.jobDesignation || '',
    department: h.department || '',
    jobTypeId: h.jobTypeId ?? null,
    jobTypeName: h.jobTypeName || h.jobType || '',
    jobLocation: h.jobLocation || h.jobPlace || h.workPlace || '',
    startDate: h.startDate || '',
    endDate: h.endDate || '',
    isCurrentJob: !!h.isCurrentJob,
  }));

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
    employmentHistory,
  };
};

/**
 * Read the auth token + role from Redux store, falling back to persisted login.
 */
const readAuth = (): { cleanToken: string | undefined; role: UserRole | undefined } => {
  let token = store.getState().auth?.token;
  let role = store.getState().auth?.user?.role;
  if (!token || !role) {
    try {
      const saved = localStorage.getItem('srg_auth_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!token) token = parsed?.token || parsed?.user?.token;
        if (!role) role = parsed?.user?.role;
      }
    } catch (e) {}
  }
  return {
    cleanToken: token?.startsWith('Bearer ') ? token.slice(7) : token,
    role,
  };
};

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/v1/myprofile        -> candidate / SHG / staff profile
     * GET /api/v1/company/myprofile -> employer (company) profile
     * Returns the logged-in user's profile.
     * Uses direct fetch to SRG URL to bypass proxy CORS issues (same as uploadProfilePic).
     */
    getMyProfile: builder.query<MyProfile, void>({
      queryFn: async () => {
        try {
          const { cleanToken, role } = readAuth();
          const isCompany = role === UserRole.COMPANY;
          const profileUrl = isCompany
            ? 'https://srgapp.dindoripranit.org/api/v1/company/myprofile'
            : 'https://srgapp.dindoripranit.org/api/v1/myprofile';

          console.log(`[profileApi] getMyProfile → fetching from SRG directly (${isCompany ? 'company' : 'default'} endpoint)`);
          const res = await fetch(profileUrl, {
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
 * Same endpoint for job seekers and employers — auth tokens come from the logged-in user.
 * Direct call (bypasses proxy) — sends file as PNG with proper image MIME type.
 */
export const uploadProfilePic = async (file: File): Promise<{ success: boolean; message: string; url?: string }> => {
  // Ensure the file is sent as a PNG image
  const pngFile = new File([file], file.name.replace(/\.[^.]+$/, '.png'), { type: 'image/png' });

  const formData = new FormData();
  formData.append('file', pngFile, pngFile.name);

  const { cleanToken } = readAuth();

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

    // API-level error even when HTTP 200
    if (data?.isSuccess === false || data?.isFailure === true || data?.error) {
      const raw = data?.message || data?.error?.message || data?.error || JSON.stringify(data);
      const msg = typeof raw === 'string' ? raw : JSON.stringify(raw);
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

    // API-level error even when HTTP 200
    if (data?.isSuccess === false || data?.isFailure === true || data?.error) {
      const raw = data?.message || data?.error?.message || data?.error || JSON.stringify(data);
      const msg = typeof raw === 'string' ? raw : JSON.stringify(raw);
      return { success: false, message: msg };
    }

    const val = data?.value || data?.data || data;
    return { success: true, message: data?.message || val?.message || val?.resultMessage || 'Resume updated successfully.', url: val?.resumeUrl || val?.url || '', name: val?.resumeName || file.name };
  } catch (err: any) {
    console.error('[uploadResume] Error:', err);
    return { success: false, message: err.message || 'Failed to upload resume.' };
  }
};

/**
 * Generic POST helper for employment history endpoints.
 * Always attaches the auth token (Authorization + token headers) before calling.
 */
const postEmploymentHistory = async (path: string, body: unknown): Promise<{ success: boolean; message: string; data?: any }> => {
  const { cleanToken } = readAuth();

  try {
    const res = await fetch(`https://srgapp.dindoripranit.org/api/v1/${path}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'token': cleanToken || '',
      },
      body: JSON.stringify(body),
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
    console.log(`[profileApi] ${path} response:`, res.status, data);

    if (!res.ok) {
      const msg = data?.message || data?.error?.message || (typeof data === 'string' ? data : null) || `Server returned ${res.status}`;
      return { success: false, message: msg, data };
    }

    // Only treat as failure when the backend explicitly marks it as one.
    // Some success responses still carry an `error` field (e.g. { code: "message" }),
    // so the mere presence of `error` must NOT be interpreted as a failure.
    const isExplicitFailure = data?.isSuccess === false || data?.isFailure === true;
    if (isExplicitFailure) {
      const raw = data?.message || data?.error?.message || data?.value || data?.error || JSON.stringify(data || {});
      const msg = typeof raw === 'string' && raw.trim() ? raw : JSON.stringify(raw);
      return { success: false, message: msg, data };
    }

    const val = data?.value ?? data?.data ?? null;
    const fallback = path === 'deleteemploymenthistory'
      ? 'Employment history deleted successfully.'
      : path === 'updateemploymenthistory'
        ? 'Employment history updated successfully.'
        : 'Employment history added successfully.';

    let msg: string = '';
    if (typeof data?.message === 'string' && data.message.trim()) msg = data.message.trim();
    if (!msg && typeof data?.resultMessage === 'string' && data.resultMessage.trim()) msg = data.resultMessage.trim();
    if (!msg && typeof val === 'string' && val.trim()) msg = val.trim();
    if (!msg && typeof val?.message === 'string' && val.message.trim()) msg = val.message.trim();
    if (!msg && typeof val?.resultMessage === 'string' && val.resultMessage.trim()) msg = val.resultMessage.trim();
    if (!msg) msg = fallback;

    return { success: true, message: msg, data: val };
  } catch (err: any) {
    console.error(`[profileApi] ${path} failed:`, err);
    return { success: false, message: err.message || `Failed to submit employment history.` };
  }
};

/** POST /api/v1/addemploymenthistory — create a new employment history entry. */
export const addEmploymentHistory = (payload: EmploymentHistory) =>
  postEmploymentHistory('addemploymenthistory', payload);

/** POST /api/v1/updateemploymenthistory — update an existing employment history entry. */
export const updateEmploymentHistory = (payload: EmploymentHistory) =>
  postEmploymentHistory('updateemploymenthistory', payload);

/** POST /api/v1/deleteemploymenthistory — delete an employment history entry. */
export const deleteEmploymentHistory = (payload: { employmentHistoryId: number; userId: number }) =>
  postEmploymentHistory('deleteemploymenthistory', payload);
