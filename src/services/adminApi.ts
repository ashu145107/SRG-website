/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { baseApi, getApiBaseUrl, getClientIp } from './baseApi';
import { CompanyProfile, CandidateProfile, JobApplication } from '../types';
import { JobRequirement } from './jobTypes';

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

/**
 * Parse API response and extract paginated data
 * Supports multiple API response formats
 */
const parsePaginatedResponse = <T>(
  data: any
): PaginatedResponse<T> => {
  let list: T[] = [];
  let totalCount = 0;

  if (!data) {
    return { items: [], totalCount: 0 };
  }

  // Handle different response formats from API
  const value = data.value !== undefined ? data.value : data;

  if (Array.isArray(value)) {
    list = value;
    totalCount = value.length;
  } else if (value && typeof value === 'object') {
    const possibleArrays = [value.data, value.items, value.list, value.records, value.results, value.rows];
    let foundArr = possibleArrays.find(arr => Array.isArray(arr));

    if (!foundArr) {
      // Last resort: scan the value object for any array property
      foundArr = Object.values(value).find(v => Array.isArray(v)) as T[] | undefined;
    }
    if (foundArr) {
      list = foundArr;
    }
    // Check for total count with priority order: totalRecords, totalCount, total, count
    totalCount = typeof value.totalRecords === 'number' ? value.totalRecords :
                 typeof value.totalCount === 'number' ? value.totalCount :
                 typeof value.total === 'number' ? value.total :
                 typeof value.count === 'number' ? value.count : list.length;
  }

  console.log('📊 Parsed Response:', { itemsCount: list.length, totalCount, rawData: data });
  return { items: list || [], totalCount: totalCount || 0 };
};

/**
 * Normalize raw job application API items into the JobApplication shape
 * the UI tables use, handling multiple backend field names.
 */
const normalizeApplication = (item: any, index: number): JobApplication => {
  const rawId = item.id || item.jobApplicationId || item.appliedJobId || `app-${Date.now()}-${index}`;
  return {
    id: String(rawId),
    jobId: String(item.jobId || item.jobRequirementId || item.jobCode || item.jobPostingId || ''),
    jobTitle: item.jobTitle || item.jobDesignation || item.profileHeader || item.title || 'Untitled Job',
    companyName: item.companyName || item.company || '',
    companyId: String(item.companyId || ''),
    candidateId: String(item.candidateId || item.userId || ''),
    candidateName: item.candidateName || item.fullName || item.name || 'Candidate',
    candidatePhone: item.candidatePhone || item.phone || item.mobile || '',
    status: (item.status || 'Applied') as JobApplication['status'],
    appliedAt: item.appliedAt || item.createdDate || item.applicationDate || new Date().toISOString().split('T')[0],
    interviewDate: item.interviewDate || undefined
  };
};

/**
 * Normalize raw user-registration API items into the CandidateProfile shape
 * the admin tables use, handling multiple backend field names.
 */
