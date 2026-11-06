/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  HANDLER = 'HANDLER',
  COMPANY = 'COMPANY',
  CANDIDATE = 'CANDIDATE',
  SHG = 'SHG'
}

export interface HandlerPermissions {
  canViewUsers: boolean;
  canEditUsers: boolean;
  canApproveJobs: boolean;
  canManageCompanies: boolean;
  canManageSHG: boolean;
  canViewReports: boolean;
  canManageContent: boolean;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  token?: string;
  // Dynamic handler permissions
  handlerPermissions?: HandlerPermissions;
  // Specific reference ids
  companyId?: string;
  candidateId?: string;
  shgId?: string;
}

export interface CandidateProfile {
  id?: string;
  userId?: string;
  fullName?: string;
  candidateName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  city?: string;
  district?: string;
  talukaName?: string;
  stateName?: string;
  address?: string;
  qualification?: string;
  education?: string;
  educationId?: number;
  specializationId?: number;
  experienceYears?: number;
  experience?: number;
  specialization?: string;
  courses?: string;
  resumeHeadline?: string;
  profileSummary?: string;
  preferredJobLocations?: string;
  preferredJobTypeId?: number | null;
  jobType?: string;
  preferredShiftId?: number | null;
  shiftType?: string;
  workStatus?: string;
  currentSalary?: number | null;
  expectation?: number | null;
  noticePeriod?: number | null;
  skills?: string[];
  resumeUrl?: string;
  resumeName?: string;
  profilePicUrl?: string;
  employmentHistory?: EmploymentHistory[];
}

export interface EmploymentHistory {
  employmentHistoryId?: number;
  userId?: number;
  companyName?: string;
  companyIndustryId?: number | null;
  industryTypeName?: string;
  designation?: string;
  department?: string;
  jobTypeId?: number | null;
  jobTypeName?: string;
  jobLocation?: string;
  startDate?: string;
  endDate?: string;
  isCurrentJob?: boolean;
}

export interface MyProfile {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  profilePicUrl?: string;
  resumeUrl?: string;
  resumeName?: string;
  city?: string;
  district?: string;
  address?: string;
  dob?: string;
  gender?: string;
  state?: string;
  stateId?: number;
  districtId?: number;
  taluka?: string;
  talukaId?: number;
  maritalStatus?: string;
  pincode?: string;
  qualification?: string;
  educationInfoId?: number;
  educationId?: number;
  education?: string;
  specializationId?: number;
  specialization?: string;
  courses?: string;
  expectation?: string | null;
  currentSalary?: number | null;
  noticePeriod?: string | null;
  preferredJobLocations?: string | null;
  preferredJobTypeId?: number | null;
  jobType?: string | null;
  preferredShiftId?: number | null;
  shiftType?: string | null;
  workStatus?: string | null;
  resumeHeadline?: string | null;
  profileSummary?: string | null;
  experienceYears?: number;
  skills?: string[];
  companyName?: string;
  contactPerson?: string;
  industry?: string;
  isApproved?: boolean;
  employmentHistory?: EmploymentHistory[];
}

export interface CompanyProfile {
  id?: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  industry?: string;
  address?: string;
  isApproved?: boolean;
}

export interface SHGProfile {
  id: string;
  shgName: string;
  leaderName: string;
  phone: string;
  district: string;
  memberCount: number;
  activities: string[];
  productShowcase: SHGProduct[];
}

export interface SHGProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  salary: string;
  description: string;
  requirements: string[];
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  category: string;
  createdAt: string;
  isApproved: boolean;
  jobCode?: string;
  userJobStatus?: string;
  /** API fields from /myrequirements */
  profileHeader?: string;
  skill?: string;
  workPlace?: string;
  email?: string;
  apiData?: import('./services/jobTypes').JobRequirement;
}

export interface JobApplication {
  id: string;
  applicationId?: number;
  statusId?: number;
  statusCode?: string;
  applicationStatusHistoryId?: number;
  jobId: string;
  jobCode?: string;
  jobTitle: string;
  companyName: string;
  companyId: string;
  candidateId: string;
  candidateName: string;
  candidatePhone: string;
  status: string;
  remarks?: string;
  appliedAt: string;
  interviewDate?: string;
  rawItem?: any;
}

export interface JobApplicationStatus {
  id: number;
  statusId?: number;
  statusCode?: string;
  statusName?: string;
  name: string;
  description?: string;
  sortOrder?: number;
  isFinalStatus?: boolean;
}

export interface Initiative {
  id: string;
  titleEn: string;
  titleMr: string;
  descriptionEn: string;
  descriptionMr: string;
  type: 'upcoming' | 'past';
  date: string;
  locationEn: string;
  locationMr: string;
}

export interface Training {
  id: string;
  titleEn: string;
  titleMr: string;
  descriptionEn: string;
  descriptionMr: string;
  duration: string;
  instructor: string;
  startDate: string;
}

export interface SuccessStory {
  id: string;
  nameEn: string;
  nameMr: string;
  titleEn?: string;
  titleMr?: string;
  storyEn: string;
  storyMr: string;
  roleEn: string;
  roleMr: string;
  imageUrl?: string;
}
