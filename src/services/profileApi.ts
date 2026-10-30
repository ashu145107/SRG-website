/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi, getApiBaseUrl } from './baseApi';
import { store } from '../store';
import { EmploymentHistory, MyProfile, UserRole } from '../types';

/**
 * Build a /api/v1 URL. In development this stays relative so requests go
 * through the local Vite/Express proxy, which forwards them to the backend and
 * avoids browser CORS (the backend's error responses omit CORS headers, which
 * otherwise surface as a misleading "Failed to fetch").
 */
const apiV1 = (path: string): string => `${getApiBaseUrl()}/api/v1/${path}`;

/**
 * Cache-busting version for uploaded profile images. The backend serves a
 * picture from a stable URL, so browsers keep showing the previous cached
 * image after an upload until a hard refresh. Bumping this version (and
 * refetching the profile) appends a fresh query param so the new image is
 * displayed immediately without a page reload.
 */
let profileMediaVersion = '';

/** Force the next profile fetch to produce fresh, non-cached image URLs. */
export const bustProfileImageCache = () => {
  profileMediaVersion = String(Date.now());
};

const withMediaVersion = (url?: string): string => {
  if (!url || !profileMediaVersion) return url || '';
  return `${url}${url.includes('?') ? '&' : '?'}v=${profileMediaVersion}`;
};

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
    ? `${getApiBaseUrl()}${picRaw.toString().startsWith('/') ? '' : '/'}${picRaw}`
    : picRaw;
  const address = personal.address || raw.address || '';
  const district = typeof personal.district === 'string' ? personal.district : raw.district || '';
  const city = personal.city || raw.city || '';
  const dob = personal.dob || raw.dob || '';
  const gender = personal.gender || raw.gender || '';
  const state = personal.state || personal.stateName || raw.state || raw.stateName || '';
  const stateId = personal.stateId ?? raw.stateId ?? 0;
  const districtId = personal.districtId ?? raw.districtId ?? 0;
  const talukaRaw = personal.taluka || personal.talukaName || raw.taluka || raw.talukaName || '';
  // Guard against a backend data-mapping bug where the state name (e.g. "Maharashtra")
  // is returned in the taluka field — such a value is not a taluka, so drop it.
  const taluka =
    talukaRaw && state && String(talukaRaw).trim().toLowerCase() === String(state).trim().toLowerCase()
      ? ''
      : talukaRaw;
  const talukaId = personal.talukaId ?? raw.talukaId ?? 0;
  const maritalStatus = personal.maritalStatus || raw.maritalStatus || '';
  const pincode = personal.pincode || raw.pincode || '';
  const qualification = education.education || raw.qualification || raw.education || '';
  const educationInfoId = education.id ?? raw.educationInfoId ?? 0;
  const educationId = education.educationId ?? raw.educationId ?? 0;
  const specializationId = education.specializationId ?? raw.specializationId ?? 0;
  const specialization = education.specialization || raw.specialization || '';
  const courses = education.courses || raw.courses || '';
  const expectation = education.expectation ?? raw.expectation ?? null;
  const currentSalary = education.currentSalary ?? raw.currentSalary ?? null;
  const noticePeriod = education.noticePeriod ?? raw.noticePeriod ?? null;
  const preferredJobLocations = education.preferredJobLocations ?? raw.preferredJobLocations ?? null;
  const preferredJobTypeId = education.preferredJobTypeId ?? raw.preferredJobTypeId ?? null;
  const jobType = education.jobType ?? raw.jobType ?? null;
  const preferredShiftId = education.preferredShiftId ?? raw.preferredShiftId ?? null;
  const shiftType = education.shiftType ?? raw.shiftType ?? null;
  const workStatus = education.workStatus ?? raw.workStatus ?? null;
  const resumeHeadline = education.resumeHeadline ?? raw.resumeHeadline ?? null;
  const profileSummary = education.profileSummary ?? raw.profileSummary ?? null;
  const experienceYears = education.experience ?? raw.experienceYears ?? raw.experience ?? 0;
  const skills = education.skill
    ? education.skill.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(raw.skills) ? raw.skills : typeof raw.skills === 'string' ? raw.skills.split(',').map((s: string) => s.trim()) : [];
  const resumeRaw = education.resume_File_Path || raw.resumeUrl || raw.resumeFileName || '';
  // Prepend base URL if the path is relative (e.g. /Uploads/Resume/...)
  const resumeUrl = resumeRaw && !resumeRaw.startsWith('http')
    ? `${getApiBaseUrl()}${resumeRaw.startsWith('/') ? '' : '/'}${resumeRaw}`
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
    dob,
    gender,
    state,
    stateId,
    districtId,
    taluka,
    talukaId,
    maritalStatus,
    pincode,
    qualification,
    educationInfoId,
    educationId,
    education: qualification,
    specializationId,
    specialization,
    courses,
    expectation,
    currentSalary,
    noticePeriod,
    preferredJobLocations,
    preferredJobTypeId,
    jobType,
    preferredShiftId,
    shiftType,
    workStatus,
    resumeHeadline,
    profileSummary,
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
            ? apiV1('company/myprofile')
            : apiV1('myprofile');

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

          const profile = normalizeProfile(data);
          profile.profilePicUrl = withMediaVersion(profile.profilePicUrl);
          return { data: profile };
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
 * Upload profile picture via POST /api/v1/profilepic
 * Same endpoint for job seekers and employers — auth tokens come from the logged-in user.
 * Routed through getApiBaseUrl() so dev uses the local proxy (avoids browser CORS).
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
    const res = await fetch(apiV1('profilepic'), {
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

    // Only treat as failure when the backend explicitly marks it as one.
    // Some success responses still carry an `error` field (e.g. { code: "error" }),
    // so the mere presence of `error` must NOT be interpreted as a failure.
    if (data?.isSuccess === false || data?.isFailure === true) {
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
 * Upload resume via POST /api/v1/resume
 * Routed through getApiBaseUrl() so dev uses the local proxy (avoids browser CORS).
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
    const res = await fetch(apiV1('resume'), {
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

    // Only treat as failure when the backend explicitly marks it as one.
    // Some success responses still carry an `error` field (e.g. { code: "error" }),
    // so the mere presence of `error` must NOT be interpreted as a failure.
    if (data?.isSuccess === false || data?.isFailure === true) {
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
 * Generic JSON POST helper for profile endpoints (employment history, personal
 * info, etc.). Always attaches the auth token (Authorization + token headers)
 * before calling and only treats a response as failed when the backend
 * explicitly marks it as one.
 */
const postProfileJson = async (
  path: string,
  body: unknown,
  fallbackSuccessMessage: string,
  fallbackErrorMessage = 'Failed to submit request.',
): Promise<{ success: boolean; message: string; data?: any }> => {
  const { cleanToken, role } = readAuth();

  try {
    console.log(`[profileApi] ${path} POST | token present: ${!!cleanToken} | role: ${role}`);
    console.log(`[profileApi] ${path} payload:`, body);

    const res = await fetch(apiV1(path), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'token': cleanToken || '',
      },
      body: JSON.stringify(body),
    });

    // Read raw text first so non-JSON error bodies (e.g. IIS 500 HTML pages)
    // are preserved for diagnostics instead of throwing inside res.json().
    const rawText = await res.text();
    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (e) {
      data = null;
    }
    console.log(`[profileApi] ${path} response:`, res.status, data || rawText.slice(0, 400));

    if (!res.ok) {
      const snippet = rawText && rawText.trim() ? rawText.trim().slice(0, 200) : '';
      const msg = data?.message || data?.error?.message
        || (typeof data === 'string' && data ? data : null)
        || (snippet ? `Server returned ${res.status}. ${snippet}` : `Server returned ${res.status}`);
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

    let msg: string = '';
    if (typeof data?.message === 'string' && data.message.trim()) msg = data.message.trim();
    if (!msg && typeof data?.resultMessage === 'string' && data.resultMessage.trim()) msg = data.resultMessage.trim();
    if (!msg && typeof val === 'string' && val.trim()) msg = val.trim();
    if (!msg && typeof val?.message === 'string' && val.message.trim()) msg = val.message.trim();
    if (!msg && typeof val?.resultMessage === 'string' && val.resultMessage.trim()) msg = val.resultMessage.trim();
    if (!msg) msg = fallbackSuccessMessage;

    return { success: true, message: msg, data: val };
  } catch (err: any) {
    console.error(`[profileApi] ${path} failed:`, err);
    return { success: false, message: err.message || fallbackErrorMessage };
  }
};

/** Employment-history endpoints share the generic JSON POST helper. */
const postEmploymentHistory = (path: string, body: unknown) => {
  const fallback = path === 'deleteemploymenthistory'
    ? 'Employment history deleted successfully.'
    : path === 'updateemploymenthistory'
      ? 'Employment history updated successfully.'
      : 'Employment history added successfully.';
  return postProfileJson(path, body, fallback, 'Failed to submit employment history.');
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

/** Payload accepted by POST /api/v1/updateuserpersonalinfo. */
export interface UpdateUserPersonalInfoPayload {
  userId: number;
  fullName: string;
  mobile: string;
  email: string;
  profilePic: string;
  dob: string | null;
  gender: string;
  address: string;
  stateId: number;
  state: string;
  districtId: number;
  district: string;
  talukaId: number;
  taluka: string;
  maritalStatus: string;
  pincode: string;
}

/** POST /api/v1/updateuserpersonalinfo — update the logged-in user's personal details. */
export const updateUserPersonalInfo = (payload: UpdateUserPersonalInfoPayload) =>
  postProfileJson(
    'updateuserpersonalinfo',
    payload,
    'Personal information updated successfully.',
    'Failed to update personal information.',
  );

/** Payload accepted by POST /api/v1/updateusereducationinfo. */
export interface UpdateUserEducationInfoPayload {
  id: number;
  userId: number;
  educationId: number;
  education: string;
  specializationId: number;
  specialization: string;
  skill: string;
  courses: string;
  experience: number;
  expectation: number | null;
  resume_File_Path: string;
  currentSalary: number | null;
  noticePeriod: number | null;
  preferredJobLocations: string;
  preferredJobTypeId: number;
  jobType: string;
  preferredShiftId: number;
  shiftType: string;
  workStatus: string;
  resumeHeadline: string;
  profileSummary: string;
}

/** POST /api/v1/updateusereducationinfo — update the logged-in user's education details. */
export const updateUserEducationInfo = (payload: UpdateUserEducationInfoPayload) =>
  postProfileJson(
    'updateusereducationinfo',
    payload,
    'Education information updated successfully.',
    'Failed to update education information.',
  );

/**
 * Record that an employer/admin downloaded a candidate's resume.
 * This is fire-and-forget: the endpoint may not be deployed yet, so every
 * failure (network, 404, non-JSON error page) is swallowed so the browser
 * download is never blocked.
 */
export const logProfileDownload = async (payload: {
  candidateId: string;
  role?: UserRole | string;
}): Promise<void> => {
  try {
    const { cleanToken } = readAuth();
    const numericId = Number(payload.candidateId);
    await fetch(apiV1('logprofiledownload'), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'token': cleanToken || '',
      },
      body: JSON.stringify({
        candidateId: Number.isNaN(numericId) ? payload.candidateId : numericId,
        role: payload.role || '',
      }),
    });
  } catch (err) {
    // Intentionally silent — logging must never interrupt the download flow.
    console.debug('[profileApi] logProfileDownload skipped:', err);
  }
};