const normalizeUser = (item: any): CandidateProfile => {
  if (!item || typeof item !== 'object') return {};

  const personal = item.personalInfo || item.candidate || item;
  const education = item.educationInfo || item.candidate || item;

  const toStr = (v: any): string => (v === undefined || v === null ? '' : String(v).trim());
  const toNum = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const experienceVal = education.experience ?? education.experienceYears ?? item.experience ?? item.experienceYears ?? 0;
  const specializationVal = education.specialization
    ?? education.specializationName
    ?? education.subEducationName
    ?? item.specialization
    ?? item.specializationName
    ?? item.subEducationName
    ?? item.subEducation
    ?? '';

  const skillsRaw = education.skill ?? education.skills ?? item.skills;
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw.map((s: any) => toStr(s)).filter(Boolean)
    : typeof skillsRaw === 'string'
      ? skillsRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

  const picRaw = personal.profilePic || personal.profilePicUrl || personal.photoUrl || personal.photo || personal.image ||
    personal.picPath || personal.pic_File_Path || personal.profilePic_File_Path || personal.photo_File_Path ||
    item.profilePicUrl || item.profileImage || item.photoUrl || item.avatarUrl || item.profilePic || item.photo || item.image ||
    item.picPath || item.pic_File_Path || item.profilePic_File_Path || item.photo_File_Path || '';
  const profilePicUrl = picRaw && !String(picRaw).startsWith('http')
    ? `https://srgapp.dindoripranit.org${String(picRaw).startsWith('/') ? '' : '/'}${picRaw}`
    : String(picRaw);

  // Employment history array included in the viewcandidateprofile payload.
  const employmentHistory = (Array.isArray(item.employmentHistory) ? item.employmentHistory : [])
    .map((h: any) => ({
      employmentHistoryId: h.employmentHistoryId ?? h.id ?? 0,
      userId: h.userId ?? 0,
      companyName: toStr(h.companyName || h.company),
      companyIndustryId: h.companyIndustryId ?? null,
      industryTypeName: toStr(h.industryTypeName || h.industryType || h.companyIndustryName),
      designation: toStr(h.designation || h.jobDesignation),
      department: toStr(h.department),
      jobTypeId: h.jobTypeId ?? null,
      jobTypeName: toStr(h.jobTypeName || h.jobType),
      jobLocation: toStr(h.jobLocation || h.jobPlace || h.workPlace),
      startDate: toStr(h.startDate),
      endDate: toStr(h.endDate),
      isCurrentJob: !!h.isCurrentJob,
    }));

  return {
    id: String(personal.userId || item.userId || item.id || item.candidateId || ''),
    userId: toStr(item.userId || item.id || personal.userId),
    fullName: toStr(personal.fullName || item.fullName || item.candidateName || item.name),
    email: toStr(personal.email || item.email),
    phone: toStr(personal.mobile || personal.mobileNo || personal.mobileNumber || personal.phoneNumber || personal.contactNumber || item.phone || item.mobile),
    mobile: toStr(personal.mobile || personal.mobileNo || personal.mobileNumber || personal.phoneNumber || personal.contactNumber || item.phone || item.mobile),
    city: toStr(personal.city || item.city || education.talukaName || item.talukaName || personal.districtName || item.districtName || personal.district || item.district),
    district: toStr(personal.districtName || personal.district || item.districtName || item.district),
    talukaName: toStr(personal.talukaName || item.talukaName),
    stateName: toStr(personal.stateName || item.stateName),
    address: toStr(personal.address || item.address),
    qualification: toStr(education.education || education.qualification || item.qualification || item.education),
    education: toStr(education.education || item.education || item.qualification),
    experienceYears: toNum(experienceVal),
    experience: toNum(experienceVal),
    specialization: toStr(specializationVal),
    skills,
    resumeUrl: toStr(education.resume_File_Path || item.resumeUrl || item.resume_File_Path || item.resumeFilePath || item.resumeFileName || item.resume),
    resumeName: toStr(education.resumeName || item.resumeName || item.resumeFileName),
    employmentHistory,
    profilePicUrl,
  };
};

/**
 * Normalize raw job-requirement API items so `id` (the requirement id used
 * by detail/application endpoints) is always resolved, regardless of which
 * field name the backend returns.
 */
const normalizeJobRequirement = (item: any, index: number): any => {
  if (!item || typeof item !== 'object') return item;
  const rawId = item.id || item.jobRequirementId || item.jobId;
  const numId = typeof rawId === 'number'
    ? rawId
    : typeof rawId === 'string'
      ? (parseInt(String(rawId).replace(/\D/g, ''), 10) || index + 1)
      : index + 1;
  return {
    ...item,
    id: numId,
    jobRequirementId: numId,
  };
};

/**
 * Normalize raw company-registration API items into the CompanyProfile shape,
 * handling multiple backend field names (especially phone/mobile which differ
 * across the API and previously rendered blank in the admin table).
 */
const normalizeCompany = (item: any): CompanyProfile => {
  if (!item || typeof item !== 'object') return {};
  const toStr = (v: any): string => (v === undefined || v === null ? '' : String(v).trim());
  const phoneVal = item.mobile ?? item.phone ?? item.phoneNumber ?? item.mobileNo ?? item.mobile_number ?? item.contactNumber ?? item.cellPhone;
  return {
    id: toStr(item.companyId || item.userId || item.id || item.companyRegistrationId),
    companyName: toStr(item.companyName || item.companyname || item.name || item.company_Name),
    contactPerson: toStr(item.contactPerson || item.contactperson || item.personName || item.ownerName || item.contactName),
    email: toStr(item.email || item.companyEmail || item.company_Email),
    phone: toStr(phoneVal),
    mobile: toStr(phoneVal),
    website: toStr(item.website || item.webSiteUrl || item.websiteUrl),
    industry: toStr(item.industry || item.industryType || item.sector || item.industryName),
    address: toStr(item.address || item.companyAddress || item.company_Address),
    isApproved: !!item.isApproved,
  };
};

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminCompanies: builder.query<PaginatedResponse<CompanyProfile>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/companyregistration/${pageSize}/${pageNumber}`);
          if (result.data) {
            const parsed = parsePaginatedResponse<any>(result.data);
            return {
              data: {
                items: parsed.items.map(normalizeCompany),
                totalCount: parsed.totalCount,
              },
            };
          }
          if (result.error) {
            console.error('getAdminCompanies API error:', result.error);
            return { error: result.error };
          }
        } catch (err) {
          console.error('getAdminCompanies API failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
      },
      providesTags: ['Company']
    }),

    getAdminUsers: builder.query<PaginatedResponse<CandidateProfile>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/userregistration/${pageSize}/${pageNumber}`);
          if (result.data) {
            const parsed = parsePaginatedResponse<any>(result.data);
            return {
              data: {
                items: parsed.items.map(normalizeUser),
                totalCount: parsed.totalCount,
              },
            };
          }
          if (result.error) {
            console.error('getAdminUsers API error:', result.error);
            return { error: result.error };
          }
        } catch (err) {
          console.error('getAdminUsers API failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
      },
      providesTags: ['Candidate']
    }),

    getAdminJobRequirements: builder.query<PaginatedResponse<JobRequirement>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/jobrequirements/${pageSize}/${pageNumber}`);
          if (result.data) {
            const parsed = parsePaginatedResponse<any>(result.data);
            return {
              data: {
                items: parsed.items.map(normalizeJobRequirement),
                totalCount: parsed.totalCount,
              },
            };
          }
          if (result.error) {
            console.error('getAdminJobRequirements API error:', result.error);
            return { error: result.error };
          }
        } catch (err) {
          console.error('getAdminJobRequirements API failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
      },
      providesTags: ['Job']
    }),

    getAdminJobApplications: builder.query<PaginatedResponse<JobApplication>, { pageSize: number; pageNumber: number }>({
      queryFn: async ({ pageSize, pageNumber }, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/jobapplications/${pageSize}/${pageNumber}`);
          if (result.data) {
            const parsed = parsePaginatedResponse<any>(result.data);
            return {
              data: {
                items: parsed.items.map(normalizeApplication),
                totalCount: parsed.totalCount,
              },
            };
          }
          if (result.error) {
            console.error('getAdminJobApplications API error:', result.error);
          }
          return { data: { items: [], totalCount: 0 } };
        } catch (err) {
          console.error('getAdminJobApplications API failed:', err);
          return { data: { items: [], totalCount: 0 } };
        }
      },
      providesTags: ['Application']
    }),

    getRequirementDetail: builder.query<{ items: any[]; job: any; totalCount: number }, number | string>({
      queryFn: async (requirementId, api, extraOptions, baseQuery) => {
        try {
          const result = await baseQuery(`/api/v1/jobapplicationsforrequirment/${requirementId}`);
          if (result.data) {
            const value = (result.data as any).value !== undefined ? (result.data as any).value : result.data;
            let items: any[] = [];
            let job: any = null;
            if (Array.isArray(value)) {
              items = value;
            } else if (value && typeof value === 'object') {
              job = value.jobRequirement || value.requirement || value.job || null;
              const possibleArrays = [value.data, value.items, value.list, value.applications, value.records, value.results, value.rows];
              const foundArr = possibleArrays.find((arr) => Array.isArray(arr))
                || (Object.values(value).find((v) => Array.isArray(v)) as any[] | undefined);
              if (foundArr) items = foundArr;
            }
            return { data: { items, job, totalCount: Array.isArray(items) ? items.length : 0 } };
          }
          if (result.error) {
            console.error('getRequirementDetail API error:', result.error);
            return { error: result.error };
          }
        } catch (err) {
          console.error('getRequirementDetail API failed:', err);
          return { error: { status: 'FETCH_ERROR', error: String(err) } };
        }
        return { data: { items: [], job: null, totalCount: 0 } };
      },
      providesTags: (result, error, arg) => [{ type: 'Job', id: String(arg) }]
    }),

    getAdminCompanyDetail: builder.query<CompanyProfile | null, string>({
      queryFn: async (companyId, api, extraOptions, baseQuery) => {
        try {
          // 1) Try the dedicated single-company endpoint first.
          const single = await baseQuery(`/api/v1/viewcompanyprofile/${companyId}`);
          if (single.data) {
            const raw = (single.data as any).value ?? (single.data as any).data ?? single.data;
            return { data: normalizeCompany(raw) || null };
          }
        } catch (err) {
          console.error('[adminApi] getAdminCompanyDetail single fetch failed:', err);
        }
        try {
          // 2) Fallback: scan the company list page for a matching id.
          const listResult = await baseQuery(`/api/v1/companyregistration/100/1`);
          if (listResult.data) {
            const parsed = parsePaginatedResponse<any>(listResult.data);
            const found = parsed.items
              .map(normalizeCompany)
              .find((c: any) => String(c.id || '') === String(companyId));
            if (found) return { data: found };
            return { data: null };
          }
        } catch (err) {
          console.error('[adminApi] getAdminCompanyDetail list fallback failed:', err);
        }
        return { data: null };
      },
      providesTags: (result, error, arg) => [{ type: 'Company', id: String(arg) }]
    }),

    /**
     * GET candidate detail for admin view.
     * 1) Try viewcandidateprofile/{id} (returns the full nested profile).
     * 2) Fallback: scan the user registration list which includes resume fields.
     */
    getAdminCandidateDetail: builder.query<CandidateProfile | null, string>({
      queryFn: async (candidateId, api, extraOptions, baseQuery) => {
        try {
          const single = await baseQuery(`/api/v1/viewcandidateprofile/${candidateId}`);
          if (single.data) {
            const raw = (single.data as any).value ?? (single.data as any).data ?? single.data;
            const normalized = normalizeUser(raw);
            console.log('[adminApi] getAdminCandidateDetail viewcandidateprofile result:', normalized);
            // If the single endpoint returned resume data, we're done.
            if (normalized.resumeUrl) return { data: normalized };
            // Otherwise still return the data (just without resume) and let the fallback augment.
            return { data: normalized };
          }
        } catch (err) {
          console.error('[adminApi] getAdminCandidateDetail viewcandidateprofile failed:', err);
        }
        try {
          // Fallback: search the paginated user list for a matching candidate.
          // Scan up to 500 users (multiple pages of 100) to find the match.
          for (let page = 1; page <= 5; page++) {
            const listResult = await baseQuery(`/api/v1/userregistration/100/${page}`);
            if (!listResult.data) break;
            const parsed = parsePaginatedResponse<any>(listResult.data);
            const found = parsed.items
              .map(normalizeUser)
              .find((u: any) => String(u.id || u.userId || '') === String(candidateId));
            if (found) {
              console.log('[adminApi] getAdminCandidateDetail list fallback found:', found);
              return { data: found };
            }
            // Stop scanning if we've exhausted all pages.
            if (parsed.items.length < 100) break;
          }
        } catch (err) {
          console.error('[adminApi] getAdminCandidateDetail list fallback failed:', err);
        }
        return { data: null };
      },
      providesTags: (result, error, arg) => [{ type: 'Candidate', id: String(arg) }]
    }),

    addCompany: builder.mutation<
      { isSuccess: boolean; message?: string; companyId?: string },
      {
        fullname: string;
        mobile: string;
        address: string;
        email: string;
        talukaId?: number;
        districtId?: number;
        stateId?: number;
        contactPerson: string;
        alternateContactPerson?: string;
        alternateContactNumber?: string;
        companyTypeId: number;
        industryTypeId: number;
        discription?: string;
        website?: string;
        alternateEmail?: string;
        createdIp?: string;
      }
    >({
      queryFn: async (payload) => {
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
            createdIp: clientIp || payload.createdIp || '0.0.0.0',
            contactPerson: payload.contactPerson,
            alternateContactPerson: payload.alternateContactPerson || '',
            alternateContactNumber: payload.alternateContactNumber || '',
            companyTypeId: Number(payload.companyTypeId) || 1,
            industryTypeId: Number(payload.industryTypeId) || 1,
            discription: payload.discription || '',
            website: payload.website || '',
            alternateEmail: payload.alternateEmail || ''
          };

          const res = await fetch(`${getApiBaseUrl()}/api/v1/companyregistration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(apiBody)
          });

          if (!res.ok) {
            return {
              error: {
                status: res.status,
                data: `कंपनी नोंदणी सर्व्हर त्रुटी / Company registration failed. Status: ${res.status}`
              }
            };
          }

          const data = await res.json();
          if (data && data.isSuccess) {
            return {
              data: {
                isSuccess: true,
                message: data.message || data.resultMessage || 'कंपनी यशस्वीरित्या नोंदणी केली! / Company registered successfully!',
                companyId: String(data.companyId || data.id || data.companyRegistrationId || '')
              }
            };
          }

          const errMsg = data?.error?.message || data?.message || 'कंपनी नोंदणी अयशस्वी. / Company registration failed.';
          return { error: { status: 400, data: String(errMsg) } };
        } catch (err: any) {
          return {
            error: {
              status: 500,
              data: `कंपनी नोंदणी नेटवर्क त्रुटी / Company registration Network Error: ${err?.message || err}`
            }
          };
        }
      },
      invalidatesTags: ['Company']
    })
  })
});

export const {
  useGetAdminCompaniesQuery,
  useGetAdminUsersQuery,
  useGetAdminJobRequirementsQuery,
  useGetAdminJobApplicationsQuery,
  useGetRequirementDetailQuery,
  useGetAdminCompanyDetailQuery,
  useGetAdminCandidateDetailQuery,
  useAddCompanyMutation
} = adminApi;
